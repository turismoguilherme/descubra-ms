-- FASE 2: Criação do sistema de coleta de interações dos usuários
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'page_visit', 'destination_click', 'event_click', 'passport_action', 'download', 'share'
  page_url TEXT,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  metadata JSONB, -- dados extras como coordenadas, filtros aplicados, etc
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 4: Sistema de ponto eletrônico para atendentes CAT
CREATE TABLE public.attendant_timesheet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cat_location TEXT NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out_time TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para base de conhecimento customizada dos gestores
CREATE TABLE public.knowledge_base_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'economic_data', 'market_research', 'policies', 'infrastructure', 'partnerships'
  region TEXT,
  source TEXT, -- 'alumia', 'ibge', 'mtur', 'embratur', 'manual'
  data_type TEXT, -- 'text', 'statistical', 'survey', 'report'
  metadata JSONB,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para insights gerados pela IA
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'user_behavior', 'market_opportunity', 'seasonal_trend', 'policy_suggestion'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_sources TEXT[], -- quais fontes foram usadas para gerar o insight
  recommendations JSONB, -- recomendações estruturadas
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'active', -- 'active', 'implemented', 'dismissed'
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_timesheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies para user_interactions
CREATE POLICY "Users can create their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all interactions" ON public.user_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager', 'gestor')
    )
  );

-- RLS Policies para attendant_timesheet
CREATE POLICY "Attendants can manage their own timesheet" ON public.attendant_timesheet
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- RLS Policies para knowledge_base_entries
CREATE POLICY "Managers can manage knowledge base" ON public.knowledge_base_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager', 'gestor')
    )
  );

-- RLS Policies para ai_insights
CREATE POLICY "Managers can view ai insights" ON public.ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager', 'gestor')
    )
  );

CREATE POLICY "System can create ai insights" ON public.ai_insights
  FOR INSERT WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_attendant_timesheet_updated_at
  BEFORE UPDATE ON public.attendant_timesheet
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_entries_updated_at
  BEFORE UPDATE ON public.knowledge_base_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX idx_attendant_timesheet_user_id ON public.attendant_timesheet(user_id);
CREATE INDEX idx_knowledge_base_region ON public.knowledge_base_entries(region);
CREATE INDEX idx_ai_insights_region ON public.ai_insights(region);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);