
-- Drop obsolete pricing tables (replaced by country_pricing_rules)
DROP TABLE IF EXISTS public.weight_pricing CASCADE;
DROP TABLE IF EXISTS public.heavy_weight_pricing CASCADE;
DROP TABLE IF EXISTS public.zone_countries CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;
DROP TABLE IF EXISTS public.extra_charges CASCADE;
DROP TABLE IF EXISTS public.processing_fees CASCADE;
DROP TABLE IF EXISTS public.tax_settings CASCADE;

-- New country-based pricing engine
CREATE TABLE public.country_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  flat_price numeric NOT NULL DEFAULT 0,
  flat_weight_threshold_kg numeric NOT NULL DEFAULT 0,
  price_per_kg numeric NOT NULL DEFAULT 0,
  handling_fee numeric NOT NULL DEFAULT 0,
  vat_percent numeric NOT NULL DEFAULT 0,
  insurance_percent numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country)
);

CREATE INDEX idx_country_pricing_country ON public.country_pricing_rules(country);

ALTER TABLE public.country_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active country pricing"
ON public.country_pricing_rules FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage country pricing"
ON public.country_pricing_rules FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_country_pricing_rules_updated_at
BEFORE UPDATE ON public.country_pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed UK + USA per spec
INSERT INTO public.country_pricing_rules
  (country, currency, flat_price, flat_weight_threshold_kg, price_per_kg, handling_fee, vat_percent, insurance_percent)
VALUES
  ('United Kingdom', 'GBP', 80, 10, 6.5, 20, 7.5, 1.5),
  ('United States',  'USD', 50, 4,  13,  0,  7.5, 1.5);
