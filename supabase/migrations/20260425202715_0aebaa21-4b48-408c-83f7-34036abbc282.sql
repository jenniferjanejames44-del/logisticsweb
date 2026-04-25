-- Add zip_code column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS zip_code text;

-- Update handle_new_user to also persist zip_code from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ref_code TEXT;
  v_partner_id UUID;
BEGIN
  v_ref_code := NEW.raw_user_meta_data ->> 'referral_code';

  IF v_ref_code IS NOT NULL AND v_ref_code <> '' THEN
    SELECT id INTO v_partner_id
    FROM public.partners
    WHERE referral_code = v_ref_code
      AND status = 'approved'
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    user_id, full_name, email, phone, address, city, state, country, zip_code, company_name,
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
    NEW.raw_user_meta_data ->> 'zip_code',
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
    zip_code = COALESCE(EXCLUDED.zip_code, public.profiles.zip_code),
    company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name),
    referred_by_partner_id = COALESCE(EXCLUDED.referred_by_partner_id, public.profiles.referred_by_partner_id),
    signup_referral_code = COALESCE(EXCLUDED.signup_referral_code, public.profiles.signup_referral_code);

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO public.referrals (partner_id, referred_user_id, referral_code)
    VALUES (v_partner_id, NEW.id, v_ref_code)
    ON CONFLICT (referred_user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;