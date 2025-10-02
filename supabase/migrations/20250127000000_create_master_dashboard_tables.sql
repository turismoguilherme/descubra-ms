-- Migração para criar tabelas do Master Dashboard da OverFlow One
-- Data: 2025-01-27

-- Tabela principal de clientes (estados)
CREATE TABLE IF NOT EXISTS master_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  hubspot_contact_id TEXT,
  client_name TEXT NOT NULL,
  state_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT,
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'active', 'overdue', 'cancelled', 'suspended')),
  subscription_plan TEXT DEFAULT 'basic',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  contract_start_date DATE,
  contract_end_date DATE,
  auto_renewal BOOLEAN DEFAULT true,
  deal_stage TEXT DEFAULT 'new',
  deal_amount DECIMAL(10,2) DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de deals/negociações
CREATE TABLE IF NOT EXISTS master_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_deal_id TEXT UNIQUE,
  hubspot_contact_id TEXT,
  deal_name TEXT NOT NULL,
  deal_stage TEXT DEFAULT 'new',
  deal_amount DECIMAL(10,2) DEFAULT 0,
  close_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  source TEXT DEFAULT 'website',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (hubspot_contact_id) REFERENCES master_clients(hubspot_contact_id) ON DELETE SET NULL
);

-- Tabela de registros financeiros
CREATE TABLE IF NOT EXISTS master_financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_type TEXT NOT NULL CHECK (record_type IN ('revenue', 'expense', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  paid_date DATE,
  due_date DATE,
  currency TEXT DEFAULT 'BRL',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (stripe_subscription_id) REFERENCES master_clients(stripe_subscription_id) ON DELETE SET NULL
);

-- Tabela de tickets de suporte
CREATE TABLE IF NOT EXISTS master_support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT DEFAULT 'general',
  assigned_to TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (client_id) REFERENCES master_clients(id) ON DELETE CASCADE
);

-- Tabela de métricas do sistema
CREATE TABLE IF NOT EXISTS master_system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit TEXT,
  category TEXT DEFAULT 'general',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS master_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações da plataforma
CREATE TABLE IF NOT EXISTS master_platform_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  config_type TEXT DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de feedback da IA
CREATE TABLE IF NOT EXISTS master_ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'comment')),
  context_type TEXT DEFAULT 'general',
  context_data JSONB,
  user_comment TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_master_clients_status ON master_clients(status);
CREATE INDEX IF NOT EXISTS idx_master_clients_stripe_subscription ON master_clients(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_master_clients_hubspot_contact ON master_clients(hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_master_clients_state_name ON master_clients(state_name);

CREATE INDEX IF NOT EXISTS idx_master_deals_stage ON master_deals(deal_stage);
CREATE INDEX IF NOT EXISTS idx_master_deals_hubspot_deal ON master_deals(hubspot_deal_id);
CREATE INDEX IF NOT EXISTS idx_master_deals_status ON master_deals(status);

CREATE INDEX IF NOT EXISTS idx_master_financial_records_type ON master_financial_records(record_type);
CREATE INDEX IF NOT EXISTS idx_master_financial_records_status ON master_financial_records(status);
CREATE INDEX IF NOT EXISTS idx_master_financial_records_stripe ON master_financial_records(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_master_support_tickets_client ON master_support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_master_support_tickets_status ON master_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_master_support_tickets_priority ON master_support_tickets(priority);

CREATE INDEX IF NOT EXISTS idx_master_system_metrics_name ON master_system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_master_system_metrics_category ON master_system_metrics(category);
CREATE INDEX IF NOT EXISTS idx_master_system_metrics_recorded_at ON master_system_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_master_activity_logs_user ON master_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_master_activity_logs_action ON master_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_master_activity_logs_created_at ON master_activity_logs(created_at);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_master_clients_updated_at 
  BEFORE UPDATE ON master_clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_deals_updated_at 
  BEFORE UPDATE ON master_deals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_financial_records_updated_at 
  BEFORE UPDATE ON master_financial_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_support_tickets_updated_at 
  BEFORE UPDATE ON master_support_tickets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_platform_config_updated_at 
  BEFORE UPDATE ON master_platform_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão da plataforma
INSERT INTO master_platform_config (config_key, config_value, config_type, description, is_public) VALUES
('platform_name', 'OverFlow One', 'string', 'Nome da plataforma', true),
('platform_version', '1.0.0', 'string', 'Versão atual da plataforma', true),
('support_email', 'suporte@overflowone.com', 'string', 'Email de suporte', true),
('support_phone', '+55 11 99999-9999', 'string', 'Telefone de suporte', true),
('stripe_enabled', 'true', 'boolean', 'Se o Stripe está habilitado', false),
('hubspot_enabled', 'true', 'boolean', 'Se o HubSpot está habilitado', false),
('ai_enabled', 'true', 'boolean', 'Se a IA está habilitada', false),
('maintenance_mode', 'false', 'boolean', 'Se a plataforma está em modo de manutenção', true),
('max_clients', '100', 'number', 'Número máximo de clientes', false),
('default_monthly_fee', '2500', 'number', 'Taxa mensal padrão em centavos', false)
ON CONFLICT (config_key) DO NOTHING;

-- Inserir métricas iniciais do sistema
INSERT INTO master_system_metrics (metric_name, metric_value, metric_unit, category) VALUES
('system_uptime', 99.9, 'percent', 'performance'),
('active_users', 0, 'count', 'usage'),
('total_revenue', 0, 'BRL', 'financial'),
('support_tickets_open', 0, 'count', 'support'),
('ai_requests_today', 0, 'count', 'ai'),
('database_size', 0, 'MB', 'infrastructure')
ON CONFLICT DO NOTHING;

-- Comentários das tabelas
COMMENT ON TABLE master_clients IS 'Tabela principal de clientes (estados) da OverFlow One';
COMMENT ON TABLE master_deals IS 'Tabela de deals/negociações com clientes';
COMMENT ON TABLE master_financial_records IS 'Tabela de registros financeiros (receitas, despesas, etc.)';
COMMENT ON TABLE master_support_tickets IS 'Tabela de tickets de suporte dos clientes';
COMMENT ON TABLE master_system_metrics IS 'Tabela de métricas e KPIs do sistema';
COMMENT ON TABLE master_activity_logs IS 'Tabela de logs de atividades dos usuários';
COMMENT ON TABLE master_platform_config IS 'Tabela de configurações da plataforma';
COMMENT ON TABLE master_ai_feedback IS 'Tabela de feedback sobre respostas da IA';

-- RLS (Row Level Security) - Apenas usuários master podem acessar
ALTER TABLE master_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_ai_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (em produção, implementar com autenticação adequada)
CREATE POLICY "Master users can manage all data" ON master_clients FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_deals FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_financial_records FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_support_tickets FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_system_metrics FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_activity_logs FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_platform_config FOR ALL USING (true);
CREATE POLICY "Master users can manage all data" ON master_ai_feedback FOR ALL USING (true);







