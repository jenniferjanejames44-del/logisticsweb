import { createClient } from 'npm:@supabase/supabase-js@2';
import { Webhook } from 'npm:svix@1.84.1';
import { z } from 'npm:zod@3.25.76';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { emailAddress, headerValue, referenceIds, routeToken, replyDecision, isAutomaticReply, replyPlainText, escapeEmailText } from '../_shared/email-reply-core.ts';
import { resendRequest } from '../_shared/email-reply-provider.ts';

const Event = z.object({ type: z.string(), created_at: z.string(), data: z.object({ email_id: z.string().uuid(), message_id: z.string().optional() }).passthrough() });
const Received = z.object({ from: z.string().max(1000), to: z.array(z.string().max(1000)), subject: z.string().max(10000), text: z.string().nullable().optional(), html: z.string().nullable().optional(), headers: z.record(z.string()).default({}), message_id: z.string().max(1000) });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const secret = Deno.env.get('RESEND_REPLY_WEBHOOK_SECRET');
  if (!secret) return json({ error: 'Reply receiving is not configured.' }, 503);
  let event: z.infer<typeof Event>;
  try {
    const raw = await req.text();
    if (raw.length > 2000000) return json({ error: 'Payload too large' }, 413);
    const verified = new Webhook(secret).verify(raw, {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': req.headers.get('svix-signature') || '',
    });
    event = Event.parse(verified);
  } catch {
    return json({ error: 'Invalid webhook signature or payload.' }, 400);
  }
  if (event.type !== 'email.received') return json({ ignored: true });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: processed, error: processedError } = await admin.from('email_reply_events').select('outcome').eq('provider_email_id', event.data.email_id).maybeSingle();
    if (processedError) throw processedError;
    if (processed?.outcome === 'processed') return json({ duplicate: true });
    const incoming = Received.parse(await resendRequest(`/emails/receiving/${encodeURIComponent(event.data.email_id)}`));
    const { data: settings } = await admin.from('email_reply_settings').select('receiving_domain').eq('id', 1).maybeSingle();
    const token = routeToken(incoming.to, settings?.receiving_domain || '');
    const { data: thread } = token ? await admin.from('email_reply_threads').select('*').eq('route_token', token).maybeSingle() : { data: null };
    const quarantine = async (reason: string) => {
      const { error } = await admin.from('email_reply_events').upsert({ provider_email_id: event.data.email_id, thread_id: thread?.id || null, outcome: 'quarantined', reason });
      if (error) throw error;
      return json({ quarantined: true });
    };
    if (!thread) return await quarantine('Unknown or conflicting conversation address');
    if (isAutomaticReply(incoming.headers)) return await quarantine('Automatic response suppressed to prevent email loops');
    const inReplyTo = headerValue(incoming.headers, 'in-reply-to');
    const refs = referenceIds(`${inReplyTo} ${headerValue(incoming.headers, 'references')}`);
    const { data: itemRefs, error: itemRefError } = await admin.from('email_reply_items').select('thread_id,rfc_message_id').in('rfc_message_id', refs);
    if (itemRefError) throw itemRefError;
    const { data: notificationRefs, error: notificationRefError } = await admin.from('email_reply_notifications').select('item_id,rfc_message_id,email_reply_items(thread_id)').in('rfc_message_id', refs);
    if (notificationRefError) throw notificationRefError;
    const threadIds = [...(itemRefs || []).map(r => r.thread_id), ...(notificationRefs || []).map((r: any) => r.email_reply_items?.thread_id).filter(Boolean)];
    const decision = replyDecision({ sender: incoming.from, participant: thread.participant_email, notificationEmails: thread.notification_emails, referencedThreadIds: threadIds, threadId: thread.id, hasKnownReference: threadIds.length > 0 });
    if (decision === 'reject') return await quarantine('Sender or message references do not match this conversation');
    const text = replyPlainText(incoming.text || null, incoming.html || null);
    const sender = emailAddress(incoming.from);
    const targets: string[] = decision === 'customer' ? thread.notification_emails.filter((email: string) => email !== sender && email !== thread.participant_email) : [thread.participant_email];
    const notifications = targets.map((to: string, index: number) => {
      const queueId = `ern-${event.data.email_id}-${index}`;
      const rfcId = `<${queueId}@raclogisticltd.com>`;
      const title = /^re:/i.test(incoming.subject) ? incoming.subject : `Re: ${incoming.subject}`;
      return {
        message_id: queueId, idempotency_key: queueId, to,
        from: 'RAC LOGISTICS LTD <info@raclogisticltd.com>', subject: title,
        text: `From: ${sender}\nConversation: ${thread.subject}\nReference: ${thread.id}\n\n${text}`,
        html: `<p>From: ${escapeEmailText(sender)}</p><p>Conversation: ${escapeEmailText(thread.subject)}</p><p>Reference: ${escapeEmailText(thread.id)}</p><hr/><p>${escapeEmailText(text).replace(/\n/g, '<br/>')}</p>`,
        reply_to: `reply+${thread.route_token}@${settings?.receiving_domain}`,
        headers: { 'Message-ID': rfcId, 'In-Reply-To': incoming.message_id, References: [...refs, incoming.message_id].join(' '), 'Auto-Submitted': 'auto-generated', 'X-Auto-Response-Suppress': 'All' },
        label: 'email_reply_notification', queued_at: new Date().toISOString(),
      };
    });
    const { error: ingestError } = await admin.rpc('ingest_email_thread_reply', {
      _thread_id: thread.id,
      _item: { sender_email: sender, recipient_email: emailAddress(incoming.to[0] || ''), subject: incoming.subject, body_text: text, body_html: '', rfc_message_id: incoming.message_id, in_reply_to: inReplyTo || null, reference_ids: refs, provider_email_id: event.data.email_id },
      _notifications: notifications,
    });
    if (ingestError) throw ingestError;
    return json({ processed: true });
  } catch (error) {
    console.error('Incoming reply processing failed', { message: error instanceof Error ? error.message : 'Unknown error' });
    return json({ error: 'Reply processing failed; the provider should retry.' }, 500);
  }
});