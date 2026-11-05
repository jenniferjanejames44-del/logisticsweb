import { describe, expect, it } from 'vitest';
import { emailAddress, notificationAddresses, routeToken, replyDecision, referenceIds, isAutomaticReply, replyPlainText, escapeEmailText } from '../../supabase/functions/_shared/email-reply-core';

describe('private email reply routing', () => {
  const base = { sender: 'customer@example.com', participant: 'customer@example.com', notificationEmails: ['admin@example.com'], referencedThreadIds: ['thread-a'], threadId: 'thread-a', hasKnownReference: true };
  it('matches a customer to their own original conversation', () => expect(replyDecision(base)).toBe('customer'));
  it('lets a tagged admin reply from their normal inbox', () => expect(replyDecision({ ...base, sender: 'admin@example.com' })).toBe('notification-recipient'));
  it('rejects a different recipient from a bulk send', () => expect(replyDecision({ ...base, sender: 'bcc@example.com' })).toBe('reject'));
  it('rejects conflicting thread references', () => expect(replyDecision({ ...base, referencedThreadIds: ['thread-a', 'thread-b'] })).toBe('reject'));
  it('does not match on subject or route token alone', () => expect(replyDecision({ ...base, hasKnownReference: false })).toBe('reject'));
  it('removing a tagged address revokes future inbox replies', () => expect(replyDecision({ ...base, sender: 'admin@example.com', notificationEmails: [] })).toBe('reject'));
  it('normalizes and deduplicates configurable notification recipients', () => expect(notificationAddresses(['Admin@Example.com', 'admin@example.com'])).toEqual(['admin@example.com']));
  it('rejects invalid notification recipients', () => expect(() => notificationAddresses(['not-an-email'])).toThrow());
  it('accepts a conversation address only on the configured domain', () => {
    const token = 'b41bcb00-9736-44f6-b3a6-8a1b31a9f731';
    expect(routeToken([`reply+${token}@replies.example.com`], 'replies.example.com')).toBe(token);
    expect(routeToken([`reply+${token}@evil.example.com`], 'replies.example.com')).toBeNull();
  });
  it('rejects multiple different routing tokens', () => expect(routeToken(['reply+b41bcb00-9736-44f6-b3a6-8a1b31a9f731@replies.example.com', 'reply+b41bcb00-9736-44f6-b3a6-8a1b31a9f732@replies.example.com'], 'replies.example.com')).toBeNull());
  it('handles RFC references in repeated replies', () => expect(referenceIds('<first@example.com> <second@example.com> <first@example.com>')).toEqual(['<first@example.com>', '<second@example.com>']));
  it('prevents automatic responder loops', () => expect(isAutomaticReply({ 'Auto-Submitted': 'auto-replied' })).toBe(true));
  it('permits a normal human email', () => expect(isAutomaticReply({ 'Auto-Submitted': 'no' })).toBe(false));
  it('removes executable content from HTML-only replies', () => expect(replyPlainText(null, '<script>alert(1)</script><p>Hello</p>')).toBe('Hello'));
  it('escapes actual reply content when forwarding', () => expect(escapeEmailText('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;'));
  it('normalizes mailbox display names', () => expect(emailAddress('Customer <CUSTOMER@example.com>')).toBe('customer@example.com'));
});