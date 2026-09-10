ALTER TABLE public.pricing_rules
  ADD COLUMN IF NOT EXISTS pricing_model text NOT NULL DEFAULT 'tiered',
  ADD COLUMN IF NOT EXISTS minimum_charge numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS volumetric_divisor numeric NOT NULL DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS effective_from date,
  ADD COLUMN IF NOT EXISTS effective_to date;

ALTER TABLE public.pricing_rules
  DROP CONSTRAINT IF EXISTS pricing_rules_pricing_model_check;
ALTER TABLE public.pricing_rules
  ADD CONSTRAINT pricing_rules_pricing_model_check
  CHECK (pricing_model IN ('flat','tiered','per_kg'));

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS pricing_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS currency text;
