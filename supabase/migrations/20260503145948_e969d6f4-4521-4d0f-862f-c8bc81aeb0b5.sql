
-- 1. Shipments: remove permissive public SELECT
DROP POLICY IF EXISTS "Anyone can track shipments by tracking number" ON public.shipments;

-- Public tracking via a security-definer function returning only safe fields
CREATE OR REPLACE FUNCTION public.track_shipment_public(tracking_num text)
RETURNS TABLE(
  tracking_number text,
  status text,
  estimated_delivery date,
  actual_delivery date,
  origin_city text,
  origin_country text,
  destination_city text,
  destination_country text,
  service_type text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.tracking_number,
    s.status,
    s.estimated_delivery,
    s.actual_delivery,
    s.origin_city,
    s.origin_country,
    s.destination_city,
    s.destination_country,
    s.service_type,
    s.created_at,
    s.updated_at
  FROM public.shipments s
  WHERE s.tracking_number ILIKE '%' || tracking_num || '%'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.track_shipment_public(text) TO anon, authenticated;

-- 2. Shipment notifications: restrict reads/updates
DROP POLICY IF EXISTS "Anyone can view subscriptions by email" ON public.shipment_notifications;
DROP POLICY IF EXISTS "Anyone can update their subscriptions" ON public.shipment_notifications;

-- Keep "Anyone can subscribe to notifications" (INSERT) and admin-manage policy.
-- Add: authenticated users may view/update their own subscription rows by email match
CREATE POLICY "Users can view their own subscriptions"
ON public.shipment_notifications
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own subscriptions"
ON public.shipment_notifications
FOR UPDATE
TO authenticated
USING (email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

-- 3. user_balances view: enforce invoker RLS so wallet_transactions RLS applies
ALTER VIEW public.user_balances SET (security_invoker = on);
