
-- Packaging materials table
CREATE TABLE public.packaging_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packaging_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage packaging materials" ON public.packaging_materials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active packaging materials" ON public.packaging_materials FOR SELECT USING (is_active = true);

-- Delivery methods table
CREATE TABLE public.delivery_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage delivery methods" ON public.delivery_methods FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active delivery methods" ON public.delivery_methods FOR SELECT USING (is_active = true);

-- Seed packaging materials
INSERT INTO public.packaging_materials (name, price) VALUES
  ('Small Box', 1200),
  ('Medium Box', 2000),
  ('Big Box', 2500),
  ('Vacuum Bag', 600),
  ('Warm Bag', 800);

-- Seed delivery methods
INSERT INTO public.delivery_methods (name, description, fee) VALUES
  ('Office Pickup', 'Pick up from our office/warehouse', 0),
  ('Doorstep Delivery', 'We deliver to your address', 5000);

-- Updated_at triggers
CREATE TRIGGER update_packaging_materials_updated_at BEFORE UPDATE ON public.packaging_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_methods_updated_at BEFORE UPDATE ON public.delivery_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
