-- Criar tabelas que estão faltando para resolver erros de build

-- Tabela secretary_files para o FileManager
CREATE TABLE public.secretary_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  description TEXT,
  category TEXT DEFAULT 'geral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela institutional_surveys para o SurveyManager
CREATE TABLE public.institutional_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array de questões da pesquisa
  target_audience TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  responses_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  region TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.secretary_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_surveys ENABLE ROW LEVEL SECURITY;

-- RLS Policies para secretary_files
CREATE POLICY "Municipal users can view secretary files" ON public.secretary_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Municipal managers can manage secretary files" ON public.secretary_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- RLS Policies para institutional_surveys
CREATE POLICY "Municipal users can view surveys" ON public.institutional_surveys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Municipal managers can manage surveys" ON public.institutional_surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_secretary_files_updated_at
  BEFORE UPDATE ON public.secretary_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutional_surveys_updated_at
  BEFORE UPDATE ON public.institutional_surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_secretary_files_category ON public.secretary_files(category);
CREATE INDEX idx_secretary_files_uploaded_by ON public.secretary_files(uploaded_by);
CREATE INDEX idx_institutional_surveys_status ON public.institutional_surveys(status);
CREATE INDEX idx_institutional_surveys_region ON public.institutional_surveys(region);