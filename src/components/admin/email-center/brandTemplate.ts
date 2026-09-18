export interface CompanySettings {
  company_name: string;
  slogan: string;
  logo_url: string;
  website: string;
  address: string;
  phone: string;
  support_email: string;
  primary_color: string;
  accent_color: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
}

function esc(s: string) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function renderBrandedEmail(bodyHtml: string, s: CompanySettings, subject = "A message from RAC Logistics"): string {
  const socials = [
    s.facebook_url && { url: s.facebook_url, label: "Facebook", icon: "https://cdn-icons-png.flaticon.com/24/1077/1077041.png" },
    s.instagram_url && { url: s.instagram_url, label: "Instagram", icon: "https://cdn-icons-png.flaticon.com/24/1384/1384063.png" },
    s.linkedin_url && { url: s.linkedin_url, label: "LinkedIn", icon: "https://cdn-icons-png.flaticon.com/24/1384/1384014.png" },
    s.twitter_url && { url: s.twitter_url, label: "X", icon: "https://cdn-icons-png.flaticon.com/24/5968/5968958.png" },
    s.youtube_url && { url: s.youtube_url, label: "YouTube", icon: "https://cdn-icons-png.flaticon.com/24/1384/1384060.png" },
    s.tiktok_url && { url: s.tiktok_url, label: "TikTok", icon: "https://cdn-icons-png.flaticon.com/24/3046/3046120.png" },
    s.whatsapp_url && { url: s.whatsapp_url, label: "WhatsApp", icon: "https://cdn-icons-png.flaticon.com/24/733/733585.png" },
  ].filter(Boolean) as { url: string; label: string; icon: string }[];

  const socialHtml = socials.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:18px auto 0;"><tr>${socials.map(x => `<td style="padding:0 4px;"><a href="${esc(x.url)}" style="display:inline-block;border:1px solid #dfe3eb;border-radius:999px;padding:6px 10px;color:#4b5563;font-size:10px;font-weight:700;text-decoration:none;letter-spacing:.04em;text-transform:uppercase;">${x.label}</a></td>`).join("")}</tr></table>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="x-apple-disable-message-reformatting"/><title>${esc(subject)}</title><style>@media only screen and (max-width:620px){.email-shell{width:100%!important}.email-pad{padding-left:24px!important;padding-right:24px!important}.brand-tagline{display:none!important}.service-cell{display:block!important;width:100%!important;border:0!important;border-top:1px solid #e8eaf0!important;padding:12px 0!important}}</style></head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1f2937;-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(subject)} — ${esc(s.slogan)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:30px 12px;"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" class="email-shell" style="max-width:640px;width:100%;">
    <tr><td style="padding:0 4px 10px;font-size:11px;color:#778093;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="left" style="font-weight:700;letter-spacing:.08em;text-transform:uppercase;">RAC Logistics Dispatch</td><td align="right">Trusted global freight</td></tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid #e4e7ed;border-radius:14px;overflow:hidden;box-shadow:0 18px 48px rgba(6,16,67,.10);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:${s.primary_color};padding:26px 38px;border-bottom:4px solid ${s.accent_color};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td align="left"><img src="${esc(s.logo_url)}" alt="${esc(s.company_name)}" height="40" style="height:40px;width:auto;max-width:190px;display:block;border:0;"/></td>
            <td align="right" class="brand-tagline" style="font-size:11px;color:#d8dceb;letter-spacing:.06em;text-transform:uppercase;">${esc(s.slogan)}</td>
          </tr></table>
        </td></tr>
        <tr><td class="email-pad" style="padding:46px 48px 38px;font-size:15.5px;line-height:1.75;color:#283142;">${bodyHtml}</td></tr>
        <tr><td class="email-pad" style="padding:0 48px 34px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8eaf0;border-bottom:1px solid #e8eaf0;">
            <tr>
              <td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;"><div style="font-size:12px;font-weight:800;color:${s.primary_color};">AIR FREIGHT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Fast global delivery</div></td>
              <td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;border-left:1px solid #e8eaf0;border-right:1px solid #e8eaf0;"><div style="font-size:12px;font-weight:800;color:${s.primary_color};">SEA FREIGHT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Reliable bulk shipping</div></td>
              <td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;"><div style="font-size:12px;font-weight:800;color:${s.primary_color};">PROCUREMENT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Sourcing made simple</div></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#fafbfc;border-top:1px solid #eceef3;padding:28px 38px;text-align:center;">
          <div style="font-size:14px;font-weight:800;color:${s.primary_color};">${esc(s.company_name)}</div>
          <div style="margin:4px 0 12px;font-size:11.5px;color:#778093;">${esc(s.slogan)}</div>
          <div style="font-size:11.5px;color:#687184;line-height:1.75;">${esc(s.address)}<br/>${esc(s.phone)} &nbsp;&middot;&nbsp; <a href="mailto:${esc(s.support_email)}" style="color:${s.accent_color};text-decoration:none;font-weight:600;">${esc(s.support_email)}</a><br/><a href="${esc(s.website)}" style="color:${s.accent_color};text-decoration:none;font-weight:600;">${esc(s.website.replace(/^https?:\/\//, ""))}</a></div>
          ${socialHtml}
          <div style="margin-top:16px;font-size:10.5px;color:#9aa1af;line-height:1.5;">&copy; ${new Date().getFullYear()} ${esc(s.company_name)}. All rights reserved.<br/>This message was sent by RAC Logistics.</div>
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:16px 12px 0;font-size:10px;color:#9aa1af;">Securely delivered by RAC Logistics</td></tr>
  </table>
</td></tr></table></body></html>`;
}
