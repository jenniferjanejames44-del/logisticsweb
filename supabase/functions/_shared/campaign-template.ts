// Branded RAC Logistics email shell for marketing campaigns.
// Inline-styled, table-based for max client compatibility (Gmail/Outlook/mobile).

export interface CampaignEmailOptions {
  subject: string;
  heading?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bannerUrl?: string;
  footerText?: string;
  recipientName?: string;
  unsubscribeUrl?: string;
  trackingPixelUrl?: string;
  siteUrl?: string;
}

const NAVY = "#061043";
const ORANGE = "#DF5101";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const BG = "#f5f5f7";
const SITE = "https://raclogisticltd.com";
const LOGO_URL = `${SITE}/lovable-uploads/rac-logo.png`;
const SUPPORT_EMAIL = "support@raclogisticltd.com";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function interpolate(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) =>
    vars[k] !== undefined ? escapeHtml(String(vars[k])) : ""
  );
}

export function renderCampaignEmail(opts: CampaignEmailOptions): string {
  const vars = { name: opts.recipientName || "there" };
  const heading = opts.heading ? interpolate(opts.heading, vars) : "";
  const body = opts.bodyHtml ? interpolate(opts.bodyHtml, vars) : "";
  const ctaUrl = opts.ctaUrl ? interpolate(opts.ctaUrl, vars) : "";
  const ctaLabel = opts.ctaLabel || "";
  const banner = opts.bannerUrl || "";
  const footer = opts.footerText || "RAC Logistics — moving the world for you.";
  const unsub = opts.unsubscribeUrl || "";
  const pixel = opts.trackingPixelUrl
    ? `<img src="${opts.trackingPixelUrl}" width="1" height="1" alt="" style="display:block;border:0;" />`
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(opts.subject)}</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:'DM Sans',Arial,Helvetica,sans-serif;color:${TEXT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(6,16,67,0.06);">
      <tr><td style="background:${NAVY};padding:22px 28px;" align="left">
        <img src="${LOGO_URL}" alt="RAC Logistics" height="34" style="display:block;height:34px;width:auto;"/>
      </td></tr>
      ${banner ? `<tr><td><img src="${escapeHtml(banner)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;"/></td></tr>` : ""}
      <tr><td style="padding:36px 36px 8px 36px;">
        ${heading ? `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${NAVY};font-weight:700;">${heading}</h1>` : ""}
        <div style="font-size:15px;line-height:1.65;color:${TEXT};">${body}</div>
      </td></tr>
      ${ctaLabel && ctaUrl ? `<tr><td align="left" style="padding:24px 36px 8px;">
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">${escapeHtml(ctaLabel)}</a>
      </td></tr>` : ""}
      <tr><td style="padding:32px 36px 24px;">
        <hr style="border:0;border-top:1px solid #eef0f3;margin:0 0 20px;"/>
        <p style="margin:0 0 6px;font-size:13px;color:${MUTED};line-height:1.55;">${escapeHtml(footer)}</p>
        <p style="margin:0;font-size:12px;color:${MUTED};">
          RAC Logistics · <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a> · <a href="${SITE}" style="color:${MUTED};">raclogisticltd.com</a>
        </p>
        ${unsub ? `<p style="margin:14px 0 0;font-size:11px;color:${MUTED};">You received this because you subscribed to updates from RAC Logistics. <a href="${escapeHtml(unsub)}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>.</p>` : ""}
      </td></tr>
    </table>
    ${pixel}
  </td></tr>
</table>
</body></html>`;
}

export function renderPlainText(opts: CampaignEmailOptions): string {
  const vars = { name: opts.recipientName || "there" };
  const heading = opts.heading ? opts.heading.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] || "") : "";
  const body = (opts.bodyHtml || "").replace(/<[^>]+>/g, "");
  return `${heading}\n\n${body}\n\n${opts.ctaLabel && opts.ctaUrl ? `${opts.ctaLabel}: ${opts.ctaUrl}\n\n` : ""}${opts.footerText || "RAC Logistics"}${opts.unsubscribeUrl ? `\n\nUnsubscribe: ${opts.unsubscribeUrl}` : ""}`;
}

export function unsubscribeToken(subscriberId: string, secret: string): string {
  // Simple HMAC-style signed token: subscriberId.signature
  // Using SubtleCrypto in Deno
  return subscriberId; // signature appended at runtime by caller with crypto.subtle
}