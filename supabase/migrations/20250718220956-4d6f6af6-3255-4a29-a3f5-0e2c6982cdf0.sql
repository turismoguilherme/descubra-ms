-- ============= FLOWTRIP MULTI-TENANT DATABASE STRUCTURE =============
-- Fase 1: Banco de dados multi-tenant completo

-- 1. Tabela principal dos estados (clientes FlowTrip)
CREATE TABLE public.flowtrip_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL, -- 'ms', 'sp', 'rj', etc.
  name VARCHAR(100) NOT NULL, -- 'Mato Grosso do Sul', etc.
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a365d',
  secondary_color VARCHAR(7) DEFAULT '#38b2ac', 
  accent_color VARCHAR(7) DEFAULT '#ed8936',
  has_alumia BOOLEAN DEFAULT false,
  plan_type VARCHAR(20) DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  billing_email TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir estado inicial (MS - cliente exemplo)
INSERT INTO public.flowtrip_states (code, name, primary_color, secondary_color, accent_color, has_alumia, plan_type, is_active)
VALUES ('ms', 'Mato Grosso do Sul', '#1a365d', '#38b2ac', '#ed8936', true, 'premium', true);

-- 2. Atualizar tabela user_roles para incluir state_id
ALTER TABLE public.user_roles ADD COLUMN state_id UUID REFERENCES public.flowtrip_states(id);

-- Atualizar roles existentes para associar ao estado MS
UPDATE public.user_roles 
SET state_id = (SELECT id FROM public.flowtrip_states WHERE code = 'ms')
WHERE state_id IS NULL;

-- 3. Tabela de features por estado
CREATE TABLE public.flowtrip_state_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id UUID REFERENCES public.flowtrip_states(id),
  feature_name VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir features padrão para MS
INSERT INTO public.flowtrip_state_features (state_id, feature_name, is_enabled, config)
SELECT 
  (SELECT id FROM public.flowtrip_states WHERE code = 'ms'),
  feature_name,
  true,
  '{}'::jsonb
FROM (VALUES 
  ('gamification'),
  ('digital_passport'), 
  ('ai_chat'),
  ('analytics'),
  ('events_management'),
  ('destinations_management'),
  ('user_management'),
  ('content_management'),
  ('alumia_integration')
) AS features(feature_name);

-- 4. Tabela de configurações master FlowTrip
CREATE TABLE public.flowtrip_master_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configurações master padrão
INSERT INTO public.flowtrip_master_config (config_key, config_value, description)
VALUES 
  ('ai_master_enabled', 'true', 'Habilitar IA Master para gestão da plataforma'),
  ('global_analytics_enabled', 'true', 'Habilitar analytics globais'),
  ('billing_automation', 'true', 'Automação de cobrança'),
  ('support_ai_enabled', 'true', 'IA para suporte automático'),
  ('max_states_per_plan', '{"basic": 1, "premium": 5, "enterprise": 50}', 'Limite de estados por plano');

-- ============= ROW LEVEL SECURITY POLICIES =============

-- RLS para flowtrip_states
ALTER TABLE public.flowtrip_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FlowTrip admins can manage all states" ON public.flowtrip_states
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "State users can view their state" ON public.flowtrip_states
  FOR SELECT
  USING (
    id IN (SELECT state_id FROM public.user_roles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- RLS para flowtrip_state_features  
ALTER TABLE public.flowtrip_state_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "State admins can manage features" ON public.flowtrip_state_features
  FOR ALL
  USING (
    state_id IN (SELECT state_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'tech', 'diretor_estadual', 'gestor_igr'))
  );

-- RLS para flowtrip_master_config
ALTER TABLE public.flowtrip_master_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only FlowTrip admins can manage master config" ON public.flowtrip_master_config
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

-- ============= HELPER FUNCTIONS =============

-- Função para verificar se usuário tem role específico em um estado
CREATE OR REPLACE FUNCTION public.has_state_role(check_user_id UUID, required_role TEXT, check_state_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id 
    AND role = required_role
    AND (state_id = check_state_id OR role IN ('admin', 'tech'))
  );
$$;

-- Função para obter estados de um usuário
CREATE OR REPLACE FUNCTION public.get_user_states(check_user_id UUID)
RETURNS TABLE(state_id UUID, state_code TEXT, state_name TEXT, user_role TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(ur.state_id, fs.id) as state_id,
    fs.code as state_code,
    fs.name as state_name,
    ur.role as user_role
  FROM user_roles ur
  LEFT JOIN flowtrip_states fs ON ur.state_id = fs.id OR ur.role IN ('admin', 'tech')
  WHERE ur.user_id = check_user_id
  AND fs.is_active = true;
$$;