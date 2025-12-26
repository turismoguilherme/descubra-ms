-- Migration: Criar tabelas para Agente Cris de Email
-- Descrição: Tabelas para armazenar histórico de respostas e contexto do agente Cris
-- Data: 2025-01-21

-- ============================================
-- TABELA: ai_email_responses
-- Armazena respostas geradas pela Cris
-- ============================================
CREATE TABLE IF NOT EXISTS ai_email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_email_id UUID REFERENCES communication_logs(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  was_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_human BOOLEAN DEFAULT FALSE,
  human_feedback TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TABELA: ai_email_context
-- Armazena contexto de conversas por usuário
-- ============================================
CREATE TABLE IF NOT EXISTS ai_email_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_type TEXT, -- 'partner', 'tourist', 'admin', 'secretary', 'user', etc.
  conversation_history JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_email)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ai_email_responses_original_email ON ai_email_responses(original_email_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_responses_sent ON ai_email_responses(was_sent);
CREATE INDEX IF NOT EXISTS idx_ai_email_responses_created ON ai_email_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_email_context_email ON ai_email_context(user_email);
CREATE INDEX IF NOT EXISTS idx_ai_email_context_type ON ai_email_context(user_type);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE ai_email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_email_context ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_email_responses
CREATE POLICY "Admins podem ver todas as respostas"
  ON ai_email_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Service role pode inserir/atualizar respostas"
  ON ai_email_responses FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para ai_email_context
CREATE POLICY "Usuários podem ver seu próprio contexto"
  ON ai_email_context FOR SELECT
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Service role pode gerenciar contexto"
  ON ai_email_context FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGERS PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_email_responses_updated_at
  BEFORE UPDATE ON ai_email_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_email_context_updated_at
  BEFORE UPDATE ON ai_email_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

