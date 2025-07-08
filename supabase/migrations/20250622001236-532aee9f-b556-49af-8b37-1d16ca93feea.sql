
-- Criar tabelas que estão faltando no Supabase

-- 1. Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Tabelas para secretaria (arquivos municipais)
CREATE TABLE IF NOT EXISTS public.secretary_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  description TEXT,
  city TEXT DEFAULT 'Campo Grande',
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID NOT NULL,
  uploader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabelas para pesquisas institucionais
CREATE TABLE IF NOT EXISTS public.institutional_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  questions JSONB NOT NULL,
  city TEXT DEFAULT 'Campo Grande',
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  responses JSONB NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretary_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para as novas tabelas
CREATE POLICY "Users manage own data" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admins manage all" ON public.secretary_files FOR ALL USING (public.is_admin_or_tech(auth.uid()));
CREATE POLICY "Admins manage surveys" ON public.institutional_surveys FOR ALL USING (public.is_admin_or_tech(auth.uid()));
CREATE POLICY "Public view surveys" ON public.institutional_surveys FOR SELECT USING (is_active = true);
CREATE POLICY "Public submit responses" ON public.survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view responses" ON public.survey_responses FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- Inserir dados iniciais no conteúdo institucional (se não existir)
INSERT INTO public.institutional_content (content_key, content_value, content_type, description) VALUES
('hero_title', 'Descubra Mato Grosso do Sul', 'text', 'Título principal na página inicial'),
('hero_subtitle', 'Do Pantanal ao Cerrado, uma experiência única de natureza, cultura e aventura', 'text', 'Subtítulo na página inicial'),
('footer_description', 'Sua plataforma digital para explorar as maravilhas do Mato Grosso do Sul', 'text', 'Descrição no rodapé')
ON CONFLICT (content_key) DO NOTHING;
