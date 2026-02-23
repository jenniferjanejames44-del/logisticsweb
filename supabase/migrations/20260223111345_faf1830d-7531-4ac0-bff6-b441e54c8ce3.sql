
-- Add Paystack payment tracking columns to invoices
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add unique index on paystack_reference to prevent duplicate payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_paystack_reference 
  ON public.invoices (paystack_reference) 
  WHERE paystack_reference IS NOT NULL;

-- Add payment_channel column to track payment method
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS payment_channel TEXT;
