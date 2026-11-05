export function emailAddress(value: string): string {
  const match = value.match(/<([^<>]+)>/);
  return (match?.[1] || value).trim().toLowerCase();
}

export function notificationAddresses(values: string[]): string[] {
  const emails = [...new Set(values.map(emailAddress))];
  if (emails.some(e => !/^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(e))) throw new Error('Enter valid notification email addresses.');
  return emails;
}

export function directReplyAddresses(tags: string[] | null | undefined, senderEmail?: string): string[] {
  const addresses = notificationAddresses(tags || []);
  return addresses.length ? addresses : notificationAddresses([senderEmail || 'info@raclogisticltd.com']);
}

export function headerValue(headers: Record<string, string>, name: string): string {
  return Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || '';
}

export function referenceIds(value: string): string[] {
  return [...new Set(value.match(/<[^<>\s]+>/g) || [])];
}

export function isAutomaticReply(headers: Record<string, string>): boolean {
  const auto = headerValue(headers, 'auto-submitted').toLowerCase();
  return Boolean(auto && auto !== 'no') || /^(bulk|list|junk)$/i.test(headerValue(headers, 'precedence'));
}

export function routeToken(addresses: string[], domain: string): string | null {
  const tokens = addresses.map(emailAddress).map(address => {
    const [local, host] = address.split('@');
    return host === domain.toLowerCase() ? local?.match(/^reply\+([a-f0-9-]{36})$/i)?.[1]?.toLowerCase() : undefined;
  }).filter((v): v is string => Boolean(v));
  return new Set(tokens).size === 1 ? tokens[0] : null;
}

export function replyDecision(input: {
  sender: string; participant: string; notificationEmails: string[];
  referencedThreadIds: string[]; threadId: string; hasKnownReference: boolean;
}): 'customer' | 'notification-recipient' | 'reject' {
  if (!input.hasKnownReference || input.referencedThreadIds.some(id => id !== input.threadId)) return 'reject';
  const sender = emailAddress(input.sender);
  if (sender === emailAddress(input.participant)) return 'customer';
  if (input.notificationEmails.map(emailAddress).includes(sender)) return 'notification-recipient';
  return 'reject';
}

export function escapeEmailText(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, c => entities[c] || c);
}

export function replyPlainText(text: string | null, html: string | null): string {
  return text || (html || '').replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&').trim();
}