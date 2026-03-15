-- Align shopping order workflow to payment-first processing without changing table structure.

CREATE OR REPLACE FUNCTION public.enforce_shopping_order_payment_state()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.payment_status, '') = '' THEN
      NEW.payment_status := 'unpaid';
    END IF;

    IF COALESCE(NEW.status, '') = '' THEN
      NEW.status := CASE WHEN NEW.payment_status = 'paid' THEN 'paid' ELSE 'pending_payment' END;
    END IF;
  END IF;

  IF COALESCE(NEW.payment_status, 'unpaid') <> 'paid'
     AND COALESCE(NEW.status, 'pending_payment') NOT IN ('pending_payment', 'pending_purchase') THEN
    RAISE EXCEPTION 'Shopping order payment is required before moving to %', NEW.status;
  END IF;

  IF COALESCE(NEW.payment_status, 'unpaid') = 'paid'
     AND COALESCE(NEW.status, '') IN ('', 'pending_payment', 'pending_purchase') THEN
    NEW.status := 'paid';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_shopping_order_payment_state_trigger ON public.shopping_orders;

CREATE TRIGGER enforce_shopping_order_payment_state_trigger
  BEFORE INSERT OR UPDATE ON public.shopping_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_shopping_order_payment_state();

UPDATE public.shopping_orders
SET status = 'pending_payment'
WHERE payment_status <> 'paid'
  AND status = 'pending_purchase';

UPDATE public.shopping_orders
SET status = 'paid'
WHERE payment_status = 'paid'
  AND status IN ('pending_purchase', 'pending_payment');