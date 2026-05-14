
-- =========================================================
-- EMAIL CAMPAIGN & MARKETING AUTOMATION SYSTEM
-- Additive only. Does not modify existing tables/triggers.
-- =========================================================

-- ---------- email_subscribers ----------
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  account_type TEXT NOT NULL DEFAULT 'customer', -- customer | partner | lead
  source TEXT NOT NULL DEFAULT 'manual',         -- signup | shipment | partner | newsletter | manual
  marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON public.email_subscribers(lower(email));
CREATE INDEX IF NOT EXISTS idx_email_subscribers_optin ON public.email_subscribers(marketing_opt_in) WHERE marketing_opt_in = true;
CREATE INDEX IF NOT EXISTS idx_email_subscribers_country ON public.email_subscribers(country);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_account_type ON public.email_subscribers(account_type);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage subscribers" ON public.email_subscribers;
CREATE POLICY "Admins manage subscribers" ON public.email_subscribers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_email_subscribers_updated
BEFORE UPDATE ON public.email_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- email_templates ----------
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'promo', -- transactional | holiday | promo | announcement | welcome
  subject TEXT NOT NULL,
  heading TEXT,
  body_html TEXT,
  body_text TEXT,
  cta_label TEXT,
  cta_url TEXT,
  banner_url TEXT,
  footer_text TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage templates" ON public.email_templates;
CREATE POLICY "Admins manage templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_email_templates_updated
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- email_campaigns ----------
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  heading TEXT,
  body_html TEXT,
  cta_label TEXT,
  cta_url TEXT,
  banner_url TEXT,
  footer_text TEXT,
  audience_filter JSONB NOT NULL DEFAULT '{"scope":"all"}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | scheduled | sending | sent | cancelled | failed
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON public.email_campaigns(scheduled_at) WHERE status = 'scheduled';

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage campaigns" ON public.email_campaigns;
CREATE POLICY "Admins manage campaigns" ON public.email_campaigns
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_email_campaigns_updated
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- email_campaign_recipients ----------
CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|sent|failed|bounced|opened|clicked|skipped
  resend_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ecr_campaign ON public.email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ecr_status ON public.email_campaign_recipients(status);

ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view recipients" ON public.email_campaign_recipients;
CREATE POLICY "Admins view recipients" ON public.email_campaign_recipients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- ---------- email_automation_rules ----------
CREATE TABLE IF NOT EXISTS public.email_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event TEXT NOT NULL UNIQUE, -- signup | shipment_created | shipment_delivered | payment_success | partner_approved
  template_slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_automation_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage automation" ON public.email_automation_rules;
CREATE POLICY "Admins manage automation" ON public.email_automation_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_email_automation_rules_updated
BEFORE UPDATE ON public.email_automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- TRIGGERS — additive, do not touch existing handlers
-- =========================================================

-- Upsert helper
CREATE OR REPLACE FUNCTION public.upsert_email_subscriber(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_country TEXT,
  p_account_type TEXT,
  p_source TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN RETURN; END IF;
  INSERT INTO public.email_subscribers (user_id, email, full_name, phone, country, account_type, source, last_activity_at)
  VALUES (p_user_id, lower(p_email), p_full_name, p_phone, p_country, COALESCE(p_account_type,'customer'), COALESCE(p_source,'manual'), now())
  ON CONFLICT (email) DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, public.email_subscribers.user_id),
    full_name = COALESCE(EXCLUDED.full_name, public.email_subscribers.full_name),
    phone = COALESCE(EXCLUDED.phone, public.email_subscribers.phone),
    country = COALESCE(EXCLUDED.country, public.email_subscribers.country),
    account_type = CASE WHEN public.email_subscribers.account_type = 'lead' THEN EXCLUDED.account_type ELSE public.email_subscribers.account_type END,
    last_activity_at = now(),
    updated_at = now();
END; $$;

-- Trigger: new auth user
CREATE OR REPLACE FUNCTION public.subscriber_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.upsert_email_subscriber(
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    'customer',
    'signup'
  );
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_subscriber_on_signup ON auth.users;
CREATE TRIGGER trg_subscriber_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.subscriber_on_signup();

-- Trigger: shipment created
CREATE OR REPLACE FUNCTION public.subscriber_on_shipment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p RECORD;
BEGIN
  SELECT email, full_name, phone, country INTO p FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  IF p.email IS NOT NULL THEN
    PERFORM public.upsert_email_subscriber(NEW.user_id, p.email, p.full_name, p.phone, p.country, 'customer', 'shipment');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_subscriber_on_shipment ON public.shipments;
CREATE TRIGGER trg_subscriber_on_shipment
AFTER INSERT ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.subscriber_on_shipment();

-- Trigger: partner approved
CREATE OR REPLACE FUNCTION public.subscriber_on_partner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status OR TG_OP = 'INSERT') THEN
    PERFORM public.upsert_email_subscriber(NEW.user_id, NEW.email, NEW.full_name, NEW.phone, NEW.country, 'partner', 'partner');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_subscriber_on_partner ON public.partners;
CREATE TRIGGER trg_subscriber_on_partner
AFTER INSERT OR UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.subscriber_on_partner();

