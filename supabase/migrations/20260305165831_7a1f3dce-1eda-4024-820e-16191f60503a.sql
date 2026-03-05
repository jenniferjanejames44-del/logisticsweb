
-- Update tracking number format to RAC-XXXXXXXX
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := 'RAC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$function$;
