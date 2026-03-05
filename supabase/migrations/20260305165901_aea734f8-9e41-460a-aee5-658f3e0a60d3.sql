
-- Update the invoice_paid trigger to use shipment_created instead of pending
CREATE OR REPLACE FUNCTION public.invoice_paid_update_shipment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
    UPDATE public.shipments
    SET payment_status = 'paid',
        status = CASE WHEN status = 'shipment_created' THEN 'processing' ELSE status END
    WHERE id = NEW.shipment_id;

    INSERT INTO public.notifications (user_id, shipment_id, type, title, message)
    VALUES (
      NEW.user_id,
      NEW.shipment_id,
      'payment_confirmed',
      'Payment Confirmed',
      'Payment for invoice ' || NEW.invoice_number || ' has been confirmed. Your shipment is now being processed.'
    );
  END IF;
  RETURN NEW;
END;
$function$;
