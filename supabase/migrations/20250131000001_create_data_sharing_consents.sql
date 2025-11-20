-- Migration: Criar tabela para consentimentos LGPD de compartilhamento de dados
-- Data: 2025-01-31
-- Descrição: Tabela para registro de consentimentos para benchmarking

-- ============================================
-- TABELA: data_sharing_consents
-- ============================================
CREATE TABLE IF NOT EXISTS data_sharing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID, -- Referência ao negócio/empresa (pode ser user_id ou tabela separada)
  
  -- Consentimento
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tipos de dados compartilhados
  data_types_shared TEXT[] DEFAULT '{}', -- Array: ["revenue", "occupancy", "pricing", "ratings", etc.]
  
  -- Revogação
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Versão do termo aceito
  consent_version TEXT DEFAULT '1.0',
  terms_url TEXT, -- URL do termo de consentimento aceito
  
  -- Metadados
  ip_address TEXT, -- IP de onde foi dado o consentimento
  user_agent TEXT, -- User agent do navegador
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: apenas um consentimento ativo por usuário
  UNIQUE(user_id, business_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_data_sharing_consents_user_id ON data_sharing_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sharing_consents_business_id ON data_sharing_consents(business_id);
CREATE INDEX IF NOT EXISTS idx_data_sharing_consents_consent_given ON data_sharing_consents(consent_given);
CREATE INDEX IF NOT EXISTS idx_data_sharing_consents_consent_date ON data_sharing_consents(consent_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE data_sharing_consents ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios consentimentos
CREATE POLICY "Users can view own consents"
  ON data_sharing_consents FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios consentimentos
CREATE POLICY "Users can insert own consents"
  ON data_sharing_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios consentimentos
CREATE POLICY "Users can update own consents"
  ON data_sharing_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins podem ver todos os consentimentos (para relatórios agregados)
CREATE POLICY "Admins can view all consents"
  ON data_sharing_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_role IN ('admin', 'tech')
    )
  );

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_data_sharing_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_sharing_consents_updated_at
  BEFORE UPDATE ON data_sharing_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_data_sharing_consents_updated_at();

-- Função para revogar consentimento
CREATE OR REPLACE FUNCTION revoke_consent(p_user_id UUID, p_business_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE data_sharing_consents
  SET 
    consent_given = false,
    revoked_at = NOW(),
    revocation_reason = p_reason,
    updated_at = NOW()
  WHERE user_id = p_user_id
  AND (p_business_id IS NULL OR business_id = p_business_id)
  AND consent_given = true;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem consentimento ativo
CREATE OR REPLACE FUNCTION has_active_consent(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  has_consent BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM data_sharing_consents
    WHERE user_id = p_user_id
    AND (p_business_id IS NULL OR business_id = p_business_id)
    AND consent_given = true
    AND revoked_at IS NULL
  ) INTO has_consent;
  
  RETURN COALESCE(has_consent, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE data_sharing_consents IS 'Registro de consentimentos LGPD para compartilhamento de dados agregados para benchmarking';
COMMENT ON COLUMN data_sharing_consents.data_types_shared IS 'Array de tipos de dados compartilhados: revenue, occupancy, pricing, ratings, etc.';
COMMENT ON COLUMN data_sharing_consents.consent_version IS 'Versão do termo de consentimento aceito pelo usuário';
COMMENT ON COLUMN data_sharing_consents.revoked_at IS 'Data de revogação do consentimento (se aplicável)';

