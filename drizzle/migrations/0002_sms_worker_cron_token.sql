-- lovable-cron-fallback-reviewed: event-armed 5s worker; wake-on-enqueue via sms_worker_wake, unschedules after queue drains; bounded retries, no permanent polling.
CREATE TABLE IF NOT EXISTS public.sms_internal_config (
  key text PRIMARY KEY,
  value text NOT NULL
);
ALTER TABLE public.sms_internal_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sms_internal_config FROM public, anon, authenticated;
GRANT SELECT ON public.sms_internal_config TO service_role;

INSERT INTO public.sms_internal_config (key, value)
VALUES ('worker_token', gen_random_uuid()::text)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sms_worker_wake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_token text;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
  SELECT c.value INTO v_token FROM public.sms_internal_config c WHERE c.key = 'worker_token';
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-sms-queue') THEN
    BEGIN
      PERFORM cron.schedule('process-sms-queue', '5 seconds', $cron$ SELECT public.sms_queue_dispatch(); $cron$);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'sms_worker_wake: cron schedule failed: %', SQLERRM;
    END;
  END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://cjrshveycypypmqtrwzv.supabase.co/functions/v1/process-sms-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Lovable-Context', 'cron',
        'X-SMS-Worker-Token', COALESCE(v_token, ''),
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcnNodmV5Y3lweXBtcXRyd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTU2NTUsImV4cCI6MjA4NDgzMTY1NX0.qYFDodTS8aItyWPaJFSBjNJMkK1WqmMYHWkiQy9IeZ8',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcnNodmV5Y3lweXBtcXRyd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTU2NTUsImV4cCI6MjA4NDgzMTY1NX0.qYFDodTS8aItyWPaJFSBjNJMkK1WqmMYHWkiQy9IeZ8'
      ),
      body := '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sms_worker_wake failed (enqueue preserved): %', SQLERRM;
END;
$function$;