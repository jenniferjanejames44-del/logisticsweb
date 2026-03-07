
ALTER TABLE public.shipments 
  ADD COLUMN IF NOT EXISTS length_cm numeric NULL,
  ADD COLUMN IF NOT EXISTS width_cm numeric NULL,
  ADD COLUMN IF NOT EXISTS height_cm numeric NULL;
