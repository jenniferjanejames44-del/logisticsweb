-- Drop the security definer view and recreate with security_invoker
DROP VIEW IF EXISTS public.user_balances;

CREATE VIEW public.user_balances 
WITH (security_invoker = on) AS
SELECT 
  user_id,
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
FROM public.wallet_transactions
GROUP BY user_id;