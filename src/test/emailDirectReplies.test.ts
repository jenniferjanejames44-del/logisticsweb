import { describe, expect, it } from 'vitest';
import { directReplyAddresses } from '../../supabase/functions/_shared/email-reply-core';

describe('direct tagged inbox replies without inbound DNS', () => {
  it('uses every tagged address instead of the sending account', () => {
    expect(directReplyAddresses(['client@example.com', 'team@example.com'], 'admin@example.com')).toEqual(['client@example.com', 'team@example.com']);
  });
  it('uses the registered sender when tags were not specified', () => expect(directReplyAddresses(null, 'admin@example.com')).toEqual(['admin@example.com']));
  it('uses the registered sender when the last tag is removed', () => expect(directReplyAddresses([], 'admin@example.com')).toEqual(['admin@example.com']));
  it('rejects invalid destinations', () => expect(() => directReplyAddresses(['bad-address'])).toThrow());
  it('normalizes tags and prevents duplicate destinations', () => expect(directReplyAddresses(['TEAM@example.com', 'team@example.com'])).toEqual(['team@example.com']));
});