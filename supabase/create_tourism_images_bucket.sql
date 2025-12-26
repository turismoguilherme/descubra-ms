-- ================================================================
-- CRIAR BUCKET tourism-images NO SUPABASE STORAGE
-- Execute este SQL no SQL Editor do Supabase
-- ================================================================

-- 1. CRIAR O BUCKET DE IMAGENS DE TURISMO (para avatares, destinos, etc)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tourism-images', 
  'tourism-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. POLÍTICAS DE STORAGE (permitir upload e leitura pública)
DROP POLICY IF EXISTS "Permitir upload público de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção pública de imagens de turismo" ON storage.objects;

-- Permitir upload público
CREATE POLICY "Permitir upload público de imagens de turismo"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'tourism-images');

-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública de imagens de turismo"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tourism-images');

-- Permitir atualização pública (para upsert)
CREATE POLICY "Permitir atualização pública de imagens de turismo"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'tourism-images');

-- Permitir deleção pública (para limpeza)
CREATE POLICY "Permitir deleção pública de imagens de turismo"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'tourism-images');

-- 3. VERIFICAR SE FUNCIONOU
SELECT 
  'Bucket criado:' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'tourism-images';

