
-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  due_date DATE,
  payment_reference TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for invoice numbers
CREATE SEQUENCE public.invoice_number_seq START WITH 1 INCREMENT BY 1;

-- Function to auto-generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invoice_number := 'INV-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.generate_invoice_number();

-- Trigger to update updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create invoice when shipment is created
CREATE OR REPLACE FUNCTION public.auto_create_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.invoices (user_id, shipment_id, amount, status, due_date)
  VALUES (
    NEW.user_id,
    NEW.id,
    COALESCE(NEW.price, 0),
    'unpaid',
    (NOW() + INTERVAL '7 days')::DATE
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_create_invoice
AFTER INSERT ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_invoice();

-- When admin sets price on shipment, update invoice amount
CREATE OR REPLACE FUNCTION public.sync_invoice_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    UPDATE public.invoices
    SET amount = COALESCE(NEW.price, 0)
    WHERE shipment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_invoice_amount
AFTER UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.sync_invoice_amount();

-- When invoice is marked paid, update shipment status to processing
CREATE OR REPLACE FUNCTION public.invoice_paid_update_shipment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
    UPDATE public.shipments
    SET payment_status = 'paid',
        status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END
    WHERE id = NEW.shipment_id;

    -- Create notification for user
    INSERT INTO public.notifications (user_id, shipment_id, type, title, message)
    VALUES (
      NEW.user_id,
      NEW.shipment_id,
      'payment_confirmed',
      'Payment Confirmed',
      'Payment for invoice ' || NEW.invoice_number || ' has been confirmed. Your shipment is now being processed.'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_invoice_paid_update_shipment
AFTER UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.invoice_paid_update_shipment();

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoices"
ON public.invoices FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoices"
ON public.invoices FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own invoice PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all invoice PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can upload invoice PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices');
