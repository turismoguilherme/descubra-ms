CREATE OR REPLACE FUNCTION public.is_partner_owner(p_partner_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.institutional_partners ip
      WHERE ip.id = p_partner_id
        AND (ip.created_by = auth.uid()
          OR (ip.contact_email IS NOT NULL AND lower(ip.contact_email) = lower(coalesce(auth.jwt()->>'email',''))))
    )
    OR public.can_manage_site_media(auth.uid())
  );
$$;

DROP POLICY IF EXISTS "Staff manage partner-images insert" ON storage.objects;
CREATE POLICY "Staff manage partner-images insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-images' AND public.can_manage_site_media(auth.uid()));
DROP POLICY IF EXISTS "Partner owner insert partner-images" ON storage.objects;
CREATE POLICY "Partner owner insert partner-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-images' AND public.is_partner_owner(((storage.foldername(name))[1])::uuid));
DROP POLICY IF EXISTS "Partner owner update partner-images" ON storage.objects;
CREATE POLICY "Partner owner update partner-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-images' AND public.is_partner_owner(((storage.foldername(name))[1])::uuid))
  WITH CHECK (bucket_id = 'partner-images' AND public.is_partner_owner(((storage.foldername(name))[1])::uuid));
DROP POLICY IF EXISTS "Staff upload footer logos any" ON storage.objects;
CREATE POLICY "Staff upload footer logos any" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'footer-logos' AND public.is_admin_user(auth.uid()));