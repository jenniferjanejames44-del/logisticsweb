-- lovable-cron-fallback-reviewed: bounded queue worker armed only on enqueue and unscheduled after drain; mirrors existing email queue pattern; near-zero runs when idle
-- SMS Management System: providers, templates, campaigns, messages, automation, contacts, consent, audit

CREATE TABLE public.sms_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  api_key text,
  sender_id text,
  base_url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_backup boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  last_check_at timestamptz,
  last_check_status text,
  last_balance numeric,
  balance_currency text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sms_providers_single_primary ON public.sms_providers (is_primary) WHERE is_primary;
CREATE UNIQUE INDEX sms_providers_single_backup ON public.sms_providers (is_backup) WHERE is_backup;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_providers TO authenticated;
GRANT ALL ON public.sms_providers TO service_role;
ALTER TABLE public.sms_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms providers" ON public.sms_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'transactional',
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_templates TO authenticated;
GRANT ALL ON public.sms_templates TO service_role;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms templates" ON public.sms_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES public.sms_templates(id) ON DELETE SET NULL,
  message text NOT NULL,
  audience text NOT NULL DEFAULT 'marketing_subscribers',
  manual_phones text[],
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_campaigns TO authenticated;
GRANT ALL ON public.sms_campaigns TO service_role;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms campaigns" ON public.sms_campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.sms_campaigns(id) ON DELETE SET NULL,
  phone text NOT NULL,
  contact_name text,
  body text NOT NULL,
  message_type text NOT NULL DEFAULT 'transactional',
  source text NOT NULL DEFAULT 'manual',
  provider_key text,
  provider_message_id text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz
);
CREATE INDEX sms_messages_status_idx ON public.sms_messages (status);
CREATE INDEX sms_messages_created_idx ON public.sms_messages (created_at DESC);
CREATE INDEX sms_messages_phone_idx ON public.sms_messages (phone);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_messages TO authenticated;
GRANT ALL ON public.sms_messages TO service_role;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms messages" ON public.sms_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_event text NOT NULL UNIQUE,
  template_id uuid REFERENCES public.sms_templates(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_automation_rules TO authenticated;
GRANT ALL ON public.sms_automation_rules TO service_role;
ALTER TABLE public.sms_automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms automation rules" ON public.sms_automation_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text,
  phone text NOT NULL UNIQUE,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  opted_out_at timestamptz,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_contacts TO authenticated;
GRANT ALL ON public.sms_contacts TO service_role;
ALTER TABLE public.sms_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms contacts" ON public.sms_contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own sms contact" ON public.sms_contacts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.sms_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT 'opted_out',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_suppressions TO authenticated;
GRANT ALL ON public.sms_suppressions TO service_role;
ALTER TABLE public.sms_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms suppressions" ON public.sms_suppressions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sms_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.sms_audit_log TO authenticated;
GRANT ALL ON public.sms_audit_log TO service_role;
ALTER TABLE public.sms_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sms audit log" ON public.sms_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert sms audit log" ON public.sms_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed providers (credentials entered later from the dashboard)
INSERT INTO public.sms_providers (provider_key, display_name, base_url, sender_id, is_primary, notes) VALUES
  ('termii', 'Termii', 'https://api.ng.termii.com', 'RACLOGISTIC', true, 'Primary provider. Base URL is account-specific; confirm it on your Termii dashboard.'),
  ('bulksmsnigeria', 'BulkSMS Nigeria', 'https://www.bulksmsnigeria.com/api/v2', 'RACLogistics', false, 'Backup provider. Sandbox base URL: https://www.bulksmsnigeria.com/api/sandbox/v2');

-- Seed templates
INSERT INTO public.sms_templates (name, category, body) VALUES
  ('Welcome - New Customer', 'transactional', 'Welcome to RAC Logistics, {{name}}! Your account is ready. Ship, track and manage deliveries at raclogisticltd.com.'),
  ('Shipment Created', 'transactional', 'RAC Logistics: Your shipment {{tracking_number}} from {{origin}} to {{destination}} has been created. Track it anytime at raclogisticltd.com.'),
  ('Shipment Status Update', 'transactional', 'RAC Logistics: Shipment {{tracking_number}} status updated to {{status}}. Track at raclogisticltd.com.'),
  ('Payment Received', 'transactional', 'RAC Logistics: We received your payment of {{currency}} {{amount}} for invoice {{invoice_number}}. Thank you!'),
  ('Marketing - General', 'marketing', 'RAC Logistics: {{message}}');

-- Seed automation rules linked to templates
INSERT INTO public.sms_automation_rules (name, trigger_event, template_id, is_active)
SELECT 'Welcome message on registration', 'customer_registered', id, true FROM public.sms_templates WHERE name = 'Welcome - New Customer';
INSERT INTO public.sms_automation_rules (name, trigger_event, template_id, is_active)
SELECT 'Shipment created notification', 'shipment_created', id, true FROM public.sms_templates WHERE name = 'Shipment Created';
INSERT INTO public.sms_automation_rules (name, trigger_event, template_id, is_active)
SELECT 'Shipment status change notification', 'shipment_status_changed', id, true FROM public.sms_templates WHERE name = 'Shipment Status Update';
INSERT INTO public.sms_automation_rules (name, trigger_event, template_id, is_active)
SELECT 'Payment received notification', 'payment_received', id, true FROM public.sms_templates WHERE name = 'Payment Received';

-- SMS queue helpers (mirror the proven email queue pattern; cron calls the worker with the publishable anon key)
CREATE OR REPLACE FUNCTION public.enqueue_sms(payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
BEGIN
  RETURN pgmq.send('sms_queue', payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create('sms_queue');
  RETURN pgmq.send('sms_queue', payload);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.sms_queue_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
DECLARE
  v_has_messages boolean;
BEGIN
  BEGIN
    SELECT EXISTS (SELECT 1 FROM pgmq.q_sms_queue) INTO v_has_messages;
  EXCEPTION WHEN undefined_table THEN
    v_has_messages := false;
  END;

  IF NOT v_has_messages THEN
    BEGIN
      PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
      PERFORM cron.unschedule('process-sms-queue');
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'sms_queue_dispatch: cron unschedule failed: %', SQLERRM;
    END;
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://cjrshveycypypmqtrwzv.supabase.co/functions/v1/process-sms-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcnNodmV5Y3lweXBtcXRyd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTU2NTUsImV4cCI6MjA4NDgzMTY1NX0.qYFDodTS8aItyWPaJFSBjNJMkK1WqmMYHWkiQy9IeZ8',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcnNodmV5Y3lweXBtcXRyd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTU2NTUsImV4cCI6MjA4NDgzMTY1NX0.qYFDodTS8aItyWPaJFSBjNJMkK1WqmMYHWkiQy9IeZ8'
    ),
    body := '{}'::jsonb
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.sms_worker_wake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
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
$fn$;

REVOKE EXECUTE ON FUNCTION public.enqueue_sms(jsonb) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sms_queue_dispatch() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sms_worker_wake() FROM public, anon, authenticated;

-- Automation triggers: enqueue transactional SMS events; never block the underlying operation
CREATE OR REPLACE FUNCTION public.sms_on_profile_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
BEGIN
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 0 THEN
    PERFORM public.enqueue_sms(jsonb_build_object(
      'trigger_event', 'customer_registered',
      'phone', NEW.phone,
      'name', coalesce(NEW.full_name, 'Customer'),
      'user_id', NEW.user_id
    ));
    PERFORM public.sms_worker_wake();
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sms_on_profile_created failed: %', SQLERRM;
  RETURN NULL;
END;
$fn$;
CREATE TRIGGER trg_sms_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sms_on_profile_created();

CREATE OR REPLACE FUNCTION public.sms_on_shipment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
DECLARE
  v_phone text;
  v_name text;
BEGIN
  SELECT p.phone, p.full_name INTO v_phone, v_name
  FROM public.profiles p WHERE p.user_id = NEW.user_id LIMIT 1;
  IF v_phone IS NOT NULL AND length(trim(v_phone)) > 0 THEN
    PERFORM public.enqueue_sms(jsonb_build_object(
      'trigger_event', 'shipment_created',
      'phone', v_phone,
      'name', coalesce(v_name, 'Customer'),
      'tracking_number', NEW.tracking_number,
      'origin', NEW.origin_city || ', ' || NEW.origin_country,
      'destination', NEW.destination_city || ', ' || NEW.destination_country,
      'status', NEW.status
    ));
    PERFORM public.sms_worker_wake();
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sms_on_shipment_created failed: %', SQLERRM;
  RETURN NULL;
END;
$fn$;
CREATE TRIGGER trg_sms_shipment_created
  AFTER INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.sms_on_shipment_created();

CREATE OR REPLACE FUNCTION public.sms_on_shipment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
DECLARE
  v_phone text;
  v_name text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NULL;
  END IF;
  SELECT p.phone, p.full_name INTO v_phone, v_name
  FROM public.profiles p WHERE p.user_id = NEW.user_id LIMIT 1;
  IF v_phone IS NOT NULL AND length(trim(v_phone)) > 0 THEN
    PERFORM public.enqueue_sms(jsonb_build_object(
      'trigger_event', 'shipment_status_changed',
      'phone', v_phone,
      'name', coalesce(v_name, 'Customer'),
      'tracking_number', NEW.tracking_number,
      'status', NEW.status
    ));
    PERFORM public.sms_worker_wake();
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sms_on_shipment_status failed: %', SQLERRM;
  RETURN NULL;
END;
$fn$;
CREATE TRIGGER trg_sms_shipment_status
  AFTER UPDATE OF status ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.sms_on_shipment_status();

CREATE OR REPLACE FUNCTION public.sms_on_invoice_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
DECLARE
  v_phone text;
  v_name text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'paid' OR OLD.status IS NOT DISTINCT FROM 'paid' THEN
    RETURN NULL;
  END IF;
  SELECT p.phone, p.full_name INTO v_phone, v_name
  FROM public.profiles p WHERE p.user_id = NEW.user_id LIMIT 1;
  IF v_phone IS NOT NULL AND length(trim(v_phone)) > 0 THEN
    PERFORM public.enqueue_sms(jsonb_build_object(
      'trigger_event', 'payment_received',
      'phone', v_phone,
      'name', coalesce(v_name, 'Customer'),
      'invoice_number', NEW.invoice_number,
      'amount', NEW.amount,
      'currency', coalesce(NEW.currency, 'USD')
    ));
    PERFORM public.sms_worker_wake();
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sms_on_invoice_paid failed: %', SQLERRM;
  RETURN NULL;
END;
$fn$;
CREATE TRIGGER trg_sms_invoice_paid
  AFTER UPDATE OF status ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.sms_on_invoice_paid();