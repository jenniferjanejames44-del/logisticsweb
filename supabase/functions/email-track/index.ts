import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PIXEL = Uint8Array.from([
  71,73,70,56,57,97,1,0,1,0,128,0,0,0,0,0,255,255,255,33,249,4,1,0,0,0,0,44,0,0,0,0,1,0,1,0,0,2,1,68,0,59,
]);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const c = url.searchParams.get("c");
  const t = url.searchParams.get("t");
  const u = url.searchParams.get("u");
  if (!c || !t) return new Response("bad request", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    if (t === "open") {
      await supabase.from("email_campaign_recipients").update({ status: "opened", opened_at: new Date().toISOString() }).eq("id", c).is("opened_at", null);
      // Increment campaign opened_count via RPC-less approach
      const { data: rec } = await supabase.from("email_campaign_recipients").select("campaign_id").eq("id", c).single();
      if (rec?.campaign_id) {
        await supabase.rpc("noop").catch(() => {});
        const { data: camp } = await supabase.from("email_campaigns").select("opened_count").eq("id", rec.campaign_id).single();
        await supabase.from("email_campaigns").update({ opened_count: (camp?.opened_count || 0) + 1 }).eq("id", rec.campaign_id);
      }
      return new Response(PIXEL, { headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" } });
    }
    if (t === "click" && u) {
      await supabase.from("email_campaign_recipients").update({ status: "clicked", clicked_at: new Date().toISOString() }).eq("id", c);
      const { data: rec } = await supabase.from("email_campaign_recipients").select("campaign_id").eq("id", c).single();
      if (rec?.campaign_id) {
        const { data: camp } = await supabase.from("email_campaigns").select("clicked_count").eq("id", rec.campaign_id).single();
        await supabase.from("email_campaigns").update({ clicked_count: (camp?.clicked_count || 0) + 1 }).eq("id", rec.campaign_id);
      }
      return Response.redirect(u, 302);
    }
  } catch (e) {
    console.error("track error", e);
  }
  return new Response("ok");
});