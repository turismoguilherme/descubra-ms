-- Migration: Sistema de Venda de Dados de Turismo para Secretarias
-- Data: 2025-12-19
-- Descrição: Tabelas e configurações para venda de relatórios de dados agregados

-- ============================================
-- TABELA: data_sale_requests
-- ============================================
CREATE TABLE IF NOT EXISTS data_sale_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Dados do solicitante
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_organization TEXT,
  requester_city TEXT, -- Cidade/região de interesse
  
  -- Detalhes da solicitação
  report_type TEXT NOT NULL CHECK (report_type IN ('explanatory', 'raw_data', 'both')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_months INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM age(period_end, period_start)) * 12 + 
    EXTRACT(MONTH FROM age(period_end, period_start))
  ) STORED,
  
  -- Status e pagamento
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'generating', 'generated', 'delivered', 'cancelled', 'failed')),
  price_paid NUMERIC(10, 2),
  stripe_payment_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Relatório gerado
  report_file_path TEXT, -- Caminho do PDF no storage
  raw_data_file_path TEXT, -- Caminho do Excel/CSV no storage
  generated_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Validação de dados
  data_validation_status TEXT DEFAULT 'pending' CHECK (data_validation_status IN ('pending', 'validating', 'valid', 'insufficient', 'invalid')),
  data_validation_notes TEXT, -- Notas sobre validação
  data_sources_used TEXT[], -- Array de fontes de dados usadas: ["tourist_surveys", "user_interactions", "user_profiles", "alumia"]
  total_records_count INTEGER, -- Total de registros agregados
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_lead_id ON data_sale_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_status ON data_sale_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_requester_email ON data_sale_requests(requester_email);
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_created_at ON data_sale_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_period ON data_sale_requests(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_data_sale_requests_validation_status ON data_sale_requests(data_validation_status);

-- ============================================
-- TABELA: data_sale_audit_log
-- ============================================
-- Log de auditoria para rastreabilidade e conformidade LGPD
CREATE TABLE IF NOT EXISTS data_sale_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES data_sale_requests(id) ON DELETE CASCADE,
  
  -- Ação realizada
  action TEXT NOT NULL, -- 'created', 'approved', 'paid', 'validated', 'generated', 'delivered', 'downloaded'
  action_by UUID REFERENCES auth.users(id),
  
  -- Detalhes
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sale_audit_log_request_id ON data_sale_audit_log(request_id);
CREATE INDEX IF NOT EXISTS idx_data_sale_audit_log_created_at ON data_sale_audit_log(created_at DESC);

-- ============================================
-- CONFIGURAÇÃO DE PREÇO (via site_settings)
-- ============================================
-- Inserir configuração padrão de preço
INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES (
  'viajar',
  'data_sale_price',
  '{"amount": 300, "currency": "BRL"}'::jsonb,
  'Preço do relatório de dados de turismo (em reais)'
)
ON CONFLICT (platform, setting_key) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE data_sale_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sale_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para data_sale_requests
-- Admins podem ver todas as solicitações
CREATE POLICY "Admins can view all data sale requests"
  ON data_sale_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Admins podem inserir/atualizar solicitações
CREATE POLICY "Admins can manage data sale requests"
  ON data_sale_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Políticas para data_sale_audit_log
-- Admins podem ver todos os logs
CREATE POLICY "Admins can view audit logs"
  ON data_sale_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Sistema pode inserir logs (via SECURITY DEFINER)
CREATE POLICY "System can insert audit logs"
  ON data_sale_audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_data_sale_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_sale_requests_updated_at
  BEFORE UPDATE ON data_sale_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_data_sale_requests_updated_at();

-- Função para registrar ação no audit log
CREATE OR REPLACE FUNCTION log_data_sale_action(
  p_request_id UUID,
  p_action TEXT,
  p_action_by UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO data_sale_audit_log (
    request_id,
    action,
    action_by,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    p_request_id,
    p_action,
    COALESCE(p_action_by, auth.uid()),
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar se há dados suficientes no período
CREATE OR REPLACE FUNCTION validate_data_availability(
  p_period_start DATE,
  p_period_end DATE,
  p_city TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_tourist_surveys_count INTEGER;
  v_user_interactions_count INTEGER;
  v_user_profiles_count INTEGER;
  v_total_count INTEGER;
  v_is_valid BOOLEAN;
BEGIN
  -- Contar registros reais (não mockados) no período
  -- 1. Pesquisas com turistas
  SELECT COUNT(*) INTO v_tourist_surveys_count
  FROM tourist_surveys
  WHERE survey_date >= p_period_start
    AND survey_date <= p_period_end
    AND (p_city IS NULL OR client_slug = LOWER(p_city));
  
  -- 2. Interações de usuários
  SELECT COUNT(*) INTO v_user_interactions_count
  FROM user_interactions
  WHERE created_at >= p_period_start::TIMESTAMPTZ
    AND created_at <= (p_period_end + INTERVAL '1 day')::TIMESTAMPTZ;
  
  -- 3. Perfis de usuários com consentimento
  SELECT COUNT(DISTINCT up.id) INTO v_user_profiles_count
  FROM user_profiles up
  INNER JOIN data_sharing_consents dsc ON dsc.user_id = up.user_id
  WHERE up.created_at >= p_period_start::TIMESTAMPTZ
    AND up.created_at <= (p_period_end + INTERVAL '1 day')::TIMESTAMPTZ
    AND dsc.consent_given = true
    AND dsc.revoked_at IS NULL;
  
  v_total_count := v_tourist_surveys_count + v_user_interactions_count + v_user_profiles_count;
  
  -- Considerar válido se houver pelo menos 10 registros agregados
  v_is_valid := v_total_count >= 10;
  
  v_result := jsonb_build_object(
    'is_valid', v_is_valid,
    'total_records', v_total_count,
    'tourist_surveys_count', v_tourist_surveys_count,
    'user_interactions_count', v_user_interactions_count,
    'user_profiles_count', v_user_profiles_count,
    'period_start', p_period_start,
    'period_end', p_period_end,
    'city', p_city,
    'validation_date', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE data_sale_requests IS 'Solicitações de compra de relatórios de dados de turismo agregados';
COMMENT ON TABLE data_sale_audit_log IS 'Log de auditoria para rastreabilidade de acesso aos dados (conformidade LGPD)';
COMMENT ON COLUMN data_sale_requests.data_validation_status IS 'Status da validação de dados: verifica se há dados reais suficientes no período';
COMMENT ON COLUMN data_sale_requests.data_sources_used IS 'Array de fontes de dados reais usadas no relatório';
COMMENT ON COLUMN data_sale_requests.total_records_count IS 'Total de registros reais agregados (sem mocks/simulações)';
COMMENT ON FUNCTION validate_data_availability IS 'Valida se há dados reais suficientes no período solicitado antes de gerar relatório';


