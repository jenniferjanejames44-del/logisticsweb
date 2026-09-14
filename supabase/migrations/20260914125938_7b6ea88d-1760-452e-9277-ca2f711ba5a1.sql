
CREATE TABLE public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  iso_code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shipping_zone_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_zone_countries_country_unique UNIQUE (country_id)
);

CREATE INDEX idx_szc_zone ON public.shipping_zone_countries(zone_id);
CREATE INDEX idx_countries_iso ON public.countries(iso_code);

GRANT SELECT ON public.shipping_zones TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shipping_zones TO authenticated;
GRANT ALL ON public.shipping_zones TO service_role;

GRANT SELECT ON public.countries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;

GRANT SELECT ON public.shipping_zone_countries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shipping_zone_countries TO authenticated;
GRANT ALL ON public.shipping_zone_countries TO service_role;

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zone_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipping zones" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Admins manage shipping zones" ON public.shipping_zones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view zone countries" ON public.shipping_zone_countries FOR SELECT USING (true);
CREATE POLICY "Admins manage zone countries" ON public.shipping_zone_countries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_shipping_zones_updated BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_countries_updated BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_szc_updated BEFORE UPDATE ON public.shipping_zone_countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pricing engine readiness (nullable; no prices changed or invented)
ALTER TABLE public.pricing_rules
  ADD COLUMN IF NOT EXISTS zone_id uuid REFERENCES public.shipping_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zone_number integer;
CREATE INDEX IF NOT EXISTS idx_pricing_rules_zone ON public.pricing_rules(zone_number);

