import { createClient } from "npm:@supabase/supabase-js@2.91.1";
import { corsHeaders } from "../_shared/cors.ts";

function htmlPage(title: string, message: string, status: number) {
  const body = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head><body style="margin:0;font-family:Arial,sans-serif;background:#f4f6fb;display:flex;align-items:center;justify-content:center;min-height:100vh;"><div style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid #061043;padding:36px 30px;max-width:420px;text-align:center;"><h1 style="margin:0 0 10px;font-size:20px;color:#061043;">${title}</h1><p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${message}</p></div></body></html>`;
  return new Response(body, { status, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim() || "";
    const token = url.searchParams.get("token")?.trim() || "";
    if (!id || !token) {
      return htmlPage("Link incomplete", "This quotation link is incomplete. Please open the full link from your email, or contact info@raclogisticltd.com.", 400);
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return htmlPage("Unavailable", "The quotation service is temporarily unavailable. Please try again shortly.", 500);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: quote } = await admin
      .from("quotations")
      .select("id, pdf_url")
      .eq("id", id)
      .eq("view_token", token)
      .maybeSingle();
    if (!quote) {
      return htmlPage("Quotation not found", "This quotation link is invalid or has expired. Please contact RAC Logistics at info@raclogisticltd.com for a new copy.", 404);
    }
    if (!quote.pdf_url) {
      return htmlPage("Quotation not ready", "This quotation document is not available yet. Please contact RAC Logistics at info@raclogisticltd.com.", 404);
    }
    const { data: file, error } = await admin.storage.from("invoices").download(quote.pdf_url);
    if (error || !file) {
      console.error("view-quotation download failed", error);
      return htmlPage("Unavailable", "We could not load this quotation right now. Please try again shortly or contact info@raclogisticltd.com.", 500);
    }
    const html = await file.text();
    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, max-age=60" },
    });
  } catch (e) {
    console.error("view-quotation failed", e);
    return htmlPage("Unavailable", "Something went wrong loading this quotation. Please contact info@raclogisticltd.com.", 500);
  }
});
