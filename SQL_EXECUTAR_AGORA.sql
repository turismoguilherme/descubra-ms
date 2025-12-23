-- ================================================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- Este script configura tudo para o formulário de eventos funcionar
-- ================================================================

-- 1. CRIAR O BUCKET DE IMAGENS DE EVENTOS
-- (Execute isso primeiro, depois o resto)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images', 
  'event-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. POLÍTICAS DE STORAGE (permitir upload e leitura pública)
DROP POLICY IF EXISTS "Permitir upload público de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública de imagens de eventos" ON storage.objects;

-- Permitir upload público
CREATE POLICY "Permitir upload público de imagens de eventos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');

-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública de imagens de eventos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Permitir atualização pública (para upsert)
CREATE POLICY "Permitir atualização pública de imagens de eventos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'event-images');

-- 3. ADICIONAR COLUNA logo_evento NA TABELA events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS logo_evento TEXT;

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
  'Bucket criado:' as status,
  EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'event-images') as bucket_existe,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'logo_evento') as coluna_existe;

