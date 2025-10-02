-- Criar tabela de parceiros comerciais
CREATE TABLE IF NOT EXISTS commercial_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  website VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  services TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  subscription_plan VARCHAR(20) NOT NULL CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS commercial_subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL,
  max_products INTEGER,
  max_analytics_days INTEGER,
  support_level VARCHAR(20) NOT NULL CHECK (support_level IN ('email', 'priority', 'dedicated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de métricas dos parceiros
CREATE TABLE IF NOT EXISTS commercial_partner_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES commercial_partners(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, date)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_commercial_partners_status ON commercial_partners(status);
CREATE INDEX IF NOT EXISTS idx_commercial_partners_business_type ON commercial_partners(business_type);
CREATE INDEX IF NOT EXISTS idx_commercial_partners_city ON commercial_partners(city);
CREATE INDEX IF NOT EXISTS idx_commercial_partners_created_at ON commercial_partners(created_at);
CREATE INDEX IF NOT EXISTS idx_commercial_partner_metrics_partner_id ON commercial_partner_metrics(partner_id);
CREATE INDEX IF NOT EXISTS idx_commercial_partner_metrics_date ON commercial_partner_metrics(date);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commercial_partners_updated_at 
  BEFORE UPDATE ON commercial_partners 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commercial_subscription_plans_updated_at 
  BEFORE UPDATE ON commercial_subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão
INSERT INTO commercial_subscription_plans (name, price, features, max_products, max_analytics_days, support_level) VALUES
('basic', 99.00, '{"products_limit": 5, "analytics_basic": true, "email_support": true}', 5, 30, 'email'),
('premium', 299.00, '{"products_limit": 20, "analytics_advanced": true, "priority_support": true, "api_access": true}', 20, 90, 'priority'),
('enterprise', 999.00, '{"products_unlimited": true, "analytics_custom": true, "dedicated_support": true, "api_full_access": true, "white_label": true}', NULL, 365, 'dedicated')
ON CONFLICT (name) DO NOTHING;

-- Configurar RLS (Row Level Security)
ALTER TABLE commercial_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_partner_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para commercial_partners
CREATE POLICY "Parceiros comerciais são visíveis para todos" ON commercial_partners
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir parceiros" ON commercial_partners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Parceiros podem atualizar seus próprios dados" ON commercial_partners
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas RLS para commercial_subscription_plans
CREATE POLICY "Planos são visíveis para todos" ON commercial_subscription_plans
  FOR SELECT USING (true);

-- Políticas RLS para commercial_partner_metrics
CREATE POLICY "Métricas são visíveis para o parceiro proprietário" ON commercial_partner_metrics
  FOR SELECT USING (auth.uid()::text = partner_id::text);

CREATE POLICY "Métricas podem ser inseridas pelo sistema" ON commercial_partner_metrics
  FOR INSERT WITH CHECK (true);

-- Comentários nas tabelas
COMMENT ON TABLE commercial_partners IS 'Parceiros comerciais da plataforma OverFlow One';
COMMENT ON TABLE commercial_subscription_plans IS 'Planos de assinatura para parceiros comerciais';
COMMENT ON TABLE commercial_partner_metrics IS 'Métricas de performance dos parceiros comerciais';
