-- Migration: Criar bucket 'documents' no Supabase Storage para PDFs de termos
-- Bucket: documents
-- Objetivo: Armazenar PDFs de termos de parceria assinados para segurança jurídica

-- 1. CRIAR O BUCKET DE DOCUMENTOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, -- Público para leitura (PDFs precisam ser acessíveis)
  10485760, -- 10MB (tamanho máximo por arquivo)
  ARRAY['application/pdf'] -- Apenas PDFs
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. POLÍTICAS DE STORAGE
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir upload de documentos de termos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de documentos" ON storage.objects;

-- Permitir upload (apenas para usuários autenticados ou sistema)
CREATE POLICY "Permitir upload de documentos de termos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Permitir leitura pública (qualquer pessoa pode ver os PDFs - necessário para acesso)
CREATE POLICY "Permitir leitura pública de documentos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Permitir atualização (apenas para usuários autenticados)
CREATE POLICY "Permitir atualização de documentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Permitir deleção (apenas para admins - documentos são importantes para segurança jurídica)
CREATE POLICY "Permitir deleção de documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'tech')
  )
);

-- 3. COMENTÁRIOS
COMMENT ON TABLE storage.buckets IS 'Buckets do Supabase Storage';
COMMENT ON COLUMN storage.buckets.id IS 'ID do bucket (usado como referência)';

-- 4. VERIFICAR SE FUNCIONOU
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    RAISE NOTICE 'Bucket "documents" criado com sucesso!';
  ELSE
    RAISE WARNING 'Bucket "documents" não foi criado. Verifique permissões.';
  END IF;
END $$;

