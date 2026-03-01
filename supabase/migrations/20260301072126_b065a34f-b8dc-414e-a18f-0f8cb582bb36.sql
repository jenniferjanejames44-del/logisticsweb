-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to notify on shipment creation
CREATE OR REPLACE FUNCTION public.notify_new_shipment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Get Supabase URL and service key from vault or hardcode project URL
  SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  -- If vault is not available, use project URL
  IF supabase_url IS NULL THEN
    supabase_url := 'https://cjrshveycypypmqtrwzv.supabase.co';
  END IF;

  -- Call notify-shipment-created edge function via pg_net
  IF service_key IS NOT NULL THEN
    PERFORM extensions.http_post(
      url := supabase_url || '/functions/v1/notify-shipment-created',
      body := json_build_object('shipment_id', NEW.id)::text,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      )::text
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for new shipment creation
DROP TRIGGER IF EXISTS trigger_notify_new_shipment ON public.shipments;
CREATE TRIGGER trigger_notify_new_shipment
  AFTER INSERT ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_shipment();
