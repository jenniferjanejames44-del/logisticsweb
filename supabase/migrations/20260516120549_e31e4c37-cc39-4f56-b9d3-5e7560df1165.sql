
-- Quotations table
CREATE SEQUENCE IF NOT EXISTS public.quotation_number_seq START WITH 1;

CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  user_id UUID,
  created_by UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  shipment_type TEXT NOT NULL CHECK (shipment_type IN ('import','export')),
  origin_country TEXT NOT NULL,
  origin_city TEXT,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  warehouse_country TEXT,
  shipping_method TEXT NOT NULL,
  service_type TEXT,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  length_cm NUMERIC,
  width_cm NUMERIC,
  height_cm NUMERIC,
  chargeable_weight NUMERIC,
  description TEXT,
  declared_value NUMERIC DEFAULT 0,
  pricing_rule_id UUID,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  handling_fee NUMERIC NOT NULL DEFAULT 0,
  customs_fee NUMERIC NOT NULL DEFAULT 0,
  vat NUMERIC NOT NULL DEFAULT 0,
  insurance NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  pricing_snapshot JSONB,
  ngn_total NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired','converted')),
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_shipment_id UUID,
  converted_invoice_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotations_user_id ON public.quotations(user_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_created_at ON public.quotations(created_at DESC);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quotations" ON public.quotations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := 'QT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
      LPAD(nextval('public.quotation_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quotations_generate_number
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.generate_quote_number();

CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for quotations subfolder in invoices bucket
CREATE POLICY "Admins manage quotation PDFs"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'invoices' AND (storage.foldername(name))[1] = 'quotations' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'invoices' AND (storage.foldername(name))[1] = 'quotations' AND has_role(auth.uid(), 'admin'::app_role));
