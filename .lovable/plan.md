## Goals

1. Remove the **Start Your Shipment** form section from the homepage.
2. Redesign **Login** and **Signup** pages with a modern Africanies-style split layout (branding/marketing panel on the left, clean form on the right), keeping all existing backend logic intact.
3. Verify backend signup pipeline (profile metadata + email verification) is wired correctly — no schema changes needed (already in place from prior work).

## Changes

### 1. Homepage — remove shipment entry section
**File:** `src/pages/Index.tsx`
- Remove the `<ShipmentEntrySection />` import and usage.
- Leave file `src/components/home/ShipmentEntrySection.tsx` in place (unused, harmless) so we don't break anything else that may reference it. Can be deleted later.

### 2. Auth page redesign — `src/pages/Auth.tsx`

New layout (desktop ≥ lg):
```text
┌─────────────────────────────┬──────────────────────────────┐
│  BRAND PANEL (primary bg)   │   FORM PANEL (white)         │
│  • RAC logo                 │   • Tab toggle: Login|Signup │
│  • Headline + subcopy       │   • Form fields              │
│  • 3 feature bullets        │   • CTA button (accent)      │
│  • Trust badge / stats      │   • Forgot password link     │
└─────────────────────────────┴──────────────────────────────┘
```
On mobile (<lg): brand panel collapses to a compact header strip; form fills width.

Specifics:
- Two-column `grid lg:grid-cols-2 min-h-screen`.
- Left panel: `bg-primary text-primary-foreground` with subtle radial accent overlay, RAC logo, heading "Ship Smarter. Deliver Faster.", short subtext, 3 bullet features (Global Coverage, Real-time Tracking, Secure Payments) using Lucide icons in `bg-accent/15` chips, and a small testimonial/stat block at bottom.
- Right panel: white card-less form, max-w-md centered, with:
  - Segmented tab switcher (Login / Sign Up) at top using `bg-muted` rounded pills.
  - Same fields as today (Login: email + password; Signup: full name, phone *, email, password, address, city, country).
  - Inputs keep current `pl-10` icon style, height `h-11`, rounded-lg.
  - Primary CTA: accent (`#DF5101`) full-width button.
  - "Forgot password?" link in login mode → existing flow preserved.
  - Footer link to switch modes ("Don't have an account? Sign up" / "Already have an account? Sign in").
- Header/Footer: keep `<Header />` at top? Africanies-style auth pages typically omit the marketing header to focus the user. We'll **remove** `Header` and `Footer` from this page to match Africanies, but include a small "← Back to home" link in the top-left of the brand panel.
- Verification message banner & forgot-password sub-views stay functional — rendered inside the right form panel.

No changes to:
- `signUp` / `signIn` logic in `AuthContext.tsx`.
- Verification gate, resend logic, password reset flow.
- Form fields collected (still phone/address/city/country → already saved by `handle_new_user` trigger).

### 3. Backend verification (no migration needed)
- `handle_new_user` trigger already inserts `phone`, `address`, `city`, `country` into `profiles`.
- `auth-email-hook` already sends branded verification emails from `notify.raclogisticltd.com`.
- Email verification gate already enforced in `Auth.tsx` (lines 124–135).
- Nothing to migrate.

## Out of scope (failsafe)
- No DB schema changes.
- No changes to AuthContext, edge functions, or email templates.
- Homepage other sections untouched.

## Files touched
- `src/pages/Index.tsx` — remove one import + one JSX line.
- `src/pages/Auth.tsx` — rewrite layout (logic preserved).
