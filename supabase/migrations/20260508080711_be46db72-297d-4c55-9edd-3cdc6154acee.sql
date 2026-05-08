
-- Extend packaging_materials
ALTER TABLE public.packaging_materials
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS icon_key text,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;

-- Extend shipments (keep legacy weight/length_cm/width_cm/height_cm intact)
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS package_id uuid,
  ADD COLUMN IF NOT EXISTS package_name text,
  ADD COLUMN IF NOT EXISTS package_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_weight numeric,
  ADD COLUMN IF NOT EXISTS volumetric_weight numeric,
  ADD COLUMN IF NOT EXISTS chargeable_weight numeric,
  ADD COLUMN IF NOT EXISTS volumetric_divisor numeric NOT NULL DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS items_json jsonb;

-- Seed packaging only when table is empty (avoid clobbering admin edits)
INSERT INTO public.packaging_materials (name, price, is_active, length_cm, width_cm, height_cm, description, icon_key, is_custom)
SELECT * FROM (VALUES
  ('Envelope',       2.00,  true, 32,  23,  2,  'Documents and flat papers',                       'envelope',  false),
  ('Small Box',      5.00,  true, 25,  20, 15,  'Small parcels up to a few kilograms',             'small-box', false),
  ('Medium Box',     8.00,  true, 40,  30, 20,  'Medium parcels, clothes, small electronics',      'medium-box',false),
  ('Large Box',     12.00,  true, 60,  40, 40,  'Bulky items and multi-item shipments',            'large-box', false),
  ('Vacuum Bag',     6.00,  true, 50,  40, 10,  'Compressed clothing and soft goods',              'vacuum-bag',false),
  ('Warm Bag',      10.00,  true, 40,  30, 25,  'Insulated bag for temperature-sensitive items',   'warm-bag',  false),
  ('Custom Package', 0.00,  true, NULL, NULL, NULL, 'Enter your own package dimensions',           'custom',    true)
) AS v(name, price, is_active, length_cm, width_cm, height_cm, description, icon_key, is_custom)
WHERE NOT EXISTS (SELECT 1 FROM public.packaging_materials);

-- For existing rows that lack icon/dim metadata, set sensible defaults by name
UPDATE public.packaging_materials SET icon_key = COALESCE(icon_key,
  CASE
    WHEN lower(name) LIKE '%envelope%' OR lower(name) LIKE '%mailer%' THEN 'envelope'
    WHEN lower(name) LIKE '%vacuum%' THEN 'vacuum-bag'
    WHEN lower(name) LIKE '%warm%' OR lower(name) LIKE '%thermal%' OR lower(name) LIKE '%insulated%' THEN 'warm-bag'
    WHEN lower(name) LIKE '%small%' THEN 'small-box'
    WHEN lower(name) LIKE '%medium%' THEN 'medium-box'
    WHEN lower(name) LIKE '%large%' THEN 'large-box'
    WHEN lower(name) LIKE '%custom%' THEN 'custom'
    ELSE 'small-box'
  END
);

UPDATE public.packaging_materials SET is_custom = true WHERE lower(name) LIKE '%custom%' AND is_custom = false;
