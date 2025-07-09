-- Criar tabelas adicionais que estão faltando

-- Tabela survey_responses para respostas de pesquisas
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.institutional_surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  responses JSONB NOT NULL, -- Respostas estruturadas por questão
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela municipal_collaborators para colaboradores municipais
CREATE TABLE public.municipal_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  position TEXT NOT NULL, -- cargo/função
  role TEXT NOT NULL, -- 'coordinator', 'analyst', 'support', etc
  department TEXT,
  municipality TEXT NOT NULL,
  region TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending'
  permissions JSONB, -- permissões específicas
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipal_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies para survey_responses
CREATE POLICY "Municipal users can view survey responses" ON public.survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Respondents can create responses" ON public.survey_responses
  FOR INSERT WITH CHECK (
    auth.uid() = respondent_id OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- RLS Policies para municipal_collaborators
CREATE POLICY "Municipal managers can view collaborators" ON public.municipal_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Municipal managers can manage collaborators" ON public.municipal_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_municipal_collaborators_updated_at
  BEFORE UPDATE ON public.municipal_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_respondent ON public.survey_responses(respondent_id);
CREATE INDEX idx_municipal_collaborators_municipality ON public.municipal_collaborators(municipality);
CREATE INDEX idx_municipal_collaborators_status ON public.municipal_collaborators(status);