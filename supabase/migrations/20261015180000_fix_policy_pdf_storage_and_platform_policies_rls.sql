-- PDFs oficiais (policy-pdfs/*) no bucket documents + quem edita platform_policies.
-- Idempotente: corrige projetos onde 20261010192221 / 20261012182731 ainda não foram aplicadas,
-- ou onde staff (master_admin, viajar_employees, etc.) não passava em is_admin_user.

CREATE OR REPLACE FUNCTION public.can_manage_site_media(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _uid IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _uid
        AND role IN (
          'admin', 'tech', 'master_admin',
          'municipal_manager', 'gestor_municipal',
          'diretor_estadual', 'gestor_igr'
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.viajar_employees
      WHERE user_id = _uid AND coalesce(is_active, true)
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_manage_site_media(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_manage_site_media(uuid) TO authenticated;

-- Storage: policy-pdfs (INSERT / UPDATE para upsert / DELETE)
DROP POLICY IF EXISTS "Staff upload policy pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Staff update policy pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete policy pdfs" ON storage.objects;

CREATE POLICY "Staff upload policy pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'policy-pdfs'
  AND public.can_manage_site_media(auth.uid())
);

CREATE POLICY "Staff update policy pdfs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'policy-pdfs'
  AND public.can_manage_site_media(auth.uid())
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'policy-pdfs'
  AND public.can_manage_site_media(auth.uid())
);

CREATE POLICY "Staff delete policy pdfs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'policy-pdfs'
  AND public.can_manage_site_media(auth.uid())
);

-- platform_policies: alinhar com quem pode gerir media do site (não só admin/tech)
DROP POLICY IF EXISTS "Admins can read all policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can insert policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can update policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can delete policies" ON public.platform_policies;

CREATE POLICY "Admins can read all policies"
  ON public.platform_policies
  FOR SELECT
  TO authenticated
  USING (public.can_manage_site_media(auth.uid()) OR public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert policies"
  ON public.platform_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_site_media(auth.uid()) OR public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update policies"
  ON public.platform_policies
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_site_media(auth.uid()) OR public.is_admin_user(auth.uid()))
  WITH CHECK (public.can_manage_site_media(auth.uid()) OR public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete policies"
  ON public.platform_policies
  FOR DELETE
  TO authenticated
  USING (public.can_manage_site_media(auth.uid()) OR public.is_admin_user(auth.uid()));
