# Mail Center reply notifications

## Audit findings
- The existing Mail Center is admin-only and already sends through the connected Resend account.
- Resend's company domain has sending enabled, receiving disabled, and no webhooks.
- Replies currently go to the company inbox; no incoming conversation history is stored.
- The existing delivery queue can be extended; it does not need replacing.

## What will change
1. Add reply-notification address tags to each conversation. Default to the sending admin's registered email; admins may add or change customer, client, or other authorized addresses. Changes apply to future replies, not automatic redistribution of old private messages.
2. Track each recipient's conversation separately so bulk messages and BCC recipients cannot expose one another's replies.
3. Detect real incoming replies, match them to the original outgoing email, and preserve the actual reply content, sender, subject, time, and conversation reference.
4. Automatically email each conversation's configured notification recipients through the existing queue, recording pending, successful, and failed notification outcomes. Notifications will allow a normal email response that continues the same conversation.
5. Extend the existing Mail Center with a conversations view, incoming/outgoing labels, unread/read status, latest reply, and reply controls. Keep current compose, contacts, templates, scheduling, previews, and delivery features intact.

## Receiving setup
- Use a separate receiving subdomain, proposed `replies.raclogisticltd.com`, rather than changing the company's existing inbox or the delegated `notify` subdomain.
- Configure Resend receiving and a signed incoming-email webhook. Obtain exact DNS records from Resend, never guess them.
- Store the provider-issued webhook signing secret securely. DNS changes may require the domain owner's action; receiving cannot be declared live before verification.
- Until receiving is verified, keep existing outbound sending and reply destinations unchanged. Older emails are not automatically imported; replies to those still reach their original company inbox.

## Technical details
- Add protected thread, participant, reply, and notification records with explicit grants and RLS. Derive account identity server-side; only authorized admins may change notification recipients.
- Keep per-recipient routing tokens private and unguessable; record provider IDs and RFC Message-ID, In-Reply-To, and References. Match headers and routing together; never match solely by subject.
- Verify webhook signatures against the raw request body, retrieve content through the connected Resend account, validate participants, and quarantine unrecognized or conflicting replies without forwarding them.
- Sanitize incoming content for display, suppress automatic-response loops, and deduplicate both incoming messages and each recipient's notification. Preserve retry safety when processing fails midway.
- Extend the shared queue to retain thread headers and report real provider acceptance/failure; provider acceptance is not proof of inbox delivery.

## Verification and completion
- Automated checks: correct thread and recipients, multiple replies, recipient edits, BCC isolation, invalid signatures, unknown senders, duplicate webhook retries, safe content, and notification retry behavior.
- Signed-in desktop and iPhone-size checks: send, conversation history, unread/read changes, reply, recipient tags, and failure visibility.
- Approved live test: send to a real external inbox, reply normally, confirm receipt in the Mail Center and selected notification inbox, then confirm a second reply remains in the same thread.
- Report DNS/provider configuration or inbox confirmation still needed explicitly; do not claim production readiness from simulated tests alone.