
-- Contacts
CREATE TABLE public.email_center_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_center_contacts TO authenticated;
GRANT ALL ON public.email_center_contacts TO service_role;
ALTER TABLE public.email_center_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage contacts" ON public.email_center_contacts FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.email_center_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Company settings (single row)
CREATE TABLE public.email_center_company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL DEFAULT 'RAC Logistics',
  slogan TEXT NOT NULL DEFAULT 'Procurement | Shipping | Customs Clearing',
  logo_url TEXT NOT NULL DEFAULT 'https://raclogisticltd.com/lovable-uploads/rac-logo.png',
  website TEXT NOT NULL DEFAULT 'https://raclogisticltd.com',
  address TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
  phone TEXT NOT NULL DEFAULT '+234 800 000 0000',
  support_email TEXT NOT NULL DEFAULT 'info@raclogisticltd.com',
  primary_color TEXT NOT NULL DEFAULT '#061043',
  accent_color TEXT NOT NULL DEFAULT '#DF5101',
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  whatsapp_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT ON public.email_center_company_settings TO authenticated;
GRANT ALL ON public.email_center_company_settings TO service_role;
ALTER TABLE public.email_center_company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed can read settings" ON public.email_center_company_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins update settings" ON public.email_center_company_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.email_center_company_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.email_center_company_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.email_center_company_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Templates
CREATE TABLE public.email_center_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_center_templates TO authenticated;
GRANT ALL ON public.email_center_templates TO service_role;
ALTER TABLE public.email_center_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage templates" ON public.email_center_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.email_center_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed templates
INSERT INTO public.email_center_templates (name, category, subject, body_html, is_system) VALUES
('Business Proposal', 'proposal', 'Business Proposal from RAC Logistics',
 '<p>Dear {{name}},</p><p>Thank you for the opportunity to submit this business proposal. At RAC Logistics we specialize in end-to-end freight, procurement, and customs clearing.</p><p>We would love to schedule a call to discuss how we can support your logistics operations.</p><p>Warm regards,<br/>RAC Logistics Team</p>', true),
('Partnership Invitation', 'partnership', 'Partnership Invitation — RAC Logistics',
 '<p>Dear {{name}},</p><p>We are inviting select organizations to join our partner network for cross-border logistics in West Africa and beyond.</p><p>Kindly let us know a convenient time to discuss the partnership structure.</p><p>Best regards,<br/>RAC Logistics</p>', true),
('Corporate Introduction', 'intro', 'Introducing RAC Logistics',
 '<p>Dear {{name}},</p><p>RAC Logistics is a full-service freight and procurement company handling air, sea, and door-to-door shipments worldwide.</p><p>We would love to introduce our services to your team.</p>', true),
('Shipping Services', 'services', 'Reliable Shipping Solutions from RAC Logistics',
 '<p>Hello {{name}},</p><p>Our shipping services cover air freight, sea freight, express courier, and last-mile delivery — with real-time tracking and dedicated support.</p>', true),
('Customs Clearance', 'services', 'Fast Customs Clearance with RAC Logistics',
 '<p>Hello {{name}},</p><p>We handle customs documentation, duty computation, and clearance at all major ports and airports — so your cargo moves without delays.</p>', true),
('Promotional Campaign', 'promo', 'Special Offer from RAC Logistics',
 '<p>Hi {{name}},</p><p>For a limited time, enjoy discounted freight rates on air and sea shipments. Book your shipment today!</p>', true),
('Holiday Greetings', 'greeting', 'Season''s Greetings from RAC Logistics',
 '<p>Dear {{name}},</p><p>Wishing you and your family a wonderful holiday season. Thank you for trusting us with your logistics needs.</p>', true),
('Shipment Update', 'update', 'Update on your shipment',
 '<p>Hello {{name}},</p><p>This is an update on your recent shipment with RAC Logistics. Please contact us if you have any questions.</p>', true),
('Payment Reminder', 'reminder', 'Friendly Payment Reminder',
 '<p>Dear {{name}},</p><p>This is a friendly reminder about an outstanding invoice. Kindly complete the payment at your earliest convenience.</p>', true),
('Thank You', 'thanks', 'Thank you from RAC Logistics',
 '<p>Dear {{name}},</p><p>Thank you for choosing RAC Logistics. We truly value your business and look forward to serving you again.</p>', true);

-- Messages (drafts + sent)
CREATE TABLE public.email_center_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  to_recipients TEXT[] NOT NULL DEFAULT '{}',
  cc_recipients TEXT[] NOT NULL DEFAULT '{}',
  bcc_recipients TEXT[] NOT NULL DEFAULT '{}',
  attachments JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sending | sent | failed
  error_message TEXT,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_center_messages TO authenticated;
GRANT ALL ON public.email_center_messages TO service_role;
ALTER TABLE public.email_center_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage messages" ON public.email_center_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_msg_updated BEFORE UPDATE ON public.email_center_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
