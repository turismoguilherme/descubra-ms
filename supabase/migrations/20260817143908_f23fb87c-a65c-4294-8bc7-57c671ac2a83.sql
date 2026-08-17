-- Remove política de upload permissiva no bucket partner-images (já existem políticas com dono)
DROP POLICY IF EXISTS "upload_partner_images" ON storage.objects;

-- Uploads em user-uploads apenas na pasta do próprio usuário
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );