# Roadmap

## SMS international route
- [ ] Replace direct-refund with the provider-documented international route for all SMS sends; test and deploy both SMS functions
- [ ] Confirm receipt on an affected phone — requires an approved test recipient and their receipt confirmation

## BulkSMSNigeria switch
- [x] Make BulkSMSNigeria the active primary sender and disable Termii; verified saved provider settings from signed-in SMS page
- [x] BulkSMSNigeria token saved securely; both SMS functions deployed; signed-in connection test accepted; nine SMS regression tests pass
- [ ] Confirm live SMS delivery — requires a test message to an approved recipient; connection verification does not confirm phone delivery

## SMS pause (user request, 2026-10-23)
- [x] SMS sending paused via `sms_internal_config` key `sms_paused` = `true`; queue worker skips draining and admin send/campaign actions are blocked (HTTP 423); both functions deployed
- [ ] Resume SMS when the user asks — set `sms_paused` to `false` in `sms_internal_config` (queued messages will then send)

## Termii sending repair
- [x] Correct Nigerian local mobile-number formatting; nine regression tests pass including bulk provider payloads; both SMS functions deployed; website build OK
- [x] Use the saved Termii secret for manual, campaign, and automated SMS configuration checks
- [x] Five regression tests pass; deployed Termii connection accepted from the signed-in SMS page; website build OK
- [x] Termii live delivery check superseded by the requested BulkSMSNigeria switch

## Quotation email repair
- [x] Diagnose and fix quotation email errors
- [x] Verify signed-in quotation save → email queue → delivery status (company inbox test; provider accepted)

## SMS Management System (uploaded brief, Termii + BulkSMSNigeria)
- [x] DB schema: providers, templates, campaigns, messages, automation rules, contacts, suppressions, audit log
- [x] Provider abstraction (_shared/sms-providers.ts) — Termii primary, BulkSMSNigeria backup
- [x] Edge functions: sms-admin (settings/send/campaigns), process-sms-queue (automation worker)
- [x] Automation triggers: welcome, shipment created, status change, payment received
- [x] Admin SMS Center UI + sidebar + route (verified signed-in in preview)
- [x] Queue pipeline self-test: enqueue → wake → drain → cron unschedules; forged worker calls rejected
- [x] Real sending: Termii API key stored securely and wired into the provider fallback; Test Connection returns ok (2026-10-19). Live SMS delivery to a real phone not yet verified.

- [x] Fix restricted-browser startup and older Safari UUID compatibility
- [x] Verify homepage loading and navigation with browser restrictions

- [x] Create one premium branded email shell for preview and delivery
- [x] Upgrade built-in templates and template gallery
- [x] Refine composer, review, send, history, and delivery presentation
- [x] Deploy the updated email sender
- [x] Verify logo and clickable footer icons in delivered output
- [x] Simplify email actions and keep one website button near the mobile-friendly footer
- [x] Refine the email logo as a compact white mark without a background panel
- [x] Clean the email header wording, service separators, and mobile brand layout
- [x] Show the sender-domain suspension prominently in the Email Center and pause sending actions
