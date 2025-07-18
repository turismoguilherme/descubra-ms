
-- Criar tabela de estados FlowTrip (clientes SaaS)
CREATE TABLE flowtrip_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a365d',
  secondary_color VARCHAR(7) DEFAULT '#38b2ac',
  accent_color VARCHAR(7) DEFAULT '#ed8936',
  has_alumia BOOLEAN DEFAULT false,
  plan_type VARCHAR(20) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  billing_email TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir estado MS como primeiro cliente
INSERT INTO flowtrip_states (code, name, logo_url, primary_color, secondary_color, accent_color, has_alumia, plan_type, is_active) 
VALUES ('ms', 'Mato Grosso do Sul', '/states/ms/logo.png', '#1a365d', '#38b2ac', '#ed8936', true, 'premium', true);

-- Modificar user_roles para suportar state_id
ALTER TABLE user_roles ADD COLUMN state_id UUID REFERENCES flowtrip_states(id);

-- Atualizar roles existentes para MS
UPDATE user_roles SET state_id = (SELECT id FROM flowtrip_states WHERE code = 'ms') WHERE state_id IS NULL;

-- Criar tabela de funcionalidades por estado
CREATE TABLE flowtrip_state_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES flowtrip_states(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(state_id, feature_name)
);

-- Inserir funcionalidades padrão para MS
INSERT INTO flowtrip_state_features (state_id, feature_name, is_enabled) 
SELECT id, feature, true 
FROM flowtrip_states, 
UNNEST(ARRAY['gamification', 'ai_chat', 'analytics', 'alumia', 'digital_passport', 'events', 'destinations']) AS feature
WHERE code = 'ms';

-- Criar tabela de configurações master FlowTrip
CREATE TABLE flowtrip_master_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configurações master padrão
INSERT INTO flowtrip_master_config (config_key, config_value, description) VALUES
('ai_master_enabled', 'true', 'IA Master habilitada para monitoramento global'),
('global_support_email', '"suporte@flowtrip.com"', 'Email de suporte global FlowTrip'),
('billing_auto_generate', 'true', 'Gerar faturas automaticamente'),
('max_states_per_plan', '{"basic": 1, "premium": 5, "enterprise": 999}', 'Limite de estados por plano');

-- RLS para flowtrip_states
ALTER TABLE flowtrip_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FlowTrip admins can manage all states" ON flowtrip_states
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "State users can view their state" ON flowtrip_states
  FOR SELECT USING (
    id IN (
      SELECT state_id FROM user_roles 
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- RLS para flowtrip_state_features
ALTER TABLE flowtrip_state_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "State admins can manage features" ON flowtrip_state_features
  FOR ALL USING (
    state_id IN (
      SELECT state_id FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'diretor_estadual', 'gestor_igr')
    )
  );

-- RLS para flowtrip_master_config
ALTER TABLE flowtrip_master_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only FlowTrip admins can manage master config" ON flowtrip_master_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- Função para verificar role específico por estado
CREATE OR REPLACE FUNCTION has_state_role(check_user_id UUID, required_role TEXT, check_state_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id 
    AND role = required_role
    AND (state_id = check_state_id OR role IN ('admin', 'tech'))
  );
$$;

-- Função para obter estados do usuário
CREATE OR REPLACE FUNCTION get_user_states(check_user_id UUID)
RETURNS TABLE(state_id UUID, state_code TEXT, state_name TEXT, user_role TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
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
