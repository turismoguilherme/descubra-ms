
-- Criar tabelas para métricas de performance dos CATs
CREATE TABLE public.cat_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL,
  attendant_name TEXT NOT NULL,
  cat_name TEXT NOT NULL,
  date DATE NOT NULL,
  total_checkins INTEGER DEFAULT 0,
  total_hours_worked NUMERIC(5,2) DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  tourist_interactions INTEGER DEFAULT 0,
  performance_score NUMERIC(3,2) DEFAULT 0,
  feedback_rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para analytics de interações dos usuários
CREATE TABLE public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  interaction_type TEXT NOT NULL, -- 'click', 'view', 'search', 'passport_use', 'route_complete', etc.
  page_path TEXT,
  element_id TEXT,
  element_type TEXT, -- 'button', 'link', 'route', 'destination', etc.
  interaction_data JSONB, -- dados específicos da interação
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  region TEXT,
  city TEXT
);

-- Criar tabela para dados agregados de turismo
CREATE TABLE public.tourism_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'page_views', 'route_completions', 'passport_usage', etc.
  metric_value NUMERIC NOT NULL,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(region, city, date, metric_type)
);

-- Criar índices para performance
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_type_timestamp ON public.user_interactions(interaction_type, timestamp);
CREATE INDEX idx_user_interactions_region ON public.user_interactions(region);
CREATE INDEX idx_cat_performance_attendant_date ON public.cat_performance(attendant_id, date);
CREATE INDEX idx_tourism_analytics_region_date ON public.tourism_analytics(region, date);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cat_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cat_performance
CREATE POLICY "Attendants can view their own performance" 
  ON public.cat_performance 
  FOR SELECT 
  USING (auth.uid()::text = attendant_id::text);

CREATE POLICY "Managers can view all performance in their region" 
  ON public.cat_performance 
  FOR SELECT 
  USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "System can insert performance data" 
  ON public.cat_performance 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas RLS para user_interactions
CREATE POLICY "Users can view their own interactions" 
  ON public.user_interactions 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Managers can view interactions" 
  ON public.user_interactions 
  FOR SELECT 
  USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "System can insert interactions" 
  ON public.user_interactions 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas RLS para tourism_analytics
CREATE POLICY "Managers can view analytics" 
  ON public.tourism_analytics 
  FOR SELECT 
  USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "System can manage analytics" 
  ON public.tourism_analytics 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

-- Função para calcular score de performance
CREATE OR REPLACE FUNCTION public.calculate_performance_score(
  p_total_checkins INTEGER,
  p_total_hours NUMERIC,
  p_questions_answered INTEGER,
  p_tourist_interactions INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
BEGIN
  -- Pontuação baseada em check-ins (max 25 pontos)
  score := score + LEAST(p_total_checkins * 5, 25);
  
  -- Pontuação baseada em horas trabalhadas (max 25 pontos)
  score := score + LEAST(p_total_hours * 3, 25);
  
  -- Pontuação baseada em perguntas respondidas (max 25 pontos)
  score := score + LEAST(p_questions_answered * 2, 25);
  
  -- Pontuação baseada em interações com turistas (max 25 pontos)
  score := score + LEAST(p_tourist_interactions * 1, 25);
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Função para agregação diária de analytics
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  -- Agregar visualizações de página por região
  INSERT INTO public.tourism_analytics (region, city, date, metric_type, metric_value, additional_data)
  SELECT 
    COALESCE(region, 'unknown') as region,
    COALESCE(city, 'unknown') as city,
    target_date as date,
    'page_views' as metric_type,
    COUNT(*) as metric_value,
    jsonb_build_object('unique_users', COUNT(DISTINCT user_id)) as additional_data
  FROM public.user_interactions 
  WHERE DATE(timestamp) = target_date 
    AND interaction_type = 'page_view'
  GROUP BY region, city
  ON CONFLICT (region, city, date, metric_type) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    additional_data = EXCLUDED.additional_data;
    
  -- Agregar completações de roteiros
  INSERT INTO public.tourism_analytics (region, city, date, metric_type, metric_value, additional_data)
  SELECT 
    COALESCE(region, 'unknown') as region,
    COALESCE(city, 'unknown') as city,
    target_date as date,
    'route_completions' as metric_type,
    COUNT(*) as metric_value,
    jsonb_build_object('unique_users', COUNT(DISTINCT user_id)) as additional_data
  FROM public.user_interactions 
  WHERE DATE(timestamp) = target_date 
    AND interaction_type = 'route_complete'
  GROUP BY region, city
  ON CONFLICT (region, city, date, metric_type) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    additional_data = EXCLUDED.additional_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
