CREATE OR REPLACE FUNCTION public.email_center_delivery(_since timestamptz DEFAULT now() - interval '3650 days')
RETURNS TABLE(message_id text, recipient_email text, template_name text, status text, error_message text, subject text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT * FROM (
    SELECT DISTINCT ON (l.message_id) l.message_id, l.recipient_email, l.template_name, l.status,
      l.error_message, l.metadata->>'subject', l.created_at
    FROM public.email_send_log l
    WHERE (l.template_name IN ('email_center','email_center_test') OR l.message_id LIKE 'ec-%')
      AND l.message_id IS NOT NULL
      AND public.has_role(auth.uid(), 'admin')
    ORDER BY l.message_id, l.created_at DESC
  ) x
  WHERE x.created_at >= _since
  ORDER BY x.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.email_center_delivery(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.email_center_delivery(timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.email_center_send_stats()
RETURNS TABLE(sent bigint, pending bigint, failed bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    count(*) FILTER (WHERE status = 'sent'),
    count(*) FILTER (WHERE status IN ('pending','rate_limited','queued')),
    count(*) FILTER (WHERE status IN ('failed','dlq','bounced','suppressed'))
  FROM (
    SELECT DISTINCT ON (message_id) status
    FROM public.email_send_log
    WHERE (template_name IN ('email_center','email_center_test') OR message_id LIKE 'ec-%')
      AND message_id IS NOT NULL
      AND public.has_role(auth.uid(), 'admin')
    ORDER BY message_id, created_at DESC
  ) latest;
$$;