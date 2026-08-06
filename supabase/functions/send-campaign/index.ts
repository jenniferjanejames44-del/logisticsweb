import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { renderCampaignEmail, renderPlainText } from "../_shared/campaign-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("RAC_FROM_EMAIL") || "RAC Logistics <info@raclogisticltd.com>";
const PUBLIC_BASE = Deno.env.get("RAC_PUBLIC_BASE") || "https://raclogisticltd.com";
const TRACK_BASE = `${SUPABASE_URL}/functions/v1`;

interface AudienceFilter {
  scope?: "all" | "active" | "inactive" | "partners" | "customers";
  countries?: string[];
  account_types?: string[];
  test_emails?: string[];
}

function buildSubscriberQuery(supabase: any, filter: AudienceFilter) {
  let q = supabase.from("email_subscribers").select("id,email,full_name,country,account_type,last_activity_at").eq("marketing_opt_in", true);
  const scope = filter.scope || "all";
  if (scope === "partners") q = q.eq("account_type", "partner");
  else if (scope === "customers") q = q.eq("account_type", "customer");
  else if (scope === "active") q = q.gte("last_activity_at", new Date(Date.now() - 30 * 86400000).toISOString());
  else if (scope === "inactive") q = q.lt("last_activity_at", new Date(Date.now() - 30 * 86400000).toISOString());
  if (filter.countries?.length) q = q.in("country", filter.countries);
  if (filter.account_types?.length) q = q.in("account_type", filter.account_types);
  return q;
}

async function sendOne(to: string, subject: string, html: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Resend error ${res.status}`);
  return data?.id as string | undefined;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { campaign_id, test_email } = await req.json();
    if (!campaign_id) return new Response(JSON.stringify({ error: "campaign_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: campaign, error: cErr } = await supabase.from("email_campaigns").select("*").eq("id", campaign_id).single();
    if (cErr || !campaign) throw new Error(cErr?.message || "Campaign not found");

    // Test send path
    if (test_email) {
      const html = renderCampaignEmail({
        subject: campaign.subject,
        preheader: campaign.preheader,
        heading: campaign.heading,
        bodyHtml: campaign.body_html,
        ctaLabel: campaign.cta_label,
        ctaUrl: campaign.cta_url,
        secondaryCtaLabel: campaign.secondary_cta_label,
        secondaryCtaUrl: campaign.secondary_cta_url,
        bannerUrl: campaign.banner_url,
        footerText: campaign.footer_text,
        recipientName: "there",
        unsubscribeUrl: `${PUBLIC_BASE}/unsubscribe?test=1`,
      });
      const text = renderPlainText({ subject: campaign.subject, heading: campaign.heading, bodyHtml: campaign.body_html, ctaLabel: campaign.cta_label, ctaUrl: campaign.cta_url, footerText: campaign.footer_text });
      await sendOne(test_email, `[TEST] ${campaign.subject}`, html, text);
      return new Response(JSON.stringify({ ok: true, test: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (campaign.status === "sending" || campaign.status === "sent") {
      return new Response(JSON.stringify({ error: "Campaign already processed" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("email_campaigns").update({ status: "sending" }).eq("id", campaign_id);

    const filter = (campaign.audience_filter || {}) as AudienceFilter;
    const { data: subs, error: sErr } = await buildSubscriberQuery(supabase, filter);
    if (sErr) throw sErr;
    const recipients = subs || [];

    // Pre-create recipient rows
    const rows = recipients.map((s: any) => ({ campaign_id, subscriber_id: s.id, email: s.email, status: "pending" }));
    if (rows.length) await supabase.from("email_campaign_recipients").insert(rows);
    await supabase.from("email_campaigns").update({ total_recipients: rows.length }).eq("id", campaign_id);

    let sent = 0;
    let failed = 0;

    for (const s of recipients) {
      const recRow = await supabase.from("email_campaign_recipients").select("id").eq("campaign_id", campaign_id).eq("email", s.email).limit(1).single();
      const recipientId = recRow.data?.id;
      const unsubscribeUrl = `${PUBLIC_BASE}/unsubscribe?sid=${s.id}`;
      const trackingPixelUrl = recipientId ? `${TRACK_BASE}/email-track?c=${recipientId}&t=open` : undefined;
      const wrappedCta = recipientId && campaign.cta_url
        ? `${TRACK_BASE}/email-track?c=${recipientId}&t=click&u=${encodeURIComponent(campaign.cta_url)}`
        : campaign.cta_url;

      const html = renderCampaignEmail({
        subject: campaign.subject,
        preheader: campaign.preheader,
        heading: campaign.heading,
        bodyHtml: campaign.body_html,
        ctaLabel: campaign.cta_label,
        ctaUrl: wrappedCta,
        secondaryCtaLabel: campaign.secondary_cta_label,
        secondaryCtaUrl: campaign.secondary_cta_url,
        bannerUrl: campaign.banner_url,
        footerText: campaign.footer_text,
        recipientName: s.full_name || s.email.split("@")[0],
        unsubscribeUrl,
        trackingPixelUrl,
      });
      const text = renderPlainText({ subject: campaign.subject, heading: campaign.heading, bodyHtml: campaign.body_html, ctaLabel: campaign.cta_label, ctaUrl: campaign.cta_url, footerText: campaign.footer_text });

      try {
        const messageId = await sendOne(s.email, campaign.subject, html, text);
        await supabase.from("email_campaign_recipients").update({ status: "sent", sent_at: new Date().toISOString(), resend_message_id: messageId }).eq("id", recipientId);
        sent++;
      } catch (e: any) {
        await supabase.from("email_campaign_recipients").update({ status: "failed", error_message: String(e?.message || e) }).eq("id", recipientId);
        failed++;
      }
      // gentle pacing to stay under provider limits
      await new Promise((r) => setTimeout(r, 80));
    }

    await supabase.from("email_campaigns").update({
      status: failed === recipients.length && recipients.length > 0 ? "failed" : "sent",
      sent_at: new Date().toISOString(),
      sent_count: sent,
      failed_count: failed,
    }).eq("id", campaign_id);

    return new Response(JSON.stringify({ ok: true, sent, failed, total: recipients.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("send-campaign error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});