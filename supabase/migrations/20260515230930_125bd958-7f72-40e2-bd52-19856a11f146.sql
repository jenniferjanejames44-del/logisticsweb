-- Pricing Engine v2: Import & Export pricing rules + exchange rates

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_type TEXT NOT NULL CHECK (shipment_type IN ('import','export')),
  name TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  warehouse_country TEXT,
  destination_country TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  service_type TEXT,
  min_weight_kg NUMERIC,
  max_weight_kg NUMERIC,
  flat_price NUMERIC NOT NULL DEFAULT 0,
  flat_weight_threshold_kg NUMERIC NOT NULL DEFAULT 0,
  price_per_kg NUMERIC NOT NULL DEFAULT 0,
  handling_fee NUMERIC NOT NULL DEFAULT 0,
  customs_fee NUMERIC NOT NULL DEFAULT 0,
  vat_percent NUMERIC NOT NULL DEFAULT 0,
  insurance_percent NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pricing_rules_export_no_warehouse CHECK (
    shipment_type = 'import' OR warehouse_country IS NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_match
  ON public.pricing_rules (shipment_type, origin_country, destination_country, shipping_method, is_active);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing rules"
  ON public.pricing_rules FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can view active pricing rules"
  ON public.pricing_rules FOR SELECT
  USING (is_active = true);

CREATE TRIGGER pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Exchange rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL CHECK (rate > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_currency, to_currency)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage exchange rates"
  ON public.exchange_rates FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated read exchange rates"
  ON public.exchange_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon read active exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (is_active = true);

CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill existing country_pricing_rules into pricing_rules as imports
INSERT INTO public.pricing_rules (
  shipment_type, name, origin_country, warehouse_country, destination_country,
  shipping_method, flat_price, flat_weight_threshold_kg, price_per_kg,
  handling_fee, vat_percent, insurance_percent, currency, is_active, priority
)
SELECT
  'import',
  'Import from ' || country,
  country,
  country,
  'Nigeria',
  'air',
  flat_price,
  flat_weight_threshold_kg,
  price_per_kg,
  handling_fee,
  vat_percent,
  insurance_percent,
  currency,
  is_active,
  0
FROM public.country_pricing_rules
WHERE NOT EXISTS (
  SELECT 1 FROM public.pricing_rules pr
  WHERE pr.shipment_type = 'import'
    AND pr.origin_country = public.country_pricing_rules.country
    AND pr.destination_country = 'Nigeria'
);

-- Seed default exchange rates (idempotent)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate)
VALUES ('USD','NGN',1600),('GBP','NGN',2000),('EUR','NGN',1700),('CNY','NGN',220)
ON CONFLICT (from_currency,to_currency) DO NOTHING;