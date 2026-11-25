DROP POLICY IF EXISTS "Public submit event images" ON storage.objects;

CREATE POLICY "Public submit event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'public-submissions'
  AND owner_id = (SELECT auth.uid()::text)
);