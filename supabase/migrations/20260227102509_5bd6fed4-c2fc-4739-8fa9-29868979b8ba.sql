
-- Add detailed pricing breakdown columns to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pickup_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS clearing_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS weight_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS dimensions text;

-- Update invoice number format to RAC-INV-YYYY-XXXX
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.invoice_number := 'RAC-INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Update auto_create_invoice to capture pricing breakdown from shipment
CREATE OR REPLACE FUNCTION public.auto_create_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.invoices (
    user_id, shipment_id, amount, subtotal, shipping_rate,
    weight_value, status, due_date, currency
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    COALESCE(NEW.price, 0),
    COALESCE(NEW.price, 0),
    COALESCE(NEW.price, 0),
    NEW.weight,
    'unpaid',
    (NOW() + INTERVAL '7 days')::DATE,
    'NGN'
  );
  RETURN NEW;
END;
$function$;
