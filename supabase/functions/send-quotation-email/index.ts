import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM = "RAC Logistics <billing@raclogisticltd.com>";

function fmtMoney(n: number, c: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (c || "USD").toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await userClient.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const callerId = claims.claims.sub as string;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { quotation_id, message } = await req.json();
    if (!quotation_id) {
      return new Response(JSON.stringify({ error: "quotation_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: quote } = await supabase.from("quotations").select("*").eq("id", quotation_id).single();
    if (!quote || !quote.customer_email) {
      return new Response(JSON.stringify({ error: "Quotation or customer email missing" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Make sure PDF / HTML is generated and get a public(ish) link
    await supabase.functions.invoke("generate-quotation-pdf", {
      body: { quotation_id },
      headers: { Authorization: authHeader },
    });
    const { data: refetched } = await supabase.from("quotations").select("pdf_url").eq("id", quotation_id).single();
    const path = refetched?.pdf_url;
    let link = "";
    let attachment: { filename: string; content: string } | null = null;
    if (path) {
      const { data: signed } = await supabase.storage.from("invoices").createSignedUrl(path, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) link = signed.signedUrl;
      const { data: file } = await supabase.storage.from("invoices").download(path);
      if (file) {
        const buf = new Uint8Array(await file.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        attachment = {
          filename: `${quote.quote_number}-RAC-Quotation.html`,
          content: btoa(bin),
        };
      }
    }

    const validUntil = new Date(quote.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:'Helvetica Neue',Arial,sans-serif;color:#1d2433;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#061043;color:#fff;padding:24px;">
          <h1 style="margin:0;font-size:22px;letter-spacing:1px;">RAC LOGISTICS</h1>
          <p style="margin:6px 0 0;font-size:12px;opacity:.8;text-transform:uppercase;letter-spacing:2px;">Quotation Notification</p>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 14px;">Hello ${quote.customer_name},</p>
          <p style="margin:0 0 18px;line-height:1.55;">${message ? String(message).replace(/</g, "&lt;") : `Please find your RAC Logistics quotation <strong>${quote.quote_number}</strong> below. Reply to this email if you have any questions.`}</p>
          <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
            <tr><td style="padding:8px 0;color:#666;">Quote #</td><td style="padding:8px 0;text-align:right;font-weight:700;">${quote.quote_number}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Valid Until</td><td style="padding:8px 0;text-align:right;font-weight:700;">${validUntil}</td></tr>
            <tr><td style="padding:14px 0;border-top:2px solid #061043;color:#061043;font-weight:800;">Total</td><td style="padding:14px 0;border-top:2px solid #061043;text-align:right;color:#DF5101;font-weight:900;font-size:18px;">${fmtMoney(Number(quote.total), String(quote.currency))}</td></tr>
          </table>
          ${link ? `<p style="text-align:center;margin:24px 0;"><a href="${link}" style="background:#DF5101;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;display:inline-block;">View / Download Quotation</a></p>` : ""}
          <p style="margin:24px 0 0;font-size:12px;color:#777;">RAC Logistics Ltd · 29b Osolo Way, Ajao Estate, Lagos · info@raclogisticltd.com · +234 818 595 6707</p>
        </div>
      </div></body></html>`;

    const body: Record<string, unknown> = {
      from: FROM,
      to: [quote.customer_email],
      subject: `Your RAC Logistics Quotation ${quote.quote_number}`,
      html,
    };
    if (attachment) body.attachments = [attachment];

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend error", resendData);
      return new Response(JSON.stringify({ error: resendData?.message || "Email failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("quotations").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", quotation_id).is("sent_at", null);

    return new Response(JSON.stringify({ success: true, link }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Failed to send quotation email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});