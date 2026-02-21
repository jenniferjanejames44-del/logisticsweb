
-- Fix invoices RLS: Change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Also create the missing invoice for the older shipment that was created before the trigger existed
INSERT INTO public.invoices (user_id, shipment_id, amount, status, due_date)
SELECT s.user_id, s.id, COALESCE(s.price, 0), 'unpaid', (s.created_at + INTERVAL '7 days')::DATE
FROM public.shipments s
WHERE NOT EXISTS (SELECT 1 FROM public.invoices i WHERE i.shipment_id = s.id);
