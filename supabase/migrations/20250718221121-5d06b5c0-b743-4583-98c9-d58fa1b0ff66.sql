-- ============= COMPLETAR ESTRUTURA FLOWTRIP MULTI-TENANT =============
-- Adicionar tabelas de gamificação que faltam

-- 1. Tabela de conquistas/achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_id UUID REFERENCES public.flowtrip_states(id),
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  points_awarded INTEGER DEFAULT 0,
  icon_url TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela de interações do usuário (analytics)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  state_id UUID REFERENCES public.flowtrip_states(id),
  interaction_type TEXT NOT NULL,
  page_url TEXT,
  destination_id UUID,
  event_id UUID,
  session_id TEXT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela para insights da IA Master
CREATE TABLE IF NOT EXISTS public.ai_master_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  state_code VARCHAR(10),
  actions JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2),
  region TEXT,
  data_sources TEXT[],
  recommendations JSONB DEFAULT '{}',
  generated_by UUID,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============= ATUALIZAR TABELAS EXISTENTES =============

-- Atualizar user_levels para incluir state_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_levels' 
    AND column_name = 'state_id'
  ) THEN
    ALTER TABLE public.user_levels ADD COLUMN state_id UUID REFERENCES public.flowtrip_states(id);
    
    -- Associar levels existentes ao estado MS
    UPDATE public.user_levels 
    SET state_id = (SELECT id FROM public.flowtrip_states WHERE code = 'ms')
    WHERE state_id IS NULL;
  END IF;
END
$$;

-- Atualizar passport_stamps para incluir state_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'passport_stamps' 
    AND column_name = 'state_id'
  ) THEN
    ALTER TABLE public.passport_stamps ADD COLUMN state_id UUID REFERENCES public.flowtrip_states(id);
    
    -- Associar stamps existentes ao estado MS
    UPDATE public.passport_stamps 
    SET state_id = (SELECT id FROM public.flowtrip_states WHERE code = 'ms')
    WHERE state_id IS NULL;
  END IF;
END
$$;

-- ============= ROW LEVEL SECURITY POLICIES =============

-- RLS para user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own achievements" ON public.user_achievements;  
CREATE POLICY "Users can create own achievements" ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS para user_interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own interactions" ON public.user_interactions;
CREATE POLICY "Users can create their own interactions" ON public.user_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can view all interactions" ON public.user_interactions;
CREATE POLICY "Managers can view all interactions" ON public.user_interactions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor_igr', 'diretor_estadual')
  ));

-- RLS para ai_master_insights
ALTER TABLE public.ai_master_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view ai insights" ON public.ai_master_insights;
CREATE POLICY "Managers can view ai insights" ON public.ai_master_insights
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor_igr', 'diretor_estadual')
  ));

DROP POLICY IF EXISTS "System can create ai insights" ON public.ai_master_insights;
CREATE POLICY "System can create ai insights" ON public.ai_master_insights
  FOR INSERT
  WITH CHECK (true);

-- ============= FUNÇÃO PARA ATUALIZAR PONTOS DOS USUÁRIOS =============

CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_state_id UUID,
  p_points INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_total INTEGER := 0;
  new_level TEXT;
  new_level_number INTEGER;
BEGIN
  -- Buscar pontos atuais
  SELECT total_points INTO current_total 
  FROM public.user_levels 
  WHERE user_id = p_user_id AND state_id = p_state_id;
  
  -- Se não existe registro, criar
  IF current_total IS NULL THEN
    current_total := 0;
    INSERT INTO public.user_levels (user_id, state_id, total_points)
    VALUES (p_user_id, p_state_id, p_points);
  ELSE
    -- Atualizar pontos
    current_total := current_total + p_points;
    
    -- Determinar novo nível
    CASE 
      WHEN current_total >= 2000 THEN 
        new_level := 'Mestre';
        new_level_number := 5;
      WHEN current_total >= 1001 THEN 
        new_level := 'Aventureiro';
        new_level_number := 4;
      WHEN current_total >= 501 THEN 
        new_level := 'Viajante';
        new_level_number := 3;
      WHEN current_total >= 101 THEN 
        new_level := 'Explorador';
        new_level_number := 2;
      ELSE 
        new_level := 'Iniciante';
        new_level_number := 1;
    END CASE;
    
    UPDATE public.user_levels 
    SET 
      total_points = current_total,
      current_level = new_level,
      level_number = new_level_number,
      updated_at = now()
    WHERE user_id = p_user_id AND state_id = p_state_id;
  END IF;
END;
$$;