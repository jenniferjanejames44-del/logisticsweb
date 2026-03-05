
CREATE TABLE public.shipping_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country text NOT NULL,
  destination_country text NOT NULL,
  price_per_kg numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (origin_country, destination_country)
);

ALTER TABLE public.shipping_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping routes" ON public.shipping_routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shipping routes" ON public.shipping_routes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_shipping_routes_updated_at
  BEFORE UPDATE ON public.shipping_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default routes
INSERT INTO public.shipping_routes (origin_country, destination_country, price_per_kg) VALUES
  ('Nigeria', 'United Kingdom', 12),
  ('Nigeria', 'United States', 10),
  ('Nigeria', 'China', 8),
  ('United Kingdom', 'Nigeria', 11),
  ('United States', 'Nigeria', 9),
  ('China', 'Nigeria', 7);
