ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip_code text;