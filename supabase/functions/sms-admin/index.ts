import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getSmsProvider, hasSmsProviderKey, normalizePhone, renderTemplate, SmsProviderConfig } from "../_shared/sms-providers.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function requireAdmin(req: Request, service: ReturnType<typeof createClient>) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Authentication required" }, 401) };
  const { data: userData, error: userErr } = await service.auth.getUser(token);
  if (userErr || !userData?.user) return { error: json({ error: "Invalid session" }, 401) };
  const { data: roleRow } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return { error: json({ error: "Admin access required" }, 403) };
  return { userId: userData.user.id };
}

async function audit(service: ReturnType<typeof createClient>, adminUserId: string, action: string, details: unknown) {
  await service.from("sms_audit_log").insert({ admin_user_id: adminUserId, action, details });
}

async function getActiveProvider(service: ReturnType<typeof createClient>) {
  const { data: providers, error } = await service.from("sms_providers").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);
  const primary = (providers || []).find((p) => p.is_primary) || (providers || [])[0];
  if (!primary) throw new Error("No active SMS provider configured");
  if (!hasSmsProviderKey(primary)) throw new Error(`${primary.display_name} API key is not configured yet`);
  return primary;
}

async function getSuppressedPhones(service: ReturnType<typeof createClient>): Promise<Set<string>> {
  const { data } = await service.from("sms_suppressions").select("phone");
  return new Set((data || []).map((r) => normalizePhone(r.phone)));
}

/** Look up the network delivery result and record delivered/failed on the message. */
async function applyDeliveryStatus(
  service: ReturnType<typeof createClient>,
  provider: ReturnType<typeof getSmsProvider>,
  msg: { id: string; phone: string; provider_message_id: string; status: string; delivered_at: string | null },
) {
  const result = await provider.getStatus(msg.provider_message_id, msg.phone);
  if (!result.supported || result.error) return result;
  if (result.outcome === "delivered") {
    await service.from("sms_messages").update({
      status: "delivered", delivered_at: msg.delivered_at ?? new Date().toISOString(), error_message: null,
    }).eq("id", msg.id);
  } else if (result.outcome === "failed") {
    await service.from("sms_messages").update({
      status: "failed",
      error_message: `Network did not deliver (${result.status}). Check this number with BulkSMSNigeria.`,
    }).eq("id", msg.id);
  }
  return result;
}

async function sendToPhones(
  service: ReturnType<typeof createClient>,
  providerRow: SmsProviderConfig & { display_name?: string },
  phones: { phone: string; name?: string | null }[],
  body: string,
  messageType: "transactional" | "marketing",
  source: string,
  campaignId: string | null,
  adminUserId: string | null,
) {
  const provider = getSmsProvider(providerRow);
  const suppressed = await getSuppressedPhones(service);
  const results = { sent: 0, failed: 0, skipped: 0, errors: [] as string[] };

  // Chunk recipients: Termii natively accepts up to 100 per request; other providers
  // are looped one message at a time by their adapter.
  const chunkSize = provider.capabilities.bulkSend ? 100 : 25;
  for (let i = 0; i < phones.length; i += chunkSize) {
    const chunk = phones.slice(i, i + chunkSize).filter((p) => {
      if (suppressed.has(normalizePhone(p.phone))) { results.skipped++; return false; }
      return true;
    });
    if (chunk.length === 0) continue;

    const res = await provider.sendSms(chunk.map((c) => c.phone), body, messageType);
    const now = new Date().toISOString();
    const rows = chunk.map((c) => {
      const phone = normalizePhone(c.phone);
      // Use each recipient's own outcome and message ID when the provider reports them,
      // so one recipient's success is never recorded against another number.
      const r = res.recipients?.find((x) => x.phone === phone);
      const ok = r ? r.ok : res.ok;
      return {
        campaign_id: campaignId,
        phone,
        contact_name: c.name ?? null,
        body,
        message_type: messageType,
        source,
        provider_key: providerRow.provider_key,
        provider_message_id: (r ? r.providerMessageId : res.providerMessageId) ?? null,
        status: ok ? "sent" : "failed",
        error_message: ok ? null : (r?.error ?? res.error ?? "Unknown provider error"),
        created_by: adminUserId,
        sent_at: ok ? now : null,
      };
    });
    await service.from("sms_messages").insert(rows);
    for (const row of rows) {
      if (row.status === "sent") results.sent++;
      else { results.failed++; if (row.error_message) results.errors.push(`${row.phone}: ${row.error_message}`); }
    }
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const auth = await requireAdmin(req, service);
    if ("error" in auth) return auth.error;
    const adminUserId = auth.userId;
    if (!adminUserId) return json({ error: "Authentication required" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    // Global SMS pause switch: block every action that would dispatch messages.
    const SENDING_ACTIONS = new Set(["send_single", "send_bulk", "launch_campaign", "run_due_campaigns"]);
    if (SENDING_ACTIONS.has(action)) {
      const { data: pausedRow } = await service
        .from("sms_internal_config")
        .select("value")
        .eq("key", "sms_paused")
        .maybeSingle();
      if (pausedRow?.value === "true") {
        await audit(service, adminUserId, "send_blocked_paused", { action });
        return json({ error: "SMS sending is paused. No messages will be delivered until it is resumed." }, 423);
      }
    }

    switch (action) {
      case "list_providers": {
        const { data, error } = await service.from("sms_providers").select("*").order("created_at");
        if (error) return json({ error: error.message }, 500);
        return json({
          providers: (data || []).map((p) => ({
            ...p,
            api_key: null,
            has_api_key: hasSmsProviderKey(p),
          })),
        });
      }

      case "save_provider": {
        const { provider_key, api_key, sender_id, base_url, is_active, notes } = body;
        if (!provider_key) return json({ error: "provider_key is required" }, 400);
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (typeof api_key === "string" && api_key.trim() && !api_key.startsWith("••••")) updates.api_key = api_key.trim();
        if (typeof sender_id === "string") updates.sender_id = sender_id.trim() || null;
        if (typeof base_url === "string" && base_url.trim()) updates.base_url = base_url.trim();
        if (typeof is_active === "boolean") updates.is_active = is_active;
        if (typeof notes === "string") updates.notes = notes;
        const { error } = await service.from("sms_providers").update(updates).eq("provider_key", provider_key);
        if (error) return json({ error: error.message }, 500);
        await audit(service, adminUserId, "provider_updated", { provider_key, fields: Object.keys(updates) });
        return json({ success: true });
      }

      case "set_role": {
        // Mark one provider as primary or backup; never switches silently (explicit admin action).
        const { provider_key, role } = body;
        if (!provider_key || !["primary", "backup"].includes(role)) {
          return json({ error: "provider_key and role (primary|backup) are required" }, 400);
        }
        const flag = role === "primary" ? "is_primary" : "is_backup";
        await service.from("sms_providers").update({ [flag]: false }).eq(flag, true);
        const { error } = await service.from("sms_providers").update({ [flag]: true, is_active: true }).eq("provider_key", provider_key);
        if (error) return json({ error: error.message }, 500);
        await audit(service, adminUserId, `provider_set_${role}`, { provider_key });
        return json({ success: true });
      }

      case "test_connection": {
        const { provider_key } = body;
        const { data: row, error } = await service.from("sms_providers").select("*").eq("provider_key", provider_key).single();
        if (error || !row) return json({ error: "Provider not found" }, 404);
        const provider = getSmsProvider(row);
        const result = await provider.testConnection();
        await service.from("sms_providers").update({
          last_check_at: new Date().toISOString(),
          last_check_status: result.ok ? "ok" : "failed",
        }).eq("provider_key", provider_key);
        await audit(service, adminUserId, "provider_test", { provider_key, ok: result.ok, error: result.error ?? null });
        return json(result);
      }

      case "get_balance": {
        const { provider_key } = body;
        const { data: row, error } = await service.from("sms_providers").select("*").eq("provider_key", provider_key).single();
        if (error || !row) return json({ error: "Provider not found" }, 404);
        const provider = getSmsProvider(row);
        const result = await provider.getBalance();
        if (!result.supported) return json({ supported: false, message: "Not supported by this provider" });
        if (!result.error && !Number.isNaN(result.balance)) {
          await service.from("sms_providers").update({
            last_balance: result.balance,
            balance_currency: result.currency ?? null,
          }).eq("provider_key", provider_key);
        }
        return json(result);
      }

      case "send_single":
      case "send_bulk": {
        const messageType = body.message_type === "marketing" ? "marketing" : "transactional";
        const text = String(body.body || "").trim();
        if (!text) return json({ error: "Message body is required" }, 400);
        if (text.length > 1600) return json({ error: "Message is too long (max 1600 characters)" }, 400);
        const phonesRaw: string[] = Array.isArray(body.phones) ? body.phones : body.phone ? [body.phone] : [];
        const phones = [...new Set(phonesRaw.map((p: string) => normalizePhone(String(p))).filter(Boolean))];
        if (phones.length === 0) return json({ error: "At least one valid phone number is required" }, 400);
        if (action === "send_single" && phones.length !== 1) return json({ error: "send_single expects exactly one phone number" }, 400);

        let providerRow;
        try {
          providerRow = await getActiveProvider(service);
        } catch (e) {
          return json({ error: (e as Error).message }, 400);
        }
        const results = await sendToPhones(
          service, providerRow, phones.map((p) => ({ phone: p })), text, messageType, "manual", null, adminUserId,
        );
        await audit(service, adminUserId, action, { message_type: messageType, ...results, recipients: phones.length });
        return json({ success: results.failed === 0, provider: providerRow.provider_key, ...results });
      }

      case "launch_campaign": {
        const { campaign_id } = body;
        if (!campaign_id) return json({ error: "campaign_id is required" }, 400);
        const { data: campaign, error } = await service.from("sms_campaigns").select("*").eq("id", campaign_id).single();
        if (error || !campaign) return json({ error: "Campaign not found" }, 404);
        if (["sending", "sent"].includes(campaign.status)) return json({ error: `Campaign is already ${campaign.status}` }, 400);

        let recipients: { phone: string; name?: string | null }[] = [];
        if (campaign.audience === "manual") {
          recipients = (campaign.manual_phones || []).map((p: string) => ({ phone: normalizePhone(p) })).filter((r: { phone: string }) => r.phone);
        } else {
          // marketing_subscribers: explicit opt-in only, never every registered customer
          const { data: contacts } = await service
            .from("sms_contacts")
            .select("phone, full_name")
            .eq("marketing_opt_in", true);
          recipients = (contacts || []).map((c) => ({ phone: c.phone, name: c.full_name }));
        }
        if (recipients.length === 0) {
          await service.from("sms_campaigns").update({ status: "failed", total_recipients: 0 }).eq("id", campaign_id);
          return json({ error: "No eligible recipients for this campaign audience" }, 400);
        }

        let providerRow;
        try {
          providerRow = await getActiveProvider(service);
        } catch (e) {
          return json({ error: (e as Error).message }, 400);
        }

        await service.from("sms_campaigns").update({ status: "sending" }).eq("id", campaign_id);
        const results = await sendToPhones(
          service, providerRow, recipients, campaign.message, "marketing", "campaign", campaign_id, adminUserId,
        );
        const finalStatus = results.sent > 0 ? "sent" : "failed";
        await service.from("sms_campaigns").update({
          status: finalStatus,
          sent_at: new Date().toISOString(),
          total_recipients: recipients.length,
          sent_count: results.sent,
          failed_count: results.failed,
        }).eq("id", campaign_id);
        await audit(service, adminUserId, "campaign_launched", { campaign_id, ...results, recipients: recipients.length });
        return json({ success: results.sent > 0, provider: providerRow.provider_key, ...results, recipients: recipients.length });
      }

      case "run_due_campaigns": {
        const { data: due } = await service
          .from("sms_campaigns")
          .select("id")
          .eq("status", "scheduled")
          .lte("scheduled_at", new Date().toISOString());
        const launched: string[] = [];
        for (const c of due || []) {
          launched.push(c.id);
          // Reuse launch logic per campaign
          const launchRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sms-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: req.headers.get("Authorization") || "" },
            body: JSON.stringify({ action: "launch_campaign", campaign_id: c.id }),
          });
          if (!launchRes.ok) console.error("Failed to launch due campaign", c.id, await launchRes.text());
        }
        return json({ success: true, launched });
      }

      case "refresh_status": {
        const { message_id } = body;
        if (!message_id) return json({ error: "message_id is required" }, 400);
        const { data: msg, error } = await service.from("sms_messages").select("*").eq("id", message_id).single();
        if (error || !msg) return json({ error: "Message not found" }, 404);
        if (!msg.provider_message_id || !msg.provider_key) {
          return json({ supported: false, message: "No provider reference stored for this message" });
        }
        const { data: providerRow } = await service.from("sms_providers").select("*").eq("provider_key", msg.provider_key).single();
        if (!providerRow) return json({ error: "Provider not found" }, 404);
        const result = await applyDeliveryStatus(service, getSmsProvider(providerRow), msg);
        return json(result);
      }

      case "sync_delivery": {
        // Ask the provider for the network delivery result of recent sent messages.
        const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const { data: pending } = await service
          .from("sms_messages")
          .select("*")
          .eq("status", "sent")
          .not("provider_message_id", "is", null)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(100);
        const { data: providerRows } = await service.from("sms_providers").select("*");
        const providers = new Map((providerRows || []).map((p) => [p.provider_key, getSmsProvider(p)]));
        const summary = { checked: 0, delivered: 0, failed: 0, pending: 0 };
        for (const msg of pending || []) {
          const provider = providers.get(msg.provider_key);
          if (!provider?.capabilities.status) continue;
          const r = await applyDeliveryStatus(service, provider, msg);
          summary.checked++;
          if (r.outcome === "delivered") summary.delivered++;
          else if (r.outcome === "failed") summary.failed++;
          else summary.pending++;
        }
        return json({ success: true, ...summary });
      }

      case "sync_contacts": {
        // Import customers with phone numbers from profiles; preserves existing opt-in choices.
        const { data: profiles, error } = await service
          .from("profiles")
          .select("user_id, full_name, phone")
          .not("phone", "is", null);
        if (error) return json({ error: error.message }, 500);
        const rows = (profiles || [])
          .filter((p) => p.phone && normalizePhone(p.phone).length >= 7)
          .map((p) => ({
            user_id: p.user_id,
            full_name: p.full_name,
            phone: normalizePhone(p.phone),
            source: "customer",
          }));
        let imported = 0;
        for (const row of rows) {
          const { error: upErr } = await service
            .from("sms_contacts")
            .upsert(row, { onConflict: "phone", ignoreDuplicates: true });
          if (!upErr) imported++;
        }
        await audit(service, adminUserId, "contacts_synced", { profiles: rows.length, imported });
        return json({ success: true, profiles: rows.length, imported });
      }

      case "render_preview": {
        const { template, variables } = body;
        return json({ preview: renderTemplate(String(template || ""), variables || {}) });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("sms-admin error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
