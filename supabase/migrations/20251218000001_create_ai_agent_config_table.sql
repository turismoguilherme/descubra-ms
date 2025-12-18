-- Migration: Criar tabela para configuração do Agente IA Autônomo
-- Descrição: Armazena a configuração do agente (ativo/inativo, tarefas, permissões) para execução 24/7
-- Data: 2025-12-18

-- ============================================
-- CONFIGURAÇÃO DO AGENTE IA AUTÔNOMO
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN NOT NULL DEFAULT false,
  autonomy_level INTEGER NOT NULL DEFAULT 50 CHECK (autonomy_level >= 0 AND autonomy_level <= 100),
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar configuração ativa rapidamente
CREATE INDEX IF NOT EXISTS idx_ai_agent_config_active ON ai_agent_config(active, updated_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ai_agent_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_agent_config_updated_at
  BEFORE UPDATE ON ai_agent_config
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_agent_config_updated_at();

COMMENT ON TABLE ai_agent_config IS 'Armazena a configuração do Agente IA Autônomo para execução 24/7 via backend';
COMMENT ON COLUMN ai_agent_config.active IS 'Indica se o agente está ativo (true) ou inativo (false)';
COMMENT ON COLUMN ai_agent_config.autonomy_level IS 'Nível de autonomia do agente (0-100)';
COMMENT ON COLUMN ai_agent_config.tasks IS 'Array JSON com as tarefas configuradas e seus estados';
COMMENT ON COLUMN ai_agent_config.permissions IS 'Objeto JSON com as permissões do agente';

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE ai_agent_config ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver configurações
-- Nota: A constraint de user_roles permite: 'admin', 'tech', 'diretor_estadual', 'gestor_igr', 'gestor_municipal', 'atendente', 'user'
-- Usamos apenas 'admin' e 'tech' para acesso à configuração do agente IA
CREATE POLICY "Admins can view ai_agent_config" ON ai_agent_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Apenas admins podem inserir configurações
CREATE POLICY "Admins can insert ai_agent_config" ON ai_agent_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Apenas admins podem atualizar configurações
CREATE POLICY "Admins can update ai_agent_config" ON ai_agent_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política especial: Service role pode ler configuração ativa (para Edge Function)
-- Nota: Service role bypassa RLS por padrão, mas é bom ter explícito
-- A Edge Function usa SERVICE_ROLE_KEY que bypassa RLS automaticamente

