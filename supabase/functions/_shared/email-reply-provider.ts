export async function resendRequest(path: string, init: RequestInit = {}): Promise<any> {
  const key = Deno.env.get('RESEND_API_KEY');
  const appKey = Deno.env.get('LOVABLE_API_KEY');
  if (!key || !appKey) throw new Error('Email connection is unavailable.');
  const res = await fetch(`https://connector-gateway.lovable.dev/resend${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${appKey}`, 'X-Connection-Api-Key': key, ...init.headers },
  });
  if (!res.ok) throw new Error(`Resend request failed (${res.status}): ${(await res.text()).slice(0, 500)}`);
  return res.json();
}

export async function receivingReady(admin: any): Promise<{ ready: boolean; domain: string }> {
  const { data: settings, error } = await admin.from('email_reply_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!settings?.enabled || !settings?.provider_domain_id || !Deno.env.get('RESEND_REPLY_WEBHOOK_SECRET')) return { ready: false, domain: settings?.receiving_domain || 'replies.raclogisticltd.com' };
  const domain = await resendRequest(`/domains/${encodeURIComponent(settings.provider_domain_id)}`);
  const receivingRecords = (domain.records || []).filter((r: any) => r.type === 'MX' && r.record === 'Receiving');
  const ready = domain.capabilities?.receiving === 'enabled' && receivingRecords.length > 0 && receivingRecords.every((r: any) => r.status === 'verified');
  return { ready, domain: settings.receiving_domain };
}