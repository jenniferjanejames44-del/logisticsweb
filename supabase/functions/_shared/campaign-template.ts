// Polished, Mailchimp-style RAC Logistics email shell.
// Inline-styled, table-based for max client compatibility (Gmail/Outlook/mobile).

export interface CampaignEmailOptions {
  subject: string;
  preheader?: string;
  heading?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
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
const BG = "#eef0f5";
const SITE = "https://raclogisticltd.com";
const LOGO_URL = `${SITE}/lovable-uploads/rac-logo.png`;
const SUPPORT_EMAIL = "support@raclogisticltd.com";
const PHONE = "+234 800 000 0000";

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
  const secCtaUrl = opts.secondaryCtaUrl ? interpolate(opts.secondaryCtaUrl, vars) : "";
  const secCtaLabel = opts.secondaryCtaLabel || "";
  const banner = opts.bannerUrl || "";
  const footer = opts.footerText || "RAC Logistics — fast, reliable freight worldwide.";
  const unsub = opts.unsubscribeUrl || "";
  const preheader = opts.preheader || "";
  const pixel = opts.trackingPixelUrl
    ? `<img src="${opts.trackingPixelUrl}" width="1" height="1" alt="" style="display:block;border:0;" />`
    : "";

  return `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${escapeHtml(opts.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased;">
${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;">
  <tr><td align="center">

    <!-- Preheader brand bar -->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-bottom:8px;">
      <tr>
        <td style="font-size:11px;color:${MUTED};letter-spacing:.08em;text-transform:uppercase;" align="left">RAC Logistics Newsletter</td>
        <td style="font-size:11px;color:${MUTED};" align="right"><a href="${SITE}" style="color:${MUTED};text-decoration:none;">View in browser</a></td>
      </tr>
    </table>

    <!-- Card -->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(6,16,67,0.08);">
      <!-- Logo header -->
      <tr><td style="background:${NAVY};padding:24px 32px;" align="left">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left"><img src="${LOGO_URL}" alt="RAC Logistics" height="36" style="display:block;height:36px;width:auto;"/></td>
            <td align="right" style="font-size:12px;color:#cdd2e6;letter-spacing:.04em;">Trusted Global Freight</td>
          </tr>
        </table>
      </td></tr>

      ${banner ? `<tr><td style="background:#f3f4f8;"><img src="${escapeHtml(banner)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"/></td></tr>` : ""}

      <!-- Body -->
      <tr><td style="padding:40px 40px 8px 40px;">
        ${heading ? `<h1 style="margin:0 0 18px;font-size:26px;line-height:1.22;color:${NAVY};font-weight:700;letter-spacing:-.01em;">${heading}</h1>` : ""}
        <div style="font-size:15.5px;line-height:1.7;color:${TEXT};">${body}</div>
      </td></tr>

      <!-- CTA(s) -->
      ${ctaLabel && ctaUrl ? `<tr><td align="left" style="padding:28px 40px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background:${ORANGE};border-radius:10px;">
            <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
          </td>
          ${secCtaLabel && secCtaUrl ? `<td style="padding-left:10px;">
            <a href="${escapeHtml(secCtaUrl)}" style="display:inline-block;padding:13px 24px;color:${NAVY};text-decoration:none;font-weight:600;font-size:15px;border:1px solid ${NAVY};border-radius:10px;">${escapeHtml(secCtaLabel)}</a>
          </td>` : ""}
        </tr></table>
      </td></tr>` : ""}

      <!-- Service strip -->
      <tr><td style="padding:32px 40px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef0f3;padding-top:20px;">
          <tr>
            <td align="center" style="padding:6px;width:33%;">
              <div style="font-size:13px;font-weight:700;color:${NAVY};">Air Freight</div>
              <div style="font-size:11px;color:${MUTED};">Door to door</div>
            </td>
            <td align="center" style="padding:6px;width:33%;border-left:1px solid #eef0f3;border-right:1px solid #eef0f3;">
              <div style="font-size:13px;font-weight:700;color:${NAVY};">Sea Freight</div>
              <div style="font-size:11px;color:${MUTED};">Bulk cargo</div>
            </td>
            <td align="center" style="padding:6px;width:33%;">
              <div style="font-size:13px;font-weight:700;color:${NAVY};">Procurement</div>
              <div style="font-size:11px;color:${MUTED};">We shop for you</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:28px 40px 32px;">
        <p style="margin:0 0 8px;font-size:13px;color:${MUTED};line-height:1.55;">${escapeHtml(footer)}</p>
        <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
          RAC Logistics &middot; <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a> &middot; ${PHONE}<br/>
          <a href="${SITE}" style="color:${MUTED};text-decoration:none;">raclogisticltd.com</a>
        </p>
        ${unsub ? `<p style="margin:18px 0 0;font-size:11px;color:${MUTED};line-height:1.5;">You're receiving this because you subscribed to updates from RAC Logistics. <a href="${escapeHtml(unsub)}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a> any time.</p>` : ""}
      </td></tr>
    </table>

    <p style="margin:14px 0 0;font-size:11px;color:${MUTED};">&copy; ${new Date().getFullYear()} RAC Logistics. All rights reserved.</p>
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

export function unsubscribeToken(subscriberId: string, _secret: string): string {
  return subscriberId;
}
