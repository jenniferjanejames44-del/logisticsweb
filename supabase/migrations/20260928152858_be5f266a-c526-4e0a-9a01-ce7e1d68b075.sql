CREATE OR REPLACE FUNCTION public.email_center_send_stats()
RETURNS TABLE(sent bigint, pending bigint, failed bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*) FILTER (WHERE status = 'sent') AS sent,
    count(*) FILTER (WHERE status IN ('pending', 'rate_limited', 'queued')) AS pending,
    count(*) FILTER (WHERE status IN ('failed', 'dlq', 'bounced', 'suppressed')) AS failed
  FROM public.email_send_log
  WHERE template_name IN ('email_center', 'email_center_test')
    AND public.has_role(auth.uid(), 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.email_center_send_stats() TO authenticated;