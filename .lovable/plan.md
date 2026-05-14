# Email Campaign & Marketing Automation System

A production-grade campaign system layered on top of the existing Resend integration. Zero changes to signup, login, password reset, shipment, payment, or current admin/user dashboards — all new features live in their own module, tables, and edge functions.

---

## Scope guardrails (will NOT touch)

- `src/contexts/AuthContext.tsx`, `src/pages/Auth.tsx`, `AuthCallback`, `AuthConfirm`, `ResetPassword`
- Existing shipment + payment flows (`CreateShipment`, `PayShipmentDialog`, paystack-* functions)
- `auth-email-hook`, `process-email-queue`, existing `send-notification-email`, `notify-shipment-created`, `send-shipment-notification`
- Current admin/user dashboard pages (only ADD new routes/sidebar entries)
- DB triggers and RLS already in place

---

## 1. Database (new tables only)

New migration adds:

- `email_subscribers` — id, user_id (nullable), full_name, email (unique), phone, country, account_type (`customer|partner|lead`), source (`signup|shipment|partner|newsletter|manual`), marketing_opt_in (bool, default true), last_activity_at, unsubscribed_at, created_at, updated_at
- `email_templates` — id, name, slug (unique), category (`transactional|holiday|promo|announcement|welcome`), subject, heading, body_html, body_text, cta_label, cta_url, banner_url, footer_text, is_system (bool — system templates can't be deleted), created_by, timestamps
- `email_campaigns` — id, name, template_id, subject, heading, body_html, cta_label, cta_url, banner_url, footer_text, audience_filter (jsonb: {scope, country, account_type, activity}), status (`draft|scheduled|sending|sent|cancelled|failed`), scheduled_at, sent_at, created_by, timestamps
- `email_campaign_recipients` — id, campaign_id, subscriber_id, email, status (`pending|sent|failed|bounced|opened|clicked`), resend_message_id, error_message, sent_at, opened_at, clicked_at
- `email_automation_rules` — id, trigger (`signup|shipment_created|shipment_delivered|payment_success|partner_approved`), template_slug, is_active

RLS: admin-only manage on all; subscribers can update their own opt-in via token.

Triggers (NEW, additive only):
- `on_auth_user_created` → upsert into `email_subscribers` (source=`signup`)
- `on_shipment_insert` → upsert subscriber, set last_activity, source=`shipment`
- `on_partner_approved` → upsert, account_type=`partner`

Backfill existing `profiles` + `partners` into `email_subscribers` once.

---

## 2. Edge functions (new)

- `send-campaign` — admin-invoked. Loads campaign, expands audience filter into recipients, batches through Resend (respecting suppression + opt-in), writes per-recipient rows, updates campaign status. Uses `RESEND_API_KEY` already in secrets.
- `process-scheduled-campaigns` — pg_cron every minute, picks campaigns where `status='scheduled' AND scheduled_at <= now()`, calls `send-campaign`.
- `email-track` — public GET endpoints `?c=<recipient_id>&t=open|click&u=<url>` for open pixel + click redirect. Updates `email_campaign_recipients`.
- `email-unsubscribe` — public GET/POST. Token-based (HMAC of subscriber id), flips `marketing_opt_in=false`, sets `unsubscribed_at`. Renders branded confirmation page (or returns JSON for SPA page).

All set `verify_jwt = false` where needed in `supabase/config.toml`.

---

## 3. Admin UI (new section "Email Campaigns")

New sidebar group in `AdminSidebar.tsx` → routes under `/admin/email/*`:

- `/admin/email` — Campaign Dashboard: KPI cards (total sent, delivered, open rate, click rate, active subscribers), recent campaigns table.
- `/admin/email/campaigns/new` — Create/Edit Campaign: form (name, subject, heading, body rich text, CTA label/link, banner upload, footer), live preview pane rendering the branded email shell, audience filter (scope, country multi-select, account_type, activity window), Save Draft / Schedule / Send Now.
- `/admin/email/campaigns/:id` — Campaign detail with recipient table + per-status counts.
- `/admin/email/templates` — list, create/edit/duplicate templates. Seeded with: Welcome, Shipment Created, Payment Successful, Shipment Delivered, Forgot Password, Christmas, Sallah, New Year, Easter, Promo, Discount, Partner Approval.
- `/admin/email/subscribers` — searchable/filterable table, export CSV, manual add, toggle opt-in.
- `/admin/email/scheduled` — scheduled queue with cancel/resend.
- `/admin/email/analytics` — charts (sent/delivered/open/click over time, top campaigns).

UI uses existing design tokens (Navy `#061043`, Accent Orange `#DF5101`, DM Sans, 48px buttons, flat overlays). Mobile: card layout for tables, collapsible filters.

---

## 4. Branded email shell

Single React-Email-style HTML builder in `supabase/functions/_shared/campaign-template.ts`:
- RAC logo header on navy band
- Hero banner image (optional)
- Heading (DM Sans, 24px, navy)
- Body (15px, slate-700)
- Orange CTA button (rounded 10px, 48px tall)
- Footer: contact details, social links (from `mem://company/contact-details`), unsubscribe link with token, address
- Inline-styled, table-based for Outlook/Gmail/mobile compatibility
- Tracking pixel + click-wrapped CTA URL

Used by both campaign sends and template previews so admin sees exactly what users get.

---

## 5. Automation wiring (additive)

`email_automation_rules` rows seeded for: signup→Welcome, shipment_created→Shipment Created, payment_success→Payment Successful, shipment_delivered→Shipment Delivered, partner_approved→Partner Approval.

A small dispatcher edge function `dispatch-automation` is invoked by existing triggers' webhooks (we add lightweight calls inside NEW DB triggers only — existing functions like `notify_new_shipment` are left untouched; we add a parallel trigger that calls `dispatch-automation`). It looks up the active rule and queues via existing `enqueue_email` infrastructure so transactional flow stays intact.

Transactional emails (verification, password reset, shipment, payment) keep using their current path — automation rules only ADD branded marketing-style notifications where none exist; if a rule's slug duplicates an existing transactional email, the rule is disabled by default.

---

## 6. Suppression & compliance

- Every marketing send checks `email_subscribers.marketing_opt_in=true` AND not in `suppressed_emails`.
- Unsubscribe link present in every campaign email (NOT in transactional).
- One-click unsubscribe via signed token; no login required.
- Transactional emails (verification, password, shipment, payment) bypass opt-in check.

---

## 7. Analytics

Aggregations computed from `email_campaign_recipients`:
- Sent / Delivered / Failed / Open rate / Click rate per campaign and global
- Time-series via grouped-by-day query
- Charts using existing recharts setup

---

## 8. Files added (no edits to protected files)

```text
supabase/migrations/<ts>_email_campaign_system.sql
supabase/functions/send-campaign/index.ts
supabase/functions/process-scheduled-campaigns/index.ts
supabase/functions/email-track/index.ts
supabase/functions/email-unsubscribe/index.ts
supabase/functions/dispatch-automation/index.ts
supabase/functions/_shared/campaign-template.ts
src/pages/admin/email/EmailDashboard.tsx
src/pages/admin/email/CampaignList.tsx
src/pages/admin/email/CampaignEditor.tsx
src/pages/admin/email/CampaignDetail.tsx
src/pages/admin/email/Templates.tsx
src/pages/admin/email/TemplateEditor.tsx
src/pages/admin/email/Subscribers.tsx
src/pages/admin/email/Scheduled.tsx
src/pages/admin/email/Analytics.tsx
src/pages/Unsubscribe.tsx
src/components/admin/email/EmailPreview.tsx
src/components/admin/email/AudienceFilter.tsx
src/components/admin/email/CampaignStatsCards.tsx
src/lib/emailCampaigns.ts
```

Edits limited to: `src/App.tsx` (new routes), `src/components/admin/AdminSidebar.tsx` (new "Email" section), `supabase/config.toml` (new function blocks).

---

## 9. Testing checklist (run after build)

- Signup → subscriber row appears, welcome email queued
- Shipment created → subscriber updated, no duplicate, transactional email still sent by existing path
- Create draft campaign → preview matches sent email
- Schedule campaign → cron picks it up, recipients populated, statuses transition
- Unsubscribe link → opt-in flips, future campaigns skip user, transactional still works
- Forgot password / verification / payment / shipment flows unchanged

---

## Notes

- Heavy module — implementation will land across multiple steps. Approving this plan starts with the migration + edge functions, then admin UI, then automation wiring.
- All work is additive. No schema changes to existing tables, no edits to existing edge functions or auth/shipment/payment code paths.
