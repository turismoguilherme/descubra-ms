
-- Criar tabela para armazenar documentos da secretaria
CREATE TABLE public.tourism_intelligence_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel', 'word', 'csv', 'other')),
  category TEXT DEFAULT 'geral',
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tourism_intelligence_documents ENABLE ROW LEVEL SECURITY;

-- Política para que apenas usuários autenticados possam ver documentos
CREATE POLICY "Authenticated users can view documents" 
  ON public.tourism_intelligence_documents 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Política para que apenas usuários autenticados possam inserir documentos
CREATE POLICY "Authenticated users can insert documents" 
  ON public.tourism_intelligence_documents 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = uploaded_by);

-- Política para que apenas o uploader possa atualizar seus documentos
CREATE POLICY "Users can update their own documents" 
  ON public.tourism_intelligence_documents 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = uploaded_by);

-- Política para que apenas o uploader possa deletar seus documentos
CREATE POLICY "Users can delete their own documents" 
  ON public.tourism_intelligence_documents 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = uploaded_by);

-- Criar bucket de storage para os documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tourism-documents', 'tourism-documents', false);

-- Política de storage para permitir upload
CREATE POLICY "Allow authenticated uploads" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'tourism-documents');

-- Política de storage para permitir visualização
CREATE POLICY "Allow authenticated downloads" 
  ON storage.objects 
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'tourism-documents');

-- Política de storage para permitir delete
CREATE POLICY "Allow users to delete their files" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'tourism-documents');
