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

export function renderBrandedEmail(bodyHtml: string, s: CompanySettings): string {
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
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:10px auto 0;"><tr>${socials.map(x => `<td style="padding:0 6px;"><a href="${x.url}" style="text-decoration:none;"><img src="${x.icon}" alt="${x.label}" width="24" height="24" style="display:block;border:0;"/></a></td>`).join("")}</tr></table>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:0;background:#eef0f5;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f5;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(6,16,67,0.08);">
<tr><td style="background:${s.primary_color};padding:22px 30px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td align="left"><img src="${s.logo_url}" alt="${esc(s.company_name)}" height="38" style="height:38px;width:auto;display:block;"/></td>
    <td align="right" style="font-size:12px;color:#cdd2e6;">${esc(s.slogan)}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:36px 40px;font-size:15.5px;line-height:1.7;color:#1f2937;">${bodyHtml}</td></tr>
<tr><td style="background:#f9fafb;border-top:1px solid #eef0f3;padding:22px 30px;text-align:center;">
  <div style="font-size:14px;font-weight:700;color:${s.primary_color};">${esc(s.company_name)}</div>
  <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${esc(s.slogan)}</div>
  <div style="font-size:12px;color:#6b7280;line-height:1.6;">
    ${esc(s.address)}<br/>
    ${esc(s.phone)} &middot; <a href="mailto:${esc(s.support_email)}" style="color:${s.accent_color};text-decoration:none;">${esc(s.support_email)}</a><br/>
    <a href="${esc(s.website)}" style="color:${s.accent_color};text-decoration:none;">${esc(s.website.replace(/^https?:\/\//, ""))}</a>
  </div>
  ${socialHtml}
  <div style="margin-top:12px;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${esc(s.company_name)}. All rights reserved.</div>
</td></tr>
</table></td></tr></table></body></html>`;
}
