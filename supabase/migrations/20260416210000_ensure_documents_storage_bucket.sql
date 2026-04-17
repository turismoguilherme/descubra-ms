-- Garantir bucket Storage "documents" no projeto (PDFs de políticas e termos de parceiros).
-- Idempotente: pode correr mesmo que 20251226000003_create_documents_bucket.sql já tenha corrido.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

DROP POLICY IF EXISTS "Permitir upload de documentos de termos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de documentos" ON storage.objects;

CREATE POLICY "Permitir upload de documentos de termos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Permitir leitura pública de documentos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Permitir atualização de documentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

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
