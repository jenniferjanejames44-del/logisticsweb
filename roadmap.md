# Roadmap

## SMS Management System (uploaded brief, Termii + BulkSMSNigeria)
- [ ] DB schema: providers, templates, campaigns, messages, automation rules, contacts, suppressions, audit log
- [ ] Provider abstraction (_shared/sms-providers.ts) — Termii primary, BulkSMSNigeria backup
- [ ] Edge functions: sms-admin (settings/send/campaigns), process-sms-queue (automation worker)
- [ ] Automation triggers: welcome, shipment created, status change, payment received
- [ ] Admin SMS Center UI + sidebar + route
- [ ] Verify build; real sending blocked until Termii API key is entered in Provider Settings

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
