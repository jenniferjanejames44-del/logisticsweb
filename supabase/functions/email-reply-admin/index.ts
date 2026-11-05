import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.25.76';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { notificationAddresses, escapeEmailText } from '../_shared/email-reply-core.ts';
import { receivingReady } from '../_shared/email-reply-provider.ts';

const Schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }),
  z.object({ action: z.literal('recipients'), threadId: z.string().uuid(), emails: z.array(z.string().email().max(254)) }),
  z.object({ action: z.literal('read'), threadId: z.string().uuid(), read: z.boolean() }),
  z.object({ action: z.literal('reply'), threadId: z.string().uuid(), text: z.string().trim().min(1).max(100000) }),
]);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return json({ error: 'Please sign in again.' }, 401);
    const { data: role } = await admin.from('user_roles').select('id').eq('user_id', auth.user.id).eq('role', 'admin').maybeSingle();
    if (!role) return json({ error: 'Admin access required.' }, 403);
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid reply request.', details: parsed.error.flatten() }, 400);
    const body = parsed.data;
    if (body.action === 'status') return json(await receivingReady(admin));
    const { data: thread, error } = await admin.from('email_reply_threads').select('*').eq('id', body.threadId).single();
    if (error || !thread) return json({ error: 'Conversation not found.' }, 404);
    if (body.action === 'recipients') {
      const { error: updateError } = await admin.from('email_reply_threads').update({ notification_emails: notificationAddresses(body.emails) }).eq('id', thread.id);
      if (updateError) throw updateError;
    }
    if (body.action === 'read') {
      const { error: updateError } = await admin.from('email_reply_items').update({ read_at: body.read ? new Date().toISOString() : null }).eq('thread_id', thread.id).eq('direction', 'received');
      if (updateError) throw updateError;
    }
    if (body.action === 'reply') {
      const setup = await receivingReady(admin);
      if (!setup.ready) return json({ error: 'Incoming reply setup must be verified before sending a threaded reply.' }, 409);
      const { data: latest } = await admin.from('email_reply_items').select('rfc_message_id, reference_ids').eq('thread_id', thread.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!latest) return json({ error: 'Conversation history is unavailable.' }, 409);
      const queueId = `er-${crypto.randomUUID()}`;
      const rfcId = `<${queueId}@raclogisticltd.com>`;
      const subject = /^re:/i.test(thread.subject) ? thread.subject : `Re: ${thread.subject}`;
      const refs = [...new Set([...latest.reference_ids, latest.rfc_message_id])];
      const { error: queueError } = await admin.rpc('queue_email_thread_item', {
        _thread_id: thread.id,
        _item: { sender_email: 'info@raclogisticltd.com', recipient_email: thread.participant_email, subject, body_text: body.text, body_html: '', rfc_message_id: rfcId, in_reply_to: latest.rfc_message_id, reference_ids: refs },
        _payload: { message_id: queueId, idempotency_key: queueId, to: thread.participant_email, from: 'RAC LOGISTICS LTD <info@raclogisticltd.com>', subject, text: body.text, html: `<p>${escapeEmailText(body.text).replace(/\n/g, '<br/>')}</p>`, reply_to: `reply+${thread.route_token}@${setup.domain}`, headers: { 'Message-ID': rfcId, 'In-Reply-To': latest.rfc_message_id, References: refs.join(' ') }, label: 'email_center_reply', queued_at: new Date().toISOString() },
      });
      if (queueError) throw queueError;
    }
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Reply action failed.' }, 500);
  }
});