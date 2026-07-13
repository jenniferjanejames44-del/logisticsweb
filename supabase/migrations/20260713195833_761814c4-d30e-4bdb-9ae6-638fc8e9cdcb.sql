
CREATE POLICY "Admins read email attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload email attachments" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete email attachments" ON storage.objects FOR DELETE
  USING (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'));
