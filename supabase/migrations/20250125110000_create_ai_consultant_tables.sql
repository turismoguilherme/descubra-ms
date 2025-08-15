-- Criação das tabelas para o sistema de IA Consultora

-- Tabela para logs de interações com a IA
CREATE TABLE IF NOT EXISTS ai_consultant_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  context JSONB,
  response_summary TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  insights_count INTEGER DEFAULT 0,
  recommendations_count INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações da IA por tenant/região
CREATE TABLE IF NOT EXISTS ai_consultant_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id VARCHAR(10) NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  gemini_api_key_encrypted TEXT,
  max_queries_per_day INTEGER DEFAULT 100,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.5,
  enabled BOOLEAN DEFAULT true,
  custom_prompts JSONB,
  data_sources JSONB DEFAULT '["flowtrip", "alumia"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, region_id, city_id)
);

-- Tabela para insights gerados proativamente
CREATE TABLE IF NOT EXISTS ai_proactive_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id VARCHAR(10) NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'trend', 'alert', 'opportunity', 'recommendation'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  data_sources JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  viewed_by UUID[] DEFAULT '{}',
  dismissed_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para feedback sobre respostas da IA
CREATE TABLE IF NOT EXISTS ai_consultant_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES ai_consultant_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  helpful BOOLEAN,
  feedback_text TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_consultant_logs_user_id ON ai_consultant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_consultant_logs_created_at ON ai_consultant_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_consultant_logs_confidence ON ai_consultant_logs(confidence);

CREATE INDEX IF NOT EXISTS idx_ai_consultant_config_tenant ON ai_consultant_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_consultant_config_region ON ai_consultant_config(region_id);
CREATE INDEX IF NOT EXISTS idx_ai_consultant_config_city ON ai_consultant_config(city_id);

CREATE INDEX IF NOT EXISTS idx_ai_proactive_insights_tenant ON ai_proactive_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_proactive_insights_type ON ai_proactive_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_proactive_insights_severity ON ai_proactive_insights(severity);
CREATE INDEX IF NOT EXISTS idx_ai_proactive_insights_created_at ON ai_proactive_insights(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_consultant_feedback_log_id ON ai_consultant_feedback(log_id);
CREATE INDEX IF NOT EXISTS idx_ai_consultant_feedback_rating ON ai_consultant_feedback(rating);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_consultant_logs_updated_at BEFORE UPDATE ON ai_consultant_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_consultant_config_updated_at BEFORE UPDATE ON ai_consultant_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_proactive_insights_updated_at BEFORE UPDATE ON ai_proactive_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE ai_consultant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consultant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_proactive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consultant_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para ai_consultant_logs (compatíveis com qualquer schema)
CREATE POLICY "Usuários podem ver seus próprios logs" ON ai_consultant_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios logs" ON ai_consultant_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas simplificadas e seguras para tabelas auxiliares
-- (políticas baseadas em perfis/roles serão adicionadas em migração posterior, compatível com o schema atual)
CREATE POLICY "Sistema pode criar insights" ON ai_proactive_insights
  FOR INSERT WITH CHECK (true); -- Permitir inserção via service_role

-- Políticas para ai_consultant_feedback
CREATE POLICY "Usuários podem criar feedback para seus logs" ON ai_consultant_feedback
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ai_consultant_logs
      WHERE ai_consultant_logs.id = ai_consultant_feedback.log_id
      AND ai_consultant_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem ver seu próprio feedback" ON ai_consultant_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Função para limpar logs antigos (executar via cron)
CREATE OR REPLACE FUNCTION cleanup_old_ai_logs()
RETURNS void AS $$
BEGIN
  -- Remove logs mais antigos que 90 dias
  DELETE FROM ai_consultant_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove insights expirados
  DELETE FROM ai_proactive_insights 
  WHERE expires_at < NOW();
  
  -- Remove feedback órfão
  DELETE FROM ai_consultant_feedback 
  WHERE log_id NOT IN (SELECT id FROM ai_consultant_logs);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas da IA
CREATE OR REPLACE FUNCTION get_ai_consultant_stats(
  p_tenant_id VARCHAR DEFAULT NULL,
  p_region_id UUID DEFAULT NULL,
  p_city_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_queries INTEGER,
  avg_confidence DECIMAL,
  total_users INTEGER,
  most_common_topics TEXT[],
  daily_usage JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_queries,
    AVG(l.confidence)::DECIMAL as avg_confidence,
    COUNT(DISTINCT l.user_id)::INTEGER as total_users,
    array_agg(DISTINCT split_part(l.question, ' ', 1))::TEXT[] as most_common_topics,
    jsonb_object_agg(
      DATE(l.created_at)::text, 
      COUNT(*)
    ) as daily_usage
  FROM ai_consultant_logs l
  WHERE 
    (p_tenant_id IS NULL OR l.context->>'tenant' = p_tenant_id) AND
    (p_region_id IS NULL OR (l.context->>'regionId')::UUID = p_region_id) AND
    (p_city_id IS NULL OR (l.context->>'cityId')::UUID = p_city_id) AND
    l.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE ai_consultant_logs IS 'Logs de todas as interações com a IA Consultora';
COMMENT ON TABLE ai_consultant_config IS 'Configurações da IA por tenant/região/cidade';
COMMENT ON TABLE ai_proactive_insights IS 'Insights gerados proativamente pela IA';
COMMENT ON TABLE ai_consultant_feedback IS 'Feedback dos usuários sobre respostas da IA';

COMMENT ON FUNCTION cleanup_old_ai_logs() IS 'Função para limpeza automática de logs antigos';
COMMENT ON FUNCTION get_ai_consultant_stats(VARCHAR, UUID, UUID, INTEGER) IS 'Obtém estatísticas de uso da IA Consultora'; 