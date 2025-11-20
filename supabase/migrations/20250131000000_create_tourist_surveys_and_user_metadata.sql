-- Migration: Criar tabelas para pesquisas com turistas e controle de senha
-- Data: 2025-01-31
-- Descrição: Tabelas para sistema de atendentes e pesquisas com turistas

-- ============================================
-- TABELA: tourist_surveys
-- ============================================
CREATE TABLE IF NOT EXISTS tourist_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID, -- Referência ao CAT (pode ser string ou UUID)
  attendant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Data da pesquisa
  survey_date DATE DEFAULT CURRENT_DATE,
  survey_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dados do turista (LGPD: nome opcional)
  tourist_name TEXT, -- Opcional para conformidade LGPD
  tourist_origin TEXT NOT NULL, -- Estado ou país
  tourist_age_range TEXT, -- Ex: "18-25", "26-35", etc.
  
  -- Pergunta feita
  question_asked TEXT NOT NULL,
  
  -- Tipo de pergunta (múltipla escolha)
  question_type TEXT[] DEFAULT '{}', -- Array: ["hospedagem", "eventos", "localização", etc.]
  
  -- Motivação da viagem (múltipla escolha)
  travel_motivation TEXT[] DEFAULT '{}', -- Array: ["lazer", "negócios", "natureza", etc.]
  
  -- Observações adicionais
  observations TEXT,
  
  -- Metadados
  client_slug VARCHAR NOT NULL DEFAULT 'ms',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tourist_surveys_cat_id ON tourist_surveys(cat_id);
CREATE INDEX IF NOT EXISTS idx_tourist_surveys_attendant_id ON tourist_surveys(attendant_id);
CREATE INDEX IF NOT EXISTS idx_tourist_surveys_survey_date ON tourist_surveys(survey_date DESC);
CREATE INDEX IF NOT EXISTS idx_tourist_surveys_tourist_origin ON tourist_surveys(tourist_origin);
CREATE INDEX IF NOT EXISTS idx_tourist_surveys_client_slug ON tourist_surveys(client_slug);

-- ============================================
-- TABELA: user_metadata
-- ============================================
CREATE TABLE IF NOT EXISTS user_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Controle de troca de senha obrigatória
  must_change_password BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  
  -- Metadados adicionais
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_metadata_user_id ON user_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metadata_must_change_password ON user_metadata(must_change_password);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE tourist_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas para tourist_surveys
-- Atendentes podem ver suas próprias pesquisas
CREATE POLICY "Attendants can view own surveys"
  ON tourist_surveys FOR SELECT
  USING (auth.uid() = attendant_id);

-- Atendentes podem inserir suas próprias pesquisas
CREATE POLICY "Attendants can insert own surveys"
  ON tourist_surveys FOR INSERT
  WITH CHECK (auth.uid() = attendant_id);

-- Gestores municipais podem ver pesquisas dos atendentes da sua cidade
CREATE POLICY "Municipal managers can view surveys from their city"
  ON tourist_surveys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = tourist_surveys.attendant_id
      AND up.user_role = 'atendente'
      AND up.city_id = (
        SELECT city_id FROM user_profiles
        WHERE id = auth.uid()
        AND user_role IN ('gestor_municipal', 'admin', 'tech')
      )
    )
  );

-- Políticas para user_metadata
-- Usuários podem ver seus próprios metadados
CREATE POLICY "Users can view own metadata"
  ON user_metadata FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas sistema pode inserir/atualizar metadados (via função SECURITY DEFINER)
CREATE POLICY "System can manage metadata"
  ON user_metadata FOR ALL
  USING (false); -- Bloqueado por padrão, usar funções SECURITY DEFINER

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tourist_surveys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tourist_surveys_updated_at
  BEFORE UPDATE ON tourist_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_tourist_surveys_updated_at();

CREATE OR REPLACE FUNCTION update_user_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_metadata_updated_at
  BEFORE UPDATE ON user_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metadata_updated_at();

-- Função para criar metadata quando usuário é criado
CREATE OR REPLACE FUNCTION create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metadata (user_id, must_change_password)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar metadata automaticamente (se não existir trigger similar)
DROP TRIGGER IF EXISTS trigger_create_user_metadata ON auth.users;
-- Nota: Trigger em auth.users pode não ser permitido, então criar manualmente via função

-- Função para marcar necessidade de trocar senha
CREATE OR REPLACE FUNCTION set_must_change_password(p_user_id UUID, p_must_change BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_metadata (user_id, must_change_password)
  VALUES (p_user_id, p_must_change)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    must_change_password = p_must_change,
    updated_at = NOW();
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar troca de senha
CREATE OR REPLACE FUNCTION record_password_change(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_metadata
  SET 
    must_change_password = false,
    password_changed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE tourist_surveys IS 'Pesquisas realizadas com turistas nos CATs';
COMMENT ON TABLE user_metadata IS 'Metadados de usuários para controle de senha e login';
COMMENT ON COLUMN tourist_surveys.tourist_name IS 'Nome opcional do turista (LGPD)';
COMMENT ON COLUMN tourist_surveys.question_type IS 'Array de tipos de pergunta: hospedagem, eventos, localização, transporte, etc.';
COMMENT ON COLUMN tourist_surveys.travel_motivation IS 'Array de motivações: lazer, negócios, natureza, cultura, etc.';
COMMENT ON COLUMN user_metadata.must_change_password IS 'Flag para forçar troca de senha no primeiro acesso';

