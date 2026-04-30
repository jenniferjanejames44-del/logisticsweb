## Problem

Supabase's `auth.signUp()` has anti-enumeration behavior built in: when someone signs up with an email that already exists, it returns success without sending a confirmation email. The user sees "Account created!" but never gets an OTP/verification email and is left confused. We need to explicitly block duplicate signups and show "This email is already registered. Please sign in instead."

## Solution

### 1. Pre-signup duplicate check (edge function)

Create a tiny edge function `check-email-exists` that uses the **service role key** to look up whether an email already exists in `auth.users`. This is the only safe way to check, because client-side queries cannot read `auth.users` and the `profiles` table can lag if a signup partially failed.

- Path: `supabase/functions/check-email-exists/index.ts`
- Input: `{ email: string }`
- Logic: use `supabase.auth.admin.listUsers()` filtered by email (or query `auth.users` directly via service role) and return `{ exists: boolean, confirmed: boolean }`
- CORS enabled, no JWT required (it only returns a boolean)
- Add a simple in-memory rate limit (max 10 calls/min per IP) to discourage email enumeration abuse
- Register in `supabase/config.toml` with `verify_jwt = false`

### 2. Wire it into the signup flow (`src/pages/Auth.tsx`)

In `handleSubmit`, before calling `signUp(...)` in the signup branch:

1. Call `supabase.functions.invoke("check-email-exists", { body: { email } })`
2. If `exists === true && confirmed === true`:
   - Show toast: **"Email already registered"** — *"This email is already in use. Please sign in or reset your password."*
   - Auto-switch the form to the Sign In tab and pre-fill the email
   - Stop — do not call `signUp`
3. If `exists === true && confirmed === false`:
   - Show toast: **"Account exists but unverified"** — *"We've already sent a verification link to this email. Please check your inbox or click 'Resend' below."*
   - Show the existing `showVerificationMessage` panel with the resend button
   - Stop — do not call `signUp`
4. Otherwise, proceed with the existing `signUp(...)` call as today.

### 3. Belt-and-suspenders: detect silent duplicate from Supabase response

Even with the pre-check, also harden the post-signup path. Supabase returns `data.user.identities = []` when the email is already registered (silent duplicate). After `signUp` succeeds, check this and surface the same "Email already registered" message instead of the misleading "Check your email" success state.

### 4. Login UX (small touch)

Keep the existing "Email not confirmed" handling as-is — it already correctly blocks login and offers a resend button. No changes needed there.

## Files Changed

- **NEW** `supabase/functions/check-email-exists/index.ts` — service-role email lookup
- **EDIT** `supabase/config.toml` — register new function with `verify_jwt = false`
- **EDIT** `src/pages/Auth.tsx` — pre-signup check + identities-empty fallback + auto-switch to sign-in
- **EDIT** `src/contexts/AuthContext.tsx` — make `signUp` return `{ error, alreadyRegistered }` so the UI can branch cleanly

## What this does NOT change

- No database migrations, no schema changes, no RLS changes
- No changes to login, OTP flow, password reset, dashboards, shipments, payments, partners, or admin
- No changes to the `auth-email-hook` or email templates — verification emails still work normally for new signups
- Existing users are unaffected

## Behavior after the fix

| Scenario | Result |
|---|---|
| New email → signup | Account created, verification email sent (unchanged) |
| Existing **verified** email → signup | Blocked with "Email already registered. Please sign in." → auto-switches to Sign In tab |
| Existing **unverified** email → signup | Blocked with "Account exists but unverified. Resend verification?" → resend button shown |
| Existing email → login without verifying | Blocked with "Please verify your email" + resend (unchanged) |