-- Zone resolver
CREATE OR REPLACE FUNCTION public.get_zone_by_country(_iso_code text)
RETURNS TABLE(zone_id uuid, zone_number integer, zone_name text, zone_active boolean, country_name text, iso_code text, country_active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT z.id, z.zone_number, z.name, z.is_active, c.name, c.iso_code, c.is_active
  FROM public.countries c
  JOIN public.shipping_zone_countries szc ON szc.country_id = c.id
  JOIN public.shipping_zones z ON z.id = szc.zone_id
  WHERE upper(c.iso_code) = upper(trim(_iso_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_zone_by_country(text) TO anon, authenticated, service_role;

-- Seed zones
INSERT INTO public.shipping_zones (zone_number, name) VALUES
 (1,'Zone 1'),(2,'Zone 2'),(3,'Zone 3'),(4,'Zone 4'),
 (5,'Zone 5'),(6,'Zone 6'),(7,'Zone 7'),(8,'Zone 8')
ON CONFLICT (zone_number) DO NOTHING;

-- Seed countries + assignments
WITH data(zone_no, cname, code) AS (VALUES
 (1,'Ireland','IE'),(1,'Jersey','JE'),(1,'United Kingdom','GB'),
 (2,'Benin','BJ'),(2,'Burkina Faso','BF'),(2,'Cameroon','CM'),(2,'Cape Verde','CV'),(2,'Central African Republic','CF'),(2,'Chad','TD'),(2,'Congo','CG'),(2,'Congo, DPR','CD'),(2,'Côte d''Ivoire','CI'),(2,'Gabon','GA'),(2,'Gambia','GM'),(2,'Ghana','GH'),(2,'Guinea Republic','GN'),(2,'Guinea-Bissau','GW'),(2,'Guinea-Equatorial','GQ'),(2,'Liberia','LR'),(2,'Mali','ML'),(2,'Niger','NE'),(2,'São Tomé and Príncipe','ST'),(2,'Senegal','SN'),(2,'Sierra Leone','SL'),(2,'Togo','TG'),
 (3,'Canada','CA'),(3,'Mexico','MX'),(3,'USA','US'),
 (4,'Albania','AL'),(4,'Andorra','AD'),(4,'Austria','AT'),(4,'Belarus','BY'),(4,'Belgium','BE'),(4,'Bosnia & Herzegovina','BA'),(4,'Bulgaria','BG'),(4,'Canary Islands','IC'),(4,'Croatia','HR'),(4,'Cyprus','CY'),(4,'Czech Republic','CZ'),(4,'Denmark','DK'),(4,'Estonia','EE'),(4,'Faroe Islands','FO'),(4,'Finland','FI'),(4,'France','FR'),(4,'Germany','DE'),(4,'Gibraltar','GI'),(4,'Greece','GR'),(4,'Greenland','GL'),(4,'Hungary','HU'),(4,'Iceland','IS'),(4,'Italy','IT'),(4,'Kosovo','KV'),(4,'Latvia','LV'),(4,'Liechtenstein','LI'),(4,'Lithuania','LT'),(4,'Luxembourg','LU'),(4,'Malta','MT'),(4,'Moldova, Republic of','MD'),(4,'Monaco','MC'),(4,'Montenegro','ME'),(4,'Netherlands','NL'),(4,'North Macedonia','MK'),(4,'Norway','NO'),(4,'Poland','PL'),(4,'Portugal','PT'),(4,'Romania','RO'),(4,'Russian Federation','RU'),
 (5,'Algeria','DZ'),(5,'Angola','AO'),(5,'Botswana','BW'),(5,'Burundi','BI'),(5,'Comoros','KM'),(5,'Djibouti','DJ'),(5,'Egypt','EG'),(5,'Eritrea','ER'),(5,'Eswatini','SZ'),(5,'Ethiopia','ET'),(5,'Kenya','KE'),(5,'Lesotho','LS'),(5,'Libya','LY'),(5,'Madagascar','MG'),(5,'Malawi','MW'),(5,'Mauritania','MR'),(5,'Mauritius','MU'),(5,'Mayotte','YT'),(5,'Morocco','MA'),(5,'Mozambique','MZ'),(5,'Namibia','NA'),(5,'Réunion, Island Of','RE'),(5,'Rwanda','RW'),(5,'Seychelles','SC'),(5,'Somalia','SO'),(5,'Somaliland, Rep Of','XS'),(5,'South Africa','ZA'),(5,'South Sudan','SS'),(5,'Sudan','SD'),(5,'Tanzania','TZ'),(5,'Tunisia','TN'),(5,'Uganda','UG'),(5,'Zambia','ZM'),(5,'Zimbabwe','ZW'),
 (6,'Afghanistan','AF'),(6,'Bahrain','BH'),(6,'Iran','IR'),(6,'Iraq','IQ'),(6,'Israel','IL'),(6,'Jordan','JO'),(6,'Kuwait','KW'),(6,'Lebanon','LB'),(6,'Oman','OM'),(6,'Qatar','QA'),(6,'Saudi Arabia','SA'),(6,'Syria','SY'),(6,'United Arab Emirates','AE'),(6,'Yemen, Republic of','YE'),
 (7,'Armenia','AM'),(7,'Australia','AU'),(7,'Azerbaijan','AZ'),(7,'Bangladesh','BD'),(7,'Bhutan','BT'),(7,'Brunei','BN'),(7,'Cambodia','KH'),(7,'China','CN'),(7,'Georgia','GE'),(7,'Hong Kong','HK'),(7,'India','IN'),(7,'Indonesia','ID'),(7,'Japan','JP'),(7,'Kazakhstan','KZ'),(7,'Korea, D.P.R.','KP'),(7,'Kyrgyzstan','KG'),(7,'Laos','LA'),(7,'Macau SAR','MO'),(7,'Malaysia','MY'),(7,'Maldives','MV'),(7,'Mongolia','MN'),(7,'Myanmar','MM'),(7,'Nepal','NP'),(7,'Pakistan','PK'),(7,'Palau','PW'),(7,'Philippines','PH'),(7,'Singapore','SG'),(7,'Sri Lanka','LK'),(7,'Taiwan','TW'),(7,'Tajikistan','TJ'),(7,'Thailand','TH'),(7,'Timor-Leste','TL'),(7,'Turkmenistan','TM'),(7,'Uzbekistan','UZ'),(7,'Vietnam','VN'),
 (8,'American Samoa','AS'),(8,'Anguilla','AI'),(8,'Antigua','AG'),(8,'Argentina','AR'),(8,'Aruba','AW'),(8,'Bahamas','BS'),(8,'Barbados','BB'),(8,'Belize','BZ'),(8,'Bermuda','BM'),(8,'Bolivia','BO'),(8,'Bonaire','XB'),(8,'Brazil','BR'),(8,'Cayman Islands','KY'),(8,'Chile','CL'),(8,'Colombia','CO'),(8,'Cook Islands','CK'),(8,'Costa Rica','CR'),(8,'Cuba','CU'),(8,'Curaçao','XC'),(8,'Dominica','DM'),(8,'Dominican Republic','DO'),(8,'Ecuador','EC'),(8,'El Salvador','SV'),(8,'Falkland Islands','FK'),(8,'Fiji','FJ'),(8,'French Guiana','GF'),(8,'Grenada','GD'),(8,'Guadeloupe','GP'),(8,'Guam','GU'),(8,'Guatemala','GT'),(8,'Guyana','GY'),(8,'Haiti','HT'),(8,'Honduras','HN'),(8,'Jamaica','JM'),(8,'Kiribati','KI'),(8,'Mariana Islands','MP'),(8,'Marshall Islands','MH'),(8,'Martinique','MQ'),(8,'Micronesia','FM')
), ins AS (
  INSERT INTO public.countries (name, iso_code)
  SELECT cname, code FROM data
  ON CONFLICT (iso_code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id, iso_code
)
INSERT INTO public.shipping_zone_countries (zone_id, country_id)
SELECT z.id, ins.id
FROM data d
JOIN ins ON ins.iso_code = d.code
JOIN public.shipping_zones z ON z.zone_number = d.zone_no
ON CONFLICT (country_id) DO NOTHING;
