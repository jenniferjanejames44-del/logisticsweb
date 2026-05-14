
-- Public bucket for campaign images (banners, inline)
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read (emails need to load images from any client)
DROP POLICY IF EXISTS "Email assets are publicly readable" ON storage.objects;
CREATE POLICY "Email assets are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'email-assets');

-- Admin-only writes
DROP POLICY IF EXISTS "Admins can upload email assets" ON storage.objects;
CREATE POLICY "Admins can upload email assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update email assets" ON storage.objects;
CREATE POLICY "Admins can update email assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete email assets" ON storage.objects;
CREATE POLICY "Admins can delete email assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));
