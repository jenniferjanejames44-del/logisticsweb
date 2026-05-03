
CREATE TABLE IF NOT EXISTS public.processing_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  fee_type text NOT NULL DEFAULT 'percentage',
  fee_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view processing fees"
ON public.processing_fees FOR SELECT USING (true);

CREATE POLICY "Admins can manage processing fees"
ON public.processing_fees FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.processing_fees (min_value, max_value, fee_type, fee_value) VALUES
  (1, 150, 'flat', 15),
  (151, 1000, 'percentage', 10),
  (1001, 5000, 'percentage', 8),
  (5001, 10000, 'percentage', 7),
  (10001, 999999999, 'percentage', 5);
