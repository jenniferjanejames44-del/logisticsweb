
-- Zones table
CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active zones" ON public.zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage zones" ON public.zones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Zone Countries table
CREATE TABLE public.zone_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  country text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country)
);
ALTER TABLE public.zone_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view zone countries" ON public.zone_countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage zone countries" ON public.zone_countries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Weight Pricing table (for weights up to threshold)
CREATE TABLE public.weight_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  min_weight numeric NOT NULL,
  max_weight numeric NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.weight_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view weight pricing" ON public.weight_pricing FOR SELECT USING (true);
CREATE POLICY "Admins can manage weight pricing" ON public.weight_pricing FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Heavy Weight Pricing table (per KG for heavier shipments)
CREATE TABLE public.heavy_weight_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  min_weight numeric NOT NULL,
  max_weight numeric NOT NULL,
  price_per_kg numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.heavy_weight_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view heavy weight pricing" ON public.heavy_weight_pricing FOR SELECT USING (true);
CREATE POLICY "Admins can manage heavy weight pricing" ON public.heavy_weight_pricing FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Extra Charges table
CREATE TABLE public.extra_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.extra_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active extra charges" ON public.extra_charges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage extra charges" ON public.extra_charges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Tax Settings table
CREATE TABLE public.tax_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active taxes" ON public.tax_settings FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage taxes" ON public.tax_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Processing Fees table (admin-editable fee tiers)
CREATE TABLE public.processing_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  fee_type text NOT NULL DEFAULT 'percentage',
  fee_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.processing_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view processing fees" ON public.processing_fees FOR SELECT USING (true);
CREATE POLICY "Admins can manage processing fees" ON public.processing_fees FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Warehouses table
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active warehouses" ON public.warehouses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage warehouses" ON public.warehouses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
