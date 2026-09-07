DROP POLICY IF EXISTS "Partners upload own terms PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Partners update own terms PDFs" ON storage.objects;

CREATE POLICY "Partners upload own terms PDFs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE public.is_partner_owner(ip.id)
      AND (
        storage.objects.name LIKE 'partner-terms/partner-terms-' || ip.id::text || '-%'
        OR storage.objects.name LIKE 'partner-terms-uploaded/' || ip.id::text || '-%'
      )
  )
);

CREATE POLICY "Partners update own terms PDFs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE public.is_partner_owner(ip.id)
      AND (
        storage.objects.name LIKE 'partner-terms/partner-terms-' || ip.id::text || '-%'
        OR storage.objects.name LIKE 'partner-terms-uploaded/' || ip.id::text || '-%'
      )
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE public.is_partner_owner(ip.id)
      AND (
        storage.objects.name LIKE 'partner-terms/partner-terms-' || ip.id::text || '-%'
        OR storage.objects.name LIKE 'partner-terms-uploaded/' || ip.id::text || '-%'
      )
  )
);