-- =========================================================
-- BACKFILL existing profiles + partners
-- =========================================================
INSERT INTO public.email_subscribers (user_id, email, full_name, phone, country, account_type, source, last_activity_at)
SELECT user_id, lower(email), full_name, phone, country, 'customer', 'signup', now()
FROM public.profiles
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.email_subscribers (user_id, email, full_name, phone, country, account_type, source, last_activity_at)
SELECT user_id, lower(email), full_name, phone, country, 'partner', 'partner', now()
FROM public.partners
WHERE email IS NOT NULL AND status = 'approved'
ON CONFLICT (email) DO UPDATE SET account_type = 'partner';

-- =========================================================
-- SEED system templates
-- =========================================================
INSERT INTO public.email_templates (name, slug, category, subject, heading, body_html, cta_label, cta_url, footer_text, is_system) VALUES
('Welcome Email','welcome','welcome','Welcome to RAC Logistics','Welcome aboard, {{name}}!','<p>Thanks for joining RAC Logistics. We make global shipping simple, fast, and reliable.</p><p>Track shipments, manage payments, and request personal shopping — all from one dashboard.</p>','Open Dashboard','https://raclogisticltd.com/dashboard','You are receiving this because you signed up at RAC Logistics.', true),
('Shipment Created','shipment-created','transactional','Your shipment has been created','Shipment {{tracking}} created','<p>Hi {{name}}, your shipment is in our system and will be processed shortly.</p>','Track Shipment','https://raclogisticltd.com/track','RAC Logistics — moving the world for you.', true),
('Payment Successful','payment-success','transactional','Payment received','Thank you for your payment','<p>We have received your payment for shipment {{tracking}}. Processing has started.</p>','View Receipt','https://raclogisticltd.com/dashboard/payments','RAC Logistics — moving the world for you.', true),
('Shipment Delivered','shipment-delivered','transactional','Your shipment was delivered','Delivered ✓','<p>Great news — your shipment {{tracking}} has been delivered. Thank you for choosing RAC Logistics.</p>','Leave Feedback','https://raclogisticltd.com/contact','RAC Logistics — moving the world for you.', true),
('Forgot Password','forgot-password','transactional','Reset your password','Password reset','<p>Click the button below to reset your password. This link expires in 1 hour.</p>','Reset Password','{{action_url}}','If you did not request this, ignore this email.', true),
('Happy Christmas','holiday-christmas','holiday','Merry Christmas from RAC Logistics 🎄','Merry Christmas, {{name}}!','<p>From all of us at RAC Logistics, we wish you a joyful Christmas filled with peace and prosperity. Thank you for trusting us with your shipments this year.</p>','Visit Website','https://raclogisticltd.com','Season''s greetings from the RAC Logistics family.', true),
('Happy Sallah','holiday-sallah','holiday','Eid Mubarak from RAC Logistics','Eid Mubarak, {{name}}!','<p>Wishing you and your loved ones a blessed Sallah celebration. May this season bring peace, joy, and prosperity.</p>','Visit Website','https://raclogisticltd.com','With warm wishes from RAC Logistics.', true),
('Happy New Year','holiday-newyear','holiday','Happy New Year from RAC Logistics 🎉','Happy New Year, {{name}}!','<p>Thank you for an incredible year. Here''s to bigger shipments, faster deliveries, and greater success in the new year ahead.</p>','Open Dashboard','https://raclogisticltd.com/dashboard','Cheers from the RAC Logistics team.', true),
('Easter Greetings','holiday-easter','holiday','Happy Easter from RAC Logistics','Happy Easter, {{name}}','<p>Wishing you a blessed Easter filled with joy, hope, and renewal. Thank you for being part of the RAC Logistics family.</p>','Visit Website','https://raclogisticltd.com','Easter blessings from RAC Logistics.', true),
('Promo Campaign','promo-default','promo','Special offer from RAC Logistics','Save on your next shipment','<p>For a limited time, get discounted rates on our most popular routes. Don''t miss out — book your shipment today.</p>','Book Now','https://raclogisticltd.com/pricing','Offer valid for a limited time.', true),
('Discount Announcement','discount-default','promo','Limited-time discount inside','Discounted shipping rates','<p>Ship from UK to Nigeria at discounted rates this season. Faster transit, lower cost — book before the offer ends.</p>','Get Quote','https://raclogisticltd.com/pricing','Discount applies to qualifying routes.', true),
('Partner Approval','partner-approved','transactional','Welcome to the RAC Partner Program','You''re approved 🎉','<p>Hi {{name}}, your partner application has been approved. Your unique referral link is ready inside your dashboard.</p>','Open Partner Hub','https://raclogisticltd.com/dashboard/partner','Welcome to the RAC Partner Program.', true)
ON CONFLICT (slug) DO NOTHING;

-- Default automation rules (off by default to avoid duplicate sends with existing notifications)
INSERT INTO public.email_automation_rules (trigger_event, template_slug, is_active) VALUES
('signup','welcome', false),
('shipment_created','shipment-created', false),
('shipment_delivered','shipment-delivered', false),
('payment_success','payment-success', false),
('partner_approved','partner-approved', false)
ON CONFLICT (trigger_event) DO NOTHING;
