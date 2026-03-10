-- Keep invoice records USD-based by default for new shipments
ALTER TABLE public.invoices
ALTER COLUMN currency SET DEFAULT 'USD';

UPDATE public.invoices
SET currency = 'USD'
WHERE currency IS NULL;

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
    'USD'
  );
  RETURN NEW;
END;
$function$;