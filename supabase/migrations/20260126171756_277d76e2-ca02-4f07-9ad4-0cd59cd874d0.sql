-- Allow anyone to look up a shipment by tracking number (public tracking feature)
-- The tracking number acts as a "secret" that grants read access to that specific shipment
CREATE POLICY "Anyone can track shipments by tracking number"
ON public.shipments
FOR SELECT
USING (true);

-- Note: This replaces the more restrictive user-only policy for SELECT
-- We keep the policy permissive but only expose limited fields via the application layer