import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const nowIso = new Date().toISOString();

  // Claim due scheduled messages atomically
  const { data: due, error } = await admin
    .from('email_center_messages')
    .update({ status: 'sending' })
    .eq('status', 'scheduled')
    .lte('scheduled_at', nowIso)
    .select('*')
    .limit(20);

  if (error) return json({ error: error.message }, 500);
  if (!due || !due.length) return json({ processed: 0 });

  let processed = 0;
  for (const m of due) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-branded-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
          messageId: m.id,
          subject: m.subject,
          bodyHtml: m.body_html,
          to: m.to_recipients,
          cc: m.cc_recipients,
          bcc: m.bcc_recipients,
          attachments: m.attachments,
          fromName: m.from_name,
          personalize: true,
        }),
      });
      if (!res.ok) {
        await admin.from('email_center_messages')
          .update({ status: 'failed', error_message: await res.text() })
          .eq('id', m.id);
      }
      processed++;
    } catch (e: any) {
      await admin.from('email_center_messages')
        .update({ status: 'failed', error_message: e.message })
        .eq('id', m.id);
    }
  }

  return json({ processed });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}