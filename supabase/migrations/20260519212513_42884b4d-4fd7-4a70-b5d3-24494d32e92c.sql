
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS terms text,
  ADD COLUMN IF NOT EXISTS customer_company text,
  ADD COLUMN IF NOT EXISTS customer_address text;

ALTER TABLE public.quotations ALTER COLUMN origin_country DROP NOT NULL;
ALTER TABLE public.quotations ALTER COLUMN destination_country DROP NOT NULL;
ALTER TABLE public.quotations ALTER COLUMN shipping_method DROP NOT NULL;
ALTER TABLE public.quotations ALTER COLUMN shipment_type DROP NOT NULL;
