ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS care_of text,
  ADD COLUMN IF NOT EXISTS recipient text,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS country_code text;