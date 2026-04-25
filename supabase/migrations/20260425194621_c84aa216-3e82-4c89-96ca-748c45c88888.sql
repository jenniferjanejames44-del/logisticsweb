-- =========================================
-- PARTNERS / AFFILIATE SYSTEM
-- =========================================

-- 1. Partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL, -- nullable: applicant may not have an account yet
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  business_name TEXT,
  social_link TEXT,
  referral_plan TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  referral_code TEXT UNIQUE,
  commission_percentage NUMERIC NOT NULL DEFAULT 5,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partners_user_id ON public.partners(user_id);
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partners_referral_code ON public.partners(referral_code);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit an application
CREATE POLICY "Anyone can submit partner applications"
  ON public.partners FOR INSERT
  WITH CHECK (true);

-- Users can view their own partner record (matched by user_id OR email)
CREATE POLICY "Users can view their own partner record"
  ON public.partners FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') = email
  );

-- Admins manage everything
CREATE POLICY "Admins can manage partners"
  ON public.partners FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate referral_code on approval if missing
CREATE OR REPLACE FUNCTION public.generate_partner_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (NEW.referral_code IS NULL OR NEW.referral_code = '') THEN
    NEW.referral_code := 'RAC-P-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    IF NEW.approved_at IS NULL THEN
      NEW.approved_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partners_generate_code
  BEFORE INSERT OR UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_partner_referral_code();

-- 2. Referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  first_paid_shipment_id UUID,
  first_paid_invoice_id UUID,
  is_converted BOOLEAN NOT NULL DEFAULT false,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  commission_status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | paid
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_user_id)
);

CREATE INDEX idx_referrals_partner_id ON public.referrals(partner_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_commission_status ON public.referrals(commission_status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Partners can view referrals tied to them
CREATE POLICY "Partners can view their own referrals"
  ON public.referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = referrals.partner_id
        AND p.user_id = auth.uid()
    )
  );

-- Admins manage all referrals
CREATE POLICY "Admins can manage referrals"
  ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add referral tracking to profiles (referred_by_partner_id + referral_code at signup)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_partner_id UUID,
  ADD COLUMN IF NOT EXISTS signup_referral_code TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by_partner_id);

-- 4. Update handle_new_user to capture referral code from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref_code TEXT;
  v_partner_id UUID;
BEGIN
  v_ref_code := NEW.raw_user_meta_data ->> 'referral_code';

  -- Look up partner by code if provided
  IF v_ref_code IS NOT NULL AND v_ref_code <> '' THEN
    SELECT id INTO v_partner_id
    FROM public.partners
    WHERE referral_code = v_ref_code
      AND status = 'approved'
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    user_id, full_name, email, phone, address, city, state, country, company_name,
    referred_by_partner_id, signup_referral_code
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'company_name',
    v_partner_id,
    v_ref_code
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name),
    referred_by_partner_id = COALESCE(EXCLUDED.referred_by_partner_id, public.profiles.referred_by_partner_id),
    signup_referral_code = COALESCE(EXCLUDED.signup_referral_code, public.profiles.signup_referral_code);

  -- Create referral row immediately (not yet converted)
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO public.referrals (partner_id, referred_user_id, referral_code)
    VALUES (v_partner_id, NEW.id, v_ref_code)
    ON CONFLICT (referred_user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Convert referral + compute commission when an invoice is marked paid
CREATE OR REPLACE FUNCTION public.referral_on_invoice_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner RECORD;
  v_commission NUMERIC;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
    -- Find referral for this user that hasn't converted yet
    SELECT r.*, p.commission_percentage AS pct
    INTO v_partner
    FROM public.referrals r
    JOIN public.partners p ON p.id = r.partner_id
    WHERE r.referred_user_id = NEW.user_id
      AND r.is_converted = false
    LIMIT 1;

    IF FOUND THEN
      v_commission := ROUND((COALESCE(NEW.amount, 0) * COALESCE(v_partner.pct, 0) / 100.0)::numeric, 2);
      UPDATE public.referrals
      SET is_converted = true,
          first_paid_shipment_id = NEW.shipment_id,
          first_paid_invoice_id = NEW.id,
          commission_amount = v_commission,
          commission_status = 'approved'
      WHERE id = v_partner.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_referral_on_invoice_paid
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.referral_on_invoice_paid();

-- 6. Global partner settings (single row)
CREATE TABLE public.partner_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  default_commission_percentage NUMERIC NOT NULL DEFAULT 5,
  minimum_payout_threshold NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT partner_settings_singleton CHECK (id = 1)
);

INSERT INTO public.partner_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.partner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner settings"
  ON public.partner_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage partner settings"
  ON public.partner_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_partner_settings_updated_at
  BEFORE UPDATE ON public.partner_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();