-- Create storage bucket for support ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for support attachments
CREATE POLICY "Users can upload attachments for their tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view attachments for their tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all support attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can upload attachments to any ticket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

