CREATE POLICY "Staff upload policy pdfs" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'policy-pdfs' AND public.can_manage_site_media(auth.uid()));
CREATE POLICY "Staff update policy pdfs" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'policy-pdfs' AND public.can_manage_site_media(auth.uid()))
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'policy-pdfs' AND public.can_manage_site_media(auth.uid()));