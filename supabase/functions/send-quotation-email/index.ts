import { createClient } from "npm:@supabase/supabase-js@2.91.1";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SENDER_DOMAIN = "notify.raclogisticltd.com";
const FROM = "RAC Logistics <info@raclogisticltd.com>";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function fmtMoney(value: unknown, currency: unknown) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: String(currency || "USD").toUpperCase(), minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Server configuration error" }, 500);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userError } = await userClient.auth.getUser(authHeader.slice("Bearer ".length).trim());
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null) as { quotation_id?: unknown; message?: unknown } | null;
    const quotationId = typeof body?.quotation_id === "string" ? body.quotation_id.trim() : "";
    if (!quotationId) return json({ error: "quotation_id is required" }, 400);
    const { data: quote, error: quoteError } = await admin.from("quotations").select("*").eq("id", quotationId).single();
    if (quoteError || !quote) return json({ error: "Quotation not found" }, 404);
    if (!quote.customer_email) return json({ error: "Customer email is missing" }, 400);

    let path = quote.pdf_url as string | null;
    if (!path) {
      const generated = await admin.functions.invoke("generate-quotation-pdf", { body: { quotation_id: quotationId }, headers: { Authorization: authHeader } });
      if (generated.error) return json({ error: "Could not generate the quotation document" }, 500);
      path = typeof generated.data?.file_path === "string" ? generated.data.file_path : null;
    }
    let documentLink = "";
    if (path) {
      const { data: signed } = await admin.storage.from("invoices").createSignedUrl(path, 60 * 60 * 24 * 30);
      documentLink = signed?.signedUrl || "";
    }
    const validUntil = new Date(quote.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const customMessage = typeof body?.message === "string" && body.message.trim()
      ? `<p style="margin:0 0 18px;line-height:1.6;">${escapeHtml(body.message.trim()).replace(/\n/g, "<br/>")}</p>`
      : `<p style="margin:0 0 18px;line-height:1.6;">Please find your RAC Logistics quotation <strong>${escapeHtml(quote.quote_number)}</strong> below. Reply to this email if you have any questions.</p>`;
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#1d2433;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #e2e8f0;"><tr><td style="background:#061043;color:#fff;padding:24px 28px;"><h1 style="margin:0;font-size:22px;">RAC LOGISTICS</h1><p style="margin:6px 0 0;font-size:12px;">Quotation / Invoice</p></td></tr><tr><td style="padding:28px;"><p style="margin:0 0 14px;">Hello ${escapeHtml(quote.customer_name)},</p>${customMessage}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;font-size:14px;"><tr><td style="padding:8px 0;color:#666;">Quote #</td><td align="right" style="font-weight:700;">${escapeHtml(quote.quote_number)}</td></tr><tr><td style="padding:8px 0;color:#666;">Valid Until</td><td align="right" style="font-weight:700;">${escapeHtml(validUntil)}</td></tr><tr><td style="padding:14px 0;border-top:2px solid #061043;font-weight:800;">Total</td><td align="right" style="padding:14px 0;border-top:2px solid #061043;color:#DF5101;font-weight:800;font-size:18px;">${escapeHtml(fmtMoney(quote.total, quote.currency))}</td></tr></table>${documentLink ? `<p style="text-align:center;margin:24px 0;"><a href="${escapeHtml(documentLink)}" style="background:#DF5101;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;display:inline-block;">View / Download Quotation</a></p>` : ""}<p style="margin:24px 0 0;font-size:12px;color:#777;line-height:1.6;">RAC Logistics Ltd · 29b Osolo Way, Ajao Estate, Lagos<br/>info@raclogisticltd.com · +234 818 595 6707</p></td></tr></table></td></tr></table></body></html>`;

    const messageId = `quotation-${quote.id}-${String(quote.updated_at || quote.created_at || "original").replace(/[^0-9]/g, "").slice(0, 18)}`;
    const recipient = String(quote.customer_email).trim().toLowerCase();
    const subject = `Your RAC Logistics Quotation ${quote.quote_number}`;
    const { error: enqueueError } = await admin.rpc("enqueue_email", { queue_name: "transactional_emails", payload: { message_id: messageId, to: recipient, from: FROM, sender_domain: SENDER_DOMAIN, subject, html, text: `Hello ${quote.customer_name}, your quotation ${quote.quote_number} is ready. Total: ${fmtMoney(quote.total, quote.currency)}. Valid until ${validUntil}.${documentLink ? ` View it here: ${documentLink}` : ""} Contact: info@raclogisticltd.com`, purpose: "transactional", label: "quotation_email", idempotency_key: messageId, queued_at: new Date().toISOString() } });
    if (enqueueError) return json({ error: enqueueError.message }, 500);
    await admin.from("email_send_log").insert({ message_id: messageId, template_name: "quotation_email", recipient_email: recipient, status: "pending", metadata: { quotation_id: quote.id, quote_number: quote.quote_number, subject } });
    await admin.from("quotations").update({ status: "sent", sent_at: new Date().toISOString(), pdf_url: path }).eq("id", quotationId);
    return json({ success: true, queued: true, messageId, link: documentLink });
  } catch (error) {
    console.error("send-quotation-email failed", error);
    return json({ error: error instanceof Error ? error.message : "Failed to queue quotation email" }, 500);
  }
});