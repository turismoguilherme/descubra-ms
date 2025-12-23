-- Políticas de Storage para o bucket event-images
-- Execute este SQL no SQL Editor do Supabase após criar o bucket

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir upload público de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de eventos" ON storage.objects;

-- Política para permitir upload público de imagens de eventos (sem restrição de pasta)
CREATE POLICY "Permitir upload público de imagens de eventos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');

-- Política para permitir leitura pública de imagens de eventos
CREATE POLICY "Permitir leitura pública de imagens de eventos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Política para permitir atualização pública de imagens de eventos
CREATE POLICY "Permitir atualização pública de imagens de eventos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'event-images');

