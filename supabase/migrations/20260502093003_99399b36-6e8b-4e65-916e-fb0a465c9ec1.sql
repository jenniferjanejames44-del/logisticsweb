-- 1. Fix the trigger so new invoices are stored in USD (matches shipments.price)
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

-- 2. Backfill: any unpaid invoice still labeled NGN was actually USD; relabel to USD.
UPDATE public.invoices
SET currency = 'USD'
WHERE currency = 'NGN'
  AND status <> 'paid';

-- 3. Admin-controlled app settings (single-row key/value) for FX override etc.
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user (so checkout/UI can read FX override)
CREATE POLICY "app_settings_select_authenticated"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Insert/Update/Delete: admins only
CREATE POLICY "app_settings_insert_admin"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_settings_update_admin"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_settings_delete_admin"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();