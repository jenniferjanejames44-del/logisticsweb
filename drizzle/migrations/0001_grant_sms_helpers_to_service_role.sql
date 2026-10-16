GRANT EXECUTE ON FUNCTION public.enqueue_sms(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.sms_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.sms_worker_wake() TO service_role;