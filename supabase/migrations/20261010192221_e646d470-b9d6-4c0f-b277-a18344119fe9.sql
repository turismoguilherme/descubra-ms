CREATE OR REPLACE FUNCTION public.can_manage_site_media(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _uid IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid
      AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal','diretor_estadual','gestor_igr'))
    OR EXISTS (SELECT 1 FROM public.viajar_employees WHERE user_id = _uid AND coalesce(is_active, true))
  );
$$;
REVOKE EXECUTE ON FUNCTION public.can_manage_site_media(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_manage_site_media(uuid) TO authenticated;

CREATE POLICY "Site staff upload footer logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'footer-logos' AND public.can_manage_site_media(auth.uid()));
CREATE POLICY "Site staff update footer logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'footer-logos' AND public.can_manage_site_media(auth.uid()))
  WITH CHECK (bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'footer-logos' AND public.can_manage_site_media(auth.uid()));
CREATE POLICY "Site staff delete footer logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'footer-logos' AND public.can_manage_site_media(auth.uid()));