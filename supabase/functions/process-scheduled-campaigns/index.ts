import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const nowIso = new Date().toISOString();
  const { data: due } = await supabase.from("email_campaigns").select("id").eq("status", "scheduled").lte("scheduled_at", nowIso);
  const ids = (due || []).map((r: any) => r.id);
  for (const id of ids) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
        body: JSON.stringify({ campaign_id: id }),
      });
    } catch (e) { console.error("scheduler dispatch failed", id, e); }
  }
  return new Response(JSON.stringify({ processed: ids.length }), { headers: { "Content-Type": "application/json" } });
});