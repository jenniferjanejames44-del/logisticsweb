CREATE TABLE public.zone_pricing_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  zone_number integer NOT NULL,
  direction text NOT NULL CHECK (direction IN ('import','export')),
  shipping_method text NOT NULL DEFAULT 'air',
  service_type text,
  currency text NOT NULL DEFAULT 'USD',
  price_0_2 numeric(12,2) NOT NULL DEFAULT 0,
  price_3 numeric(12,2) NOT NULL DEFAULT 0,
  price_4 numeric(12,2) NOT NULL DEFAULT 0,
  price_5 numeric(12,2) NOT NULL DEFAULT 0,
  price_6 numeric(12,2) NOT NULL DEFAULT 0,
  price_7 numeric(12,2) NOT NULL DEFAULT 0,
  price_8 numeric(12,2) NOT NULL DEFAULT 0,
  price_9 numeric(12,2) NOT NULL DEFAULT 0,
  price_10 numeric(12,2) NOT NULL DEFAULT 0,
  above_10_rate_per_kg numeric(12,2) NOT NULL DEFAULT 0,
  handling_fee numeric(12,2) NOT NULL DEFAULT 0,
  customs_fee numeric(12,2) NOT NULL DEFAULT 0,
  vat_percent numeric(6,3) NOT NULL DEFAULT 0,
  insurance_percent numeric(6,3) NOT NULL DEFAULT 0,
  volumetric_divisor numeric(10,2) NOT NULL DEFAULT 5000,
  weight_rounding text NOT NULL DEFAULT 'ceil' CHECK (weight_rounding IN ('ceil','nearest','none')),
  estimated_days_min integer,
  estimated_days_max integer,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX zone_pricing_rates_unique_combo
  ON public.zone_pricing_rates (zone_id, direction, lower(shipping_method), COALESCE(lower(service_type), '*'));
CREATE INDEX zone_pricing_rates_lookup
  ON public.zone_pricing_rates (direction, zone_id, is_active);

GRANT SELECT ON public.zone_pricing_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zone_pricing_rates TO authenticated;
GRANT ALL ON public.zone_pricing_rates TO service_role;

ALTER TABLE public.zone_pricing_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active zone rates"
  ON public.zone_pricing_rates FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage zone rates"
  ON public.zone_pricing_rates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_zone_pricing_rates_updated
  BEFORE UPDATE ON public.zone_pricing_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();