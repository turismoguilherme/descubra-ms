
-- Migração completa para restaurar funcionalidades do banco de dados

-- 1. Criar tabela municipal_collaborators (faltante)
CREATE TABLE IF NOT EXISTS public.municipal_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  manager_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Adicionar campos faltantes na tabela institutional_partners
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS segment TEXT,
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Campo Grande',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'local',
ADD COLUMN IF NOT EXISTS website_link TEXT;

-- Atualizar coluna website_url para website_link se necessário
UPDATE public.institutional_partners 
SET website_link = website_url 
WHERE website_link IS NULL AND website_url IS NOT NULL;

-- 3. Criar buckets de storage necessários
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secretary-documents', 'secretary-documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.municipal_collaborators ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para municipal_collaborators
CREATE POLICY "Admins manage collaborators" 
  ON public.municipal_collaborators 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

-- 6. Criar políticas para storage buckets
CREATE POLICY "Public can view secretary documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'secretary-documents');

CREATE POLICY "Authenticated users can upload secretary documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'secretary-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete secretary documents" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'secretary-documents' AND public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Public can view partner logos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'partner-logos');

CREATE POLICY "Authenticated users can upload partner logos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');

-- 7. Inserir dados de exemplo para testar
INSERT INTO public.municipal_collaborators (name, email, position, role, city, manager_id) 
VALUES 
  ('João Silva', 'joao@campogrande.ms.gov.br', 'Coordenador de Turismo', 'coordenador', 'Campo Grande', '00000000-0000-0000-0000-000000000000'),
  ('Maria Santos', 'maria@dourados.ms.gov.br', 'Atendente CAT', 'atendente_cat', 'Dourados', '00000000-0000-0000-0000-000000000000'),
  ('Pedro Costa', 'pedro@bonito.ms.gov.br', 'Pesquisador', 'pesquisador', 'Bonito', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- 8. Inserir parceiros de exemplo
INSERT INTO public.institutional_partners (name, description, segment, city, category, website_link, contact_email, status)
VALUES 
  ('Hotel Pantanal', 'Hotel especializado em ecoturismo', 'Hospedagem', 'Campo Grande', 'local', 'https://hotelpantanal.com.br', 'contato@hotelpantanal.com.br', 'approved'),
  ('Turismo MS', 'Agência de turismo regional', 'Turismo', 'Campo Grande', 'regional', 'https://turismoms.com.br', 'info@turismoms.com.br', 'approved'),
  ('Governo do Estado', 'Parceiro institucional estadual', 'Governo', 'Campo Grande', 'estadual', 'https://www.ms.gov.br', 'turismo@ms.gov.br', 'approved')
ON CONFLICT DO NOTHING;
