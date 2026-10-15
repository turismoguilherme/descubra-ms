-- master_admin acessa o admin Guatá mas is_admin_user só tinha admin/tech (bloqueava Storage e RPCs).

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id
      AND role IN ('admin', 'tech', 'master_admin')
  );
$$;

-- Reforço: paths policy-pdfs com LIKE (equivalente a foldername) + can_manage_site_media
DROP POLICY IF EXISTS "Staff upload policy pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Staff update policy pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete policy pdfs" ON storage.objects;

CREATE POLICY "Staff upload policy pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND name LIKE 'policy-pdfs/%'
  AND public.can_manage_site_media(auth.uid())
);

CREATE POLICY "Staff update policy pdfs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND name LIKE 'policy-pdfs/%'
  AND public.can_manage_site_media(auth.uid())
)
WITH CHECK (
  bucket_id = 'documents'
  AND name LIKE 'policy-pdfs/%'
  AND public.can_manage_site_media(auth.uid())
);

CREATE POLICY "Staff delete policy pdfs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND name LIKE 'policy-pdfs/%'
  AND public.can_manage_site_media(auth.uid())
);
