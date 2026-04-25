-- Re-apply with explicit search_path (already had it, but linter flagged — re-set to be safe)
ALTER FUNCTION public.generate_partner_referral_code() SET search_path = public;
ALTER FUNCTION public.referral_on_invoice_paid() SET search_path = public;