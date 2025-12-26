-- Migration: Criar tabelas para IA Autônoma
-- Descrição: Tabelas para salvar análises, melhorias de SEO e aprovações automáticas
-- Data: 2025-02-15

-- ============================================
-- ANÁLISES (Métricas e Relatórios Financeiros)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('metrics', 'financial')),
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índice para buscar última análise por tipo
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type_created ON ai_analyses(type, created_at DESC);

COMMENT ON TABLE ai_analyses IS 'Armazena análises de métricas e relatórios financeiros gerados pela IA Autônoma';
COMMENT ON COLUMN ai_analyses.type IS 'Tipo de análise: metrics (métricas unificadas) ou financial (relatório financeiro)';
COMMENT ON COLUMN ai_analyses.analysis_data IS 'Dados da análise em formato JSON (métricas, receitas, etc)';
COMMENT ON COLUMN ai_analyses.insights IS 'Insights gerados pela IA em texto';

-- ============================================
-- MELHORIAS DE SEO
-- ============================================
CREATE TABLE IF NOT EXISTS ai_seo_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'destination')),
  content_id UUID NOT NULL,
  improvements JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_analysis TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_content ON ai_seo_improvements(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_status ON ai_seo_improvements(status);
CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_priority ON ai_seo_improvements(priority, status);

COMMENT ON TABLE ai_seo_improvements IS 'Melhorias de SEO sugeridas pela IA para eventos e destinos';
COMMENT ON COLUMN ai_seo_improvements.improvements IS 'JSON com melhorias sugeridas (keywords, title, description, etc)';
COMMENT ON COLUMN ai_seo_improvements.priority IS 'Prioridade: low, medium, high';

-- ============================================
-- APROVAÇÕES AUTOMÁTICAS DE EVENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_auto_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  approval_reason TEXT NOT NULL,
  rules_applied JSONB DEFAULT '{}'::jsonb,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar aprovações por evento
CREATE INDEX IF NOT EXISTS idx_ai_auto_approvals_event ON ai_auto_approvals(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_auto_approvals_created ON ai_auto_approvals(created_at DESC);

COMMENT ON TABLE ai_auto_approvals IS 'Registro de eventos aprovados automaticamente pela IA';
COMMENT ON COLUMN ai_auto_approvals.approval_reason IS 'Motivo da aprovação automática';
COMMENT ON COLUMN ai_auto_approvals.rules_applied IS 'JSON com as regras que foram aplicadas para aprovar';

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_seo_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_auto_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas admins podem ver/inserir
CREATE POLICY "Admins can view ai_analyses" ON ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_analyses" ON ai_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_seo_improvements" ON ai_seo_improvements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_seo_improvements" ON ai_seo_improvements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can update ai_seo_improvements" ON ai_seo_improvements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_auto_approvals" ON ai_auto_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_auto_approvals" ON ai_auto_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );


