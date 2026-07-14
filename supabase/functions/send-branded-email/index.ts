import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Attachment { name: string; path: string; contentType?: string }
interface Payload {
  messageId?: string;
  subject: string;
  bodyHtml: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: Attachment[];
  saveOnly?: boolean;
  fromName?: string;
  testTo?: string;              // if set, send only to this address as a test (no logging changes)
  personalize?: boolean;        // replace {{merge}} vars per recipient
}

function wrapBranded(bodyHtml: string, settings: any): string {
  const {
    company_name, slogan, logo_url, website, address, phone, support_email,
    primary_color, accent_color,
    facebook_url, instagram_url, linkedin_url, twitter_url, youtube_url, tiktok_url, whatsapp_url,
  } = settings;
  const social = [
    facebook_url && { label: 'Facebook', url: facebook_url, icon: 'https://cdn-icons-png.flaticon.com/24/1077/1077041.png' },
    instagram_url && { label: 'Instagram', url: instagram_url, icon: 'https://cdn-icons-png.flaticon.com/24/1384/1384063.png' },
    linkedin_url && { label: 'LinkedIn', url: linkedin_url, icon: 'https://cdn-icons-png.flaticon.com/24/1384/1384014.png' },
    twitter_url && { label: 'X', url: twitter_url, icon: 'https://cdn-icons-png.flaticon.com/24/5968/5968958.png' },
    youtube_url && { label: 'YouTube', url: youtube_url, icon: 'https://cdn-icons-png.flaticon.com/24/1384/1384060.png' },
    tiktok_url && { label: 'TikTok', url: tiktok_url, icon: 'https://cdn-icons-png.flaticon.com/24/3046/3046120.png' },
    whatsapp_url && { label: 'WhatsApp', url: whatsapp_url, icon: 'https://cdn-icons-png.flaticon.com/24/733/733585.png' },
  ].filter(Boolean) as { label: string; url: string; icon: string }[];

  const socialHtml = social.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:10px auto 0;"><tr>${social.map(s => `<td style="padding:0 6px;"><a href="${s.url}" style="text-decoration:none;"><img src="${s.icon}" alt="${s.label}" width="24" height="24" style="display:block;border:0;"/></a></td>`).join('')}</tr></table>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(company_name)}</title></head>
<body style="margin:0;padding:0;background:#eef0f5;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1f2937;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f5;padding:32px 12px;"><tr><td align="center">
  <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(6,16,67,0.08);">
    <tr><td style="background:${primary_color};padding:24px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td align="left"><img src="${logo_url}" alt="${escapeHtml(company_name)}" height="40" style="display:block;height:40px;width:auto;"/></td>
        <td align="right" style="font-size:12px;color:#cdd2e6;letter-spacing:.04em;">${escapeHtml(slogan)}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:36px 40px;font-size:15.5px;line-height:1.7;color:#1f2937;">${bodyHtml}</td></tr>
    <tr><td style="background:#f9fafb;border-top:1px solid #eef0f3;padding:24px 40px;text-align:center;">
      <div style="font-size:14px;font-weight:700;color:${primary_color};margin-bottom:4px;">${escapeHtml(company_name)}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${escapeHtml(slogan)}</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">
        ${escapeHtml(address)}<br/>
        ${escapeHtml(phone)} &middot; <a href="mailto:${escapeHtml(support_email)}" style="color:${accent_color};text-decoration:none;">${escapeHtml(support_email)}</a><br/>
        <a href="${escapeHtml(website)}" style="color:${accent_color};text-decoration:none;">${escapeHtml(website.replace(/^https?:\/\//,''))}</a>
      </div>
      ${socialHtml}
      <div style="margin-top:14px;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${escapeHtml(company_name)}. All rights reserved.</div>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    // Auth: allow admin JWT OR internal service call (used by the scheduler)
    const internal = req.headers.get('x-internal-key') === SERVICE_KEY;
    if (!internal) {
      const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
      if (!token) return json({ error: 'unauthorized' }, 401);
      const supaAuth = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: userData, error: uerr } = await supaAuth.auth.getUser(token);
      if (uerr || !userData?.user) return json({ error: 'unauthorized' }, 401);
      const { data: roleRow } = await supaAuth.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
      if (!roleRow) return json({ error: 'forbidden' }, 403);
    }

    const payload = await req.json() as Payload;
    if (!payload.subject?.trim()) return json({ error: 'Subject required' }, 400);
    if (!payload.bodyHtml?.trim()) return json({ error: 'Body required' }, 400);
    const to = payload.testTo
      ? [payload.testTo.trim()]
      : (payload.to || []).map(s => s.trim()).filter(Boolean);
    if (!to.length) return json({ error: 'At least one recipient required' }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: settings } = await admin.from('email_center_company_settings').select('*').eq('id', 1).maybeSingle();
    if (!settings) return json({ error: 'Company settings missing' }, 500);

    if (!RESEND_API_KEY) return json({ error: 'Email service not configured' }, 500);

    // Personalization lookup: pull contact rows for the given recipients
    const contactMap = new Map<string, any>();
    if (payload.personalize !== false && to.length) {
      const { data: cts } = await admin.from('email_center_contacts')
        .select('email, full_name, company, phone, country, position, industry')
        .in('email', to.map(e => e.toLowerCase()));
      (cts || []).forEach((c: any) => contactMap.set(c.email.toLowerCase(), c));
    }

    // Build attachments: download from storage
    const attachments: { filename: string; content: string }[] = [];
    for (const a of payload.attachments || []) {
      const { data: file, error } = await admin.storage.from('email-attachments').download(a.path);
      if (error || !file) continue;
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = '';
      for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
      attachments.push({ filename: a.name, content: btoa(bin) });
    }

    const fromName = payload.fromName || settings.company_name;
    const fromEmail = settings.support_email || 'no-reply@raclogisticltd.com';
    const from = `${fromName} <${fromEmail}>`;

    let sent = 0, failed = 0;
    const errors: string[] = [];
    for (const recipient of to) {
      const c = contactMap.get(recipient.toLowerCase());
      const vars: Record<string, string> = {
        contact_name: c?.full_name || recipient.split('@')[0],
        name: c?.full_name || recipient.split('@')[0],
        company_name: c?.company || '',
        country: c?.country || '',
        position: c?.position || '',
        industry: c?.industry || '',
        sender_name: fromName,
        company: settings.company_name,
        website: settings.website,
        phone: settings.phone,
        email: settings.support_email,
        service: 'logistics services',
      };
      const personalizedBody = mergeVars(payload.bodyHtml, vars);
      const personalizedSubject = mergeVars(payload.subject, vars);
      const html = wrapBranded(personalizedBody, settings);
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from,
            to: [recipient],
            cc: payload.cc?.length ? payload.cc : undefined,
            bcc: payload.bcc?.length ? payload.bcc : undefined,
            subject: personalizedSubject,
            html,
            reply_to: fromEmail,
            attachments: attachments.length ? attachments : undefined,
          }),
        });
        if (res.ok) sent++;
        else { failed++; errors.push(`${recipient}: ${await res.text()}`); }
      } catch (e: any) {
        failed++; errors.push(`${recipient}: ${e.message}`);
      }
    }

    if (payload.messageId && !payload.testTo) {
      await admin.from('email_center_messages').update({
        status: failed && !sent ? 'failed' : 'sent',
        sent_count: sent, failed_count: failed,
        error_message: errors.length ? errors.join('\n').slice(0, 2000) : null,
        sent_at: new Date().toISOString(),
      }).eq('id', payload.messageId);
    }

    return json({ sent, failed, errors });
  } catch (e: any) {
    return json({ error: e.message || 'Internal error' }, 500);
  }
});

function mergeVars(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k) => {
    const v = vars[k.toLowerCase()];
    return v === undefined ? '' : String(v);
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
