-- ================================================================
-- CRIAR BUCKET partner-images NO SUPABASE STORAGE
-- Execute este SQL no SQL Editor do Supabase
-- ================================================================

-- 1. CRIAR O BUCKET DE IMAGENS DE PARCEIROS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-images', 
  'partner-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. POLÍTICAS DE STORAGE (permitir upload e leitura pública)
DROP POLICY IF EXISTS "Permitir upload de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de imagens de parceiros" ON storage.objects;

-- Permitir upload (apenas para usuários autenticados)
CREATE POLICY "Permitir upload de imagens de parceiros"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partner-images');

-- Permitir leitura pública (qualquer pessoa pode ver as imagens)
CREATE POLICY "Permitir leitura pública de imagens de parceiros"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'partner-images');

-- Permitir atualização (apenas para usuários autenticados)
CREATE POLICY "Permitir atualização de imagens de parceiros"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'partner-images');

-- Permitir deleção (apenas para usuários autenticados)
CREATE POLICY "Permitir deleção de imagens de parceiros"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'partner-images');

-- 3. VERIFICAR SE FUNCIONOU
SELECT 
  'Bucket criado:' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'partner-images';

-- 4. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'Políticas criadas:' as status,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%parceiros%'
ORDER BY policyname;

