-- Create wallet_transactions table to track all balance changes
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a view to get user balances (sum of credits minus debits)
CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
  user_id,
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
FROM public.wallet_transactions
GROUP BY user_id;

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert transactions (for crediting user accounts)
CREATE POLICY "Admins can insert transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System can insert debit transactions for shipments (via user context)
CREATE POLICY "Users can insert debit transactions for themselves"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id AND type = 'debit');

-- Add price column to shipments table (admin sets this)
ALTER TABLE public.shipments ADD COLUMN price NUMERIC DEFAULT NULL;

-- Add payment_status to track if shipment is paid
ALTER TABLE public.shipments ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid'));