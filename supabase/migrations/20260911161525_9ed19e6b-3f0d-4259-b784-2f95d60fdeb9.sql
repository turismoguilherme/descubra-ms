-- Sem policy de SELECT em storage.buckets o serviço de arquivos responde
-- "Bucket not found" mesmo quando o bucket existe.
DROP POLICY IF EXISTS "Authenticated can list buckets" ON storage.buckets;
CREATE POLICY "Authenticated can list buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anon can list public buckets" ON storage.buckets;
CREATE POLICY "Anon can list public buckets"
ON storage.buckets
FOR SELECT
TO anon
USING (public = true);