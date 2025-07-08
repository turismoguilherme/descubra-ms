
-- Criar função get_users_with_details
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  region TEXT,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.users.id,
    COALESCE(auth.users.raw_user_meta_data->>'name', auth.users.email) as name,
    auth.users.email,
    user_roles.role::TEXT,
    user_roles.region,
    'active'::TEXT as status
  FROM auth.users
  LEFT JOIN public.user_roles ON auth.users.id = user_roles.user_id
  WHERE auth.users.email_confirmed_at IS NOT NULL;
$$;

-- Criar tabela para documentos de inteligência turística
CREATE TABLE public.tourism_intelligence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  description TEXT,
  uploaded_by UUID NOT NULL,
  uploader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tourism_intelligence_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all documents" 
  ON public.tourism_intelligence_documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can upload documents" 
  ON public.tourism_intelligence_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own documents" 
  ON public.tourism_intelligence_documents 
  FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Criar tabela para localizações dos CATs
CREATE TABLE public.cat_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_name TEXT NOT NULL UNIQUE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir algumas localizações de CATs de exemplo
INSERT INTO public.cat_locations (cat_name, latitude, longitude, address) VALUES
('CAT Centro', -20.4428, -49.9888, 'Centro de Campo Grande'),
('CAT Aeroporto', -20.4689, -54.6742, 'Aeroporto Internacional de Campo Grande'),
('CAT Rodoviária', -20.4516, -54.6063, 'Terminal Rodoviário Rita Vieira');

-- Criar tabela para check-ins dos CATs
CREATE TABLE public.cat_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cat_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  distance_from_cat NUMERIC,
  status TEXT NOT NULL DEFAULT 'confirmado',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cat_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_checkins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cat_locations
CREATE POLICY "Everyone can view CAT locations" 
  ON public.cat_locations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage CAT locations" 
  ON public.cat_locations 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

-- Políticas RLS para cat_checkins
CREATE POLICY "Users can view their own checkins" 
  ON public.cat_checkins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
  ON public.cat_checkins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all checkins" 
  ON public.cat_checkins 
  FOR SELECT 
  USING (public.is_admin_or_tech(auth.uid()));

-- Criar storage bucket para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tourism-documents', 'tourism-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket
CREATE POLICY "Users can upload documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'tourism-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'tourism-documents');

CREATE POLICY "Users can delete their own documents" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'tourism-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
