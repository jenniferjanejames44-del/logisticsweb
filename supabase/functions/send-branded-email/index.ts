import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Verified Lovable sending domain (NS-delegated). Do not use an unverified root domain.
const SENDER_DOMAIN = 'notify.raclogisticltd.com';
const FROM_DOMAIN = 'raclogisticltd.com';
const FROM_MAILBOX = 'info';

interface Attachment { name: string; path: string; size?: number; contentType?: string }
interface Payload {
  messageId?: string;
  subject: string;
  bodyHtml: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: Attachment[];
  fromName?: string;
  testTo?: string;
  personalize?: boolean;
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapBranded(bodyHtml: string, settings: any, attachmentsHtml: string, subject: string): string {
  const {
    company_name, slogan, logo_url, website, address, phone, support_email,
    primary_color, accent_color,
    facebook_url, instagram_url, linkedin_url, twitter_url, youtube_url, tiktok_url, whatsapp_url,
  } = settings;

  const social = [
    facebook_url && { label: 'Facebook', url: facebook_url, icon: 'https://cdn-icons-png.flaticon.com/32/5968/5968764.png' },
    instagram_url && { label: 'Instagram', url: instagram_url, icon: 'https://cdn-icons-png.flaticon.com/32/2111/2111463.png' },
    linkedin_url && { label: 'LinkedIn', url: linkedin_url, icon: 'https://cdn-icons-png.flaticon.com/32/3536/3536505.png' },
    twitter_url && { label: 'X', url: twitter_url, icon: 'https://cdn-icons-png.flaticon.com/32/5968/5968958.png' },
    youtube_url && { label: 'YouTube', url: youtube_url, icon: 'https://cdn-icons-png.flaticon.com/32/1384/1384060.png' },
    tiktok_url && { label: 'TikTok', url: tiktok_url, icon: 'https://cdn-icons-png.flaticon.com/32/3046/3046120.png' },
    whatsapp_url && { label: 'WhatsApp', url: whatsapp_url, icon: 'https://cdn-icons-png.flaticon.com/32/733/733585.png' },
  ].filter(Boolean) as { label: string; url: string; icon: string }[];

  const socialHtml = social.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:18px auto 0;"><tr>${social.map(s => `<td style="padding:0 5px;"><a href="${escapeHtml(s.url)}" target="_blank" aria-label="${escapeHtml(s.label)}" style="display:block;text-decoration:none;"><img src="${escapeHtml(s.icon)}" alt="${escapeHtml(s.label)}" width="28" height="28" style="display:block;width:28px;height:28px;border:0;outline:0;"/></a></td>`).join('')}</tr></table>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="x-apple-disable-message-reformatting"/><title>${escapeHtml(subject)}</title><style>@media only screen and (max-width:620px){.email-outer{padding:0!important}.email-shell{width:100%!important}.email-card{border-left:0!important;border-right:0!important;border-radius:0!important}.email-topline{padding:12px 18px!important;text-align:center!important}.email-header{padding:18px 22px!important}.brand-cell,.brand-tagline{display:block!important;width:100%!important;text-align:center!important}.email-logo{width:112px!important;margin:0 auto!important}.brand-tagline{padding-top:10px!important;font-size:10px!important}.email-pad{padding-left:22px!important;padding-right:22px!important}.service-cell{display:block!important;width:100%!important;border:0!important;border-top:1px solid #e8eaf0!important;padding:12px 0!important}.email-footer{padding:26px 22px!important}}</style></head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1f2937;-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(subject)} — ${escapeHtml(slogan)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-outer" style="background:#f3f5f9;padding:30px 12px;"><tr><td align="center"><table role="presentation" width="640" cellpadding="0" cellspacing="0" class="email-shell" style="max-width:640px;width:100%;">
<tr><td class="email-topline" style="padding:0 4px 10px;font-size:11px;font-weight:700;color:#778093;text-align:center;">RAC LOGISTICS LTD &middot; Your reliable freight company</td></tr>
<tr><td class="email-card" style="background:#ffffff;border:1px solid #e4e7ed;border-radius:10px;overflow:hidden;box-shadow:0 12px 36px rgba(6,16,67,.08);"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td class="email-header" style="background:${primary_color};padding:24px 38px;border-bottom:3px solid ${accent_color};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="left" class="brand-cell"><img class="email-logo" src="${escapeHtml(logo_url)}" alt="RAC LOGISTICS LTD" width="120" style="display:block;width:120px;max-width:100%;height:auto;border:0;outline:0;background:transparent;color:#ffffff;font-size:14px;font-weight:800;"/></td><td align="right" class="brand-tagline" style="font-size:11px;color:#d8dceb;line-height:1.5;">Procurement &bull; Shipping &bull; Customs Clearing &bull; Product Sourcing &bull; Global Pick-up</td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:42px 48px 34px;font-size:15.5px;line-height:1.75;color:#283142;">${bodyHtml}${attachmentsHtml}</td></tr>
<tr><td class="email-pad" style="padding:0 48px 34px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8eaf0;border-bottom:1px solid #e8eaf0;"><tr><td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;"><div style="font-size:12px;font-weight:800;color:${primary_color};">AIR FREIGHT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Fast global delivery</div></td><td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;border-left:1px solid #e8eaf0;border-right:1px solid #e8eaf0;"><div style="font-size:12px;font-weight:800;color:${primary_color};">SEA FREIGHT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Reliable bulk shipping</div></td><td class="service-cell" align="center" width="33.33%" style="padding:16px 8px;"><div style="font-size:12px;font-weight:800;color:${primary_color};">PROCUREMENT</div><div style="margin-top:3px;font-size:10px;color:#778093;">Sourcing made simple</div></td></tr></table></td></tr>
<tr><td class="email-footer" style="background:#fafbfc;border-top:1px solid #eceef3;padding:28px 38px;text-align:center;"><table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 22px;"><tr><td style="background:${accent_color};border-radius:5px;"><a href="${escapeHtml(website)}" target="_blank" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;">Visit our website</a></td></tr></table><div style="font-size:14px;font-weight:800;color:${primary_color};">${escapeHtml(company_name)}</div><div style="margin:4px 0 12px;font-size:11.5px;color:#778093;">${escapeHtml(slogan)}</div><div style="font-size:11.5px;color:#687184;line-height:1.75;">${escapeHtml(address)}<br/>${escapeHtml(phone)} &nbsp;&middot;&nbsp; <a href="mailto:${escapeHtml(support_email)}" style="color:${accent_color};text-decoration:none;font-weight:600;">${escapeHtml(support_email)}</a><br/><a href="${escapeHtml(website)}" style="color:${accent_color};text-decoration:none;font-weight:600;">${escapeHtml(String(website || '').replace(/^https?:\/\//, ''))}</a></div>${socialHtml}<div style="margin-top:16px;font-size:10.5px;color:#9aa1af;line-height:1.5;">&copy; ${new Date().getFullYear()} ${escapeHtml(company_name)}. All rights reserved.<br/>This message was sent by RAC Logistics.</div></td></tr>
</table></td></tr><tr><td align="center" style="padding:16px 12px 0;font-size:10px;color:#9aa1af;">Securely delivered by RAC Logistics</td></tr></table></td></tr></table></body></html>`;
}

function mergeVars(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k) => {
    const v = vars[String(k).toLowerCase()];
    return v === undefined ? '' : String(v);
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const internal = req.headers.get('x-internal-key') === SERVICE_KEY;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (!internal) {
      const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
      if (!token) return json({ error: 'Not signed in. Please sign in again.' }, 401);
      const { data: userData, error: uerr } = await admin.auth.getUser(token);
      if (uerr || !userData?.user) return json({ error: 'Session expired. Please sign in again.' }, 401);
      const { data: roleRow } = await admin.from('user_roles').select('role')
        .eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
      if (!roleRow) return json({ error: 'Only admins can send emails from the Email Center.' }, 403);
    }

    const payload = await req.json() as Payload;
    if (!payload.subject?.trim()) return json({ error: 'Subject is required.' }, 400);
    if (!payload.bodyHtml?.trim()) return json({ error: 'Email body is required.' }, 400);

    const dedupe = (list?: string[]) =>
      Array.from(new Set((list || []).map(s => String(s).trim().toLowerCase()).filter(e => /.+@.+\..+/.test(e))));

    const to = payload.testTo ? dedupe([payload.testTo]) : dedupe(payload.to);
    if (!to.length) return json({ error: 'Add at least one valid recipient email address.' }, 400);

    // cc/bcc are delivered as additional recipients (queue API sends one address per message)
    const extra = payload.testTo ? [] : [...dedupe(payload.cc), ...dedupe(payload.bcc)].filter(e => !to.includes(e));
    const allRecipients = [...to, ...extra];

    const { data: settings } = await admin.from('email_center_company_settings').select('*').eq('id', 1).maybeSingle();
    if (!settings) return json({ error: 'Company settings are missing. Open Email Center → Settings and save your company details.' }, 500);

    // Attachments: Lovable email delivery does not carry binary attachments,
    // so we surface them as secure, time-limited download links in the email.
    let attachmentsHtml = '';
    const atts = payload.attachments || [];
    if (atts.length) {
      const rows: string[] = [];
      for (const a of atts) {
        const { data: signed } = await admin.storage.from('email-attachments').createSignedUrl(a.path, 60 * 60 * 24 * 14);
        if (!signed?.signedUrl) continue;
        const kb = a.size ? `${Math.max(1, Math.round(a.size / 1024))} KB` : '';
        rows.push(`<tr><td style="padding:8px 0;border-bottom:1px solid #eef0f3;font-size:13.5px;">
          <a href="${signed.signedUrl}" style="color:${settings.accent_color};text-decoration:none;font-weight:600;">${escapeHtml(a.name)}</a>
          ${kb ? `<span style="color:#9ca3af;font-size:12px;"> &middot; ${kb}</span>` : ''}
        </td></tr>`);
      }
      if (rows.length) {
        attachmentsHtml = `<div style="margin-top:28px;padding:18px 20px;background:#f7f8fb;border:1px solid #e9ecf3;border-radius:10px;">
          <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">Attachments</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>
          <div style="margin-top:10px;font-size:11px;color:#9ca3af;">Secure download links valid for 14 days.</div>
        </div>`;
      }
    }

    const contactMap = new Map<string, any>();
    if (payload.personalize !== false) {
      const { data: cts } = await admin.from('email_center_contacts')
        .select('email, full_name, company, phone, country, position, industry')
        .in('email', allRecipients);
      (cts || []).forEach((c: any) => contactMap.set(String(c.email).toLowerCase(), c));
    }

    const fromName = (payload.fromName || settings.company_name || 'RAC Logistics').trim();
    const from = `${fromName} <${FROM_MAILBOX}@${FROM_DOMAIN}>`;
    const batchId = payload.messageId || crypto.randomUUID();

    let queued = 0, failed = 0;
    const errors: string[] = [];

    for (const recipient of allRecipients) {
      const c = contactMap.get(recipient);
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
      };
      const bodyPersonalized = mergeVars(payload.bodyHtml, vars);
      const subjectPersonalized = mergeVars(payload.subject, vars);
      const html = wrapBranded(bodyPersonalized, settings, attachmentsHtml, subjectPersonalized);
      // Unique per attempt — reusing a key after a failed run returns 409 run_failed.
      const attemptTag = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const messageId = `ec-${batchId}-${recipient.replace(/[^a-z0-9]/gi, '')}-${attemptTag}`.slice(0, 120);

      const { error: enqueueError } = await admin.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          message_id: messageId,
          to: recipient,
          from,
          sender_domain: SENDER_DOMAIN,
          subject: subjectPersonalized,
          html,
          text: stripHtml(bodyPersonalized),
          purpose: 'transactional',
          label: payload.testTo ? 'email_center_test' : 'email_center',
          idempotency_key: messageId,
          queued_at: new Date().toISOString(),
        },
      });

      if (enqueueError) {
        failed++;
        errors.push(`${recipient}: ${enqueueError.message}`);
        await admin.from('email_send_log').insert({
          message_id: messageId,
          template_name: 'email_center',
          recipient_email: recipient,
          status: 'failed',
          error_message: enqueueError.message.slice(0, 1000),
        });
      } else {
        queued++;
        await admin.from('email_send_log').insert({
          message_id: messageId,
          template_name: payload.testTo ? 'email_center_test' : 'email_center',
          recipient_email: recipient,
          status: 'pending',
          metadata: { batch_id: batchId, subject: subjectPersonalized },
        });
      }
    }

    if (payload.messageId && !payload.testTo) {
      await admin.from('email_center_messages').update({
        status: queued ? 'sent' : 'failed',
        sent_count: queued,
        failed_count: failed,
        error_message: errors.length ? errors.join('\n').slice(0, 2000) : null,
        sent_at: new Date().toISOString(),
      }).eq('id', payload.messageId);
    }

    return json({ sent: queued, failed, errors, batchId });
  } catch (e: any) {
    console.error('send-branded-email failed', e);
    return json({ error: e?.message || 'Unexpected error while sending.' }, 500);
  }
});
