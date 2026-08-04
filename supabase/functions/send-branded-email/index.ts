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

function wrapBranded(bodyHtml: string, settings: any, attachmentsHtml: string): string {
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
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:12px auto 0;"><tr>${social.map(s => `<td style="padding:0 6px;"><a href="${s.url}" style="text-decoration:none;"><img src="${s.icon}" alt="${s.label}" width="22" height="22" style="display:block;border:0;"/></a></td>`).join('')}</tr></table>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(company_name)}</title></head>
<body style="margin:0;padding:0;background:#f1f3f8;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1f2937;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f8;padding:32px 12px;"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e9f0;">
    <tr><td style="background:${primary_color};padding:22px 34px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td align="left"><img src="${logo_url}" alt="${escapeHtml(company_name)}" height="36" style="display:block;height:36px;width:auto;"/></td>
        <td align="right" style="font-size:11.5px;color:#cdd2e6;letter-spacing:.05em;text-transform:uppercase;">${escapeHtml(slogan)}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:38px 42px;font-size:15.5px;line-height:1.75;color:#1f2937;">${bodyHtml}${attachmentsHtml}</td></tr>
    <tr><td style="background:#fafbfc;border-top:1px solid #eef0f3;padding:24px 40px;text-align:center;">
      <div style="font-size:14px;font-weight:700;color:${primary_color};margin-bottom:3px;">${escapeHtml(company_name)}</div>
      <div style="font-size:11.5px;color:#6b7280;margin-bottom:8px;">${escapeHtml(slogan)}</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.65;">
        ${escapeHtml(address)}<br/>
        ${escapeHtml(phone)} &middot; <a href="mailto:${escapeHtml(support_email)}" style="color:${accent_color};text-decoration:none;">${escapeHtml(support_email)}</a><br/>
        <a href="${escapeHtml(website)}" style="color:${accent_color};text-decoration:none;">${escapeHtml(String(website || '').replace(/^https?:\/\//, ''))}</a>
      </div>
      ${socialHtml}
      <div style="margin-top:14px;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${escapeHtml(company_name)}. All rights reserved.</div>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
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
      const html = wrapBranded(bodyPersonalized, settings, attachmentsHtml);
      const messageId = `ec-${batchId}-${recipient.replace(/[^a-z0-9]/gi, '')}`.slice(0, 120);

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
