import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getSmsProvider, normalizePhone, renderTemplate } from "../_shared/sms-providers.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BATCH_SIZE = 20;
const VISIBILITY_TIMEOUT_S = 60;
const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Two legitimate callers: the database cron wake (Lovable-Context: cron plus
  // the internal worker token) and signed-in admins triggering a manual drain.
  // The Lovable-Context header alone is spoofable, so cron callers must also
  // present the random token stored in sms_internal_config.
  const isCronWake = (req.headers.get("Lovable-Context") || "").toLowerCase() === "cron";
  if (isCronWake) {
    const presented = req.headers.get("X-SMS-Worker-Token") || "";
    const { data: cfg } = await service
      .from("sms_internal_config")
      .select("value")
      .eq("key", "worker_token")
      .maybeSingle();
    if (!cfg?.value || presented !== cfg.value) {
      return json({ error: "Forbidden" }, 403);
    }
  } else {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: userData } = token ? await service.auth.getUser(token) : { data: { user: null } };
    if (!userData?.user) return json({ error: "Authentication required" }, 401);
    const { data: roleRow } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Admin access required" }, 403);
  }

  try {
    const { data: providerRow } = await service
      .from("sms_providers")
      .select("*")
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: batch, error: readErr } = await service.rpc("read_email_batch", {
      queue_name: "sms_queue",
      batch_size: BATCH_SIZE,
      vt: VISIBILITY_TIMEOUT_S,
    });
    if (readErr) {
      // Queue may not exist yet (created lazily on first enqueue)
      if (/does not exist|undefined_table/i.test(readErr.message)) return json({ success: true, processed: 0 });
      return json({ error: readErr.message }, 500);
    }

    const messages = (batch || []) as { msg_id: number; read_ct: number; message: Record<string, unknown> }[];
    if (messages.length === 0) return json({ success: true, processed: 0 });

    const { data: rules } = await service.from("sms_automation_rules").select("*, template:sms_templates(*)").eq("is_active", true);
    const { data: suppressions } = await service.from("sms_suppressions").select("phone");
    const suppressed = new Set((suppressions || []).map((s) => normalizePhone(s.phone)));

    let processed = 0;
    let failed = 0;

    for (const item of messages) {
      const payload = item.message || {};
      const triggerEvent = String(payload.trigger_event || "");
      const phone = normalizePhone(String(payload.phone || ""));
      const rule = (rules || []).find((r) => r.trigger_event === triggerEvent);

      const finish = async () => {
        await service.rpc("delete_email", { queue_name: "sms_queue", message_id: item.msg_id });
        processed++;
      };

      if (!phone || !rule || !rule.template) {
        // Nothing actionable: no phone, rule disabled/removed, or template deleted.
        await finish();
        continue;
      }
      if (suppressed.has(phone)) {
        await finish();
        continue;
      }

      const bodyText = renderTemplate(rule.template.body, payload as Record<string, unknown>);

      if (!providerRow || !providerRow.api_key) {
        // Provider not configured yet: keep the message for retry until attempts run out.
        if (item.read_ct >= MAX_ATTEMPTS) {
          await service.from("sms_messages").insert({
            phone,
            contact_name: (payload.name as string) ?? null,
            body: bodyText,
            message_type: "transactional",
            source: "automation",
            status: "failed",
            error_message: "No configured SMS provider",
          });
          await finish();
        }
        continue;
      }

      try {
        const provider = getSmsProvider(providerRow);
        const res = await provider.sendSms(phone, bodyText, "transactional");
        await service.from("sms_messages").insert({
          phone,
          contact_name: (payload.name as string) ?? null,
          body: bodyText,
          message_type: "transactional",
          source: "automation",
          provider_key: providerRow.provider_key,
          provider_message_id: res.providerMessageId ?? null,
          status: res.ok ? "sent" : "failed",
          error_message: res.ok ? null : res.error ?? "Unknown provider error",
          sent_at: res.ok ? new Date().toISOString() : null,
        });
        if (res.ok) {
          await finish();
        } else {
          failed++;
          if (item.read_ct >= MAX_ATTEMPTS) {
            await finish(); // give up; the failed row above is the record
          }
          // otherwise the visibility timeout re-queues it automatically
        }
      } catch (err) {
        failed++;
        console.error("process-sms-queue send error:", err);
        if (item.read_ct >= MAX_ATTEMPTS) await finish();
      }
    }

    return json({ success: true, processed, failed, batch: messages.length });
  } catch (error) {
    console.error("process-sms-queue error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
