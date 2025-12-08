-- Migration: Garantir que todas as tabelas necessárias existam
-- Descrição: Cria tabelas que podem estar faltando no banco de dados
-- Data: 2025-02-10

-- ============================================
-- MASTER_FINANCIAL_RECORDS (se não existir)
-- ============================================
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
  source TEXT CHECK (source IN ('viajar_subscription', 'event_sponsor', 'partner', 'other')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna source se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_financial_records' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE master_financial_records 
    ADD COLUMN source TEXT CHECK (source IN ('viajar_subscription', 'event_sponsor', 'partner', 'other'));
  END IF;
END $$;

-- ============================================
-- EXPENSES (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('servidores', 'marketing', 'infraestrutura', 'impostos', 'salarios', 'outros')),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'overdue')),
  paid_date DATE,
  recurring TEXT CHECK (recurring IN ('monthly', 'annual', 'one_time')),
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEE_SALARIES (se não existir)
-- ============================================
-- Primeiro garantir que viajar_employees existe
CREATE TABLE IF NOT EXISTS viajar_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'editor')),
  department TEXT,
  position TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES viajar_employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  base_salary DECIMAL(10,2) NOT NULL,
  bonuses DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================
-- CONTENT_VERSIONS (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('viajar', 'descubra_ms')),
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'html', 'markdown')),
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  edited_by UUID REFERENCES viajar_employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_key, platform, version)
);

-- ============================================
-- FLOWTRIP_CLIENTS (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS flowtrip_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FLOWTRIP_SUBSCRIPTIONS (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS flowtrip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES flowtrip_clients(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_type TEXT DEFAULT 'basic',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  max_users INTEGER DEFAULT 100,
  max_destinations INTEGER DEFAULT 50,
  features JSONB DEFAULT '{}'::jsonb,
  billing_cycle TEXT DEFAULT 'monthly',
  next_billing_date DATE,
  current_period_end DATE,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
  -- Adicionar current_period_end se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flowtrip_subscriptions' 
    AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE flowtrip_subscriptions 
    ADD COLUMN current_period_end DATE;
  END IF;
  
  -- Adicionar cancelled_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flowtrip_subscriptions' 
    AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE flowtrip_subscriptions 
    ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_master_financial_records_type ON master_financial_records(record_type);
CREATE INDEX IF NOT EXISTS idx_master_financial_records_status ON master_financial_records(status);
CREATE INDEX IF NOT EXISTS idx_master_financial_records_source ON master_financial_records(source);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);

CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee_id ON employee_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_month_year ON employee_salaries(year, month);

CREATE INDEX IF NOT EXISTS idx_content_versions_key_platform ON content_versions(content_key, platform);
CREATE INDEX IF NOT EXISTS idx_content_versions_published ON content_versions(is_published);

CREATE INDEX IF NOT EXISTS idx_flowtrip_subscriptions_client_id ON flowtrip_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_flowtrip_subscriptions_status ON flowtrip_subscriptions(status);

-- ============================================
-- TRIGGERS PARA updated_at
-- ============================================
-- Garantir que a função existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers se não existirem
DROP TRIGGER IF EXISTS update_master_financial_records_updated_at ON master_financial_records;
CREATE TRIGGER update_master_financial_records_updated_at
  BEFORE UPDATE ON master_financial_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_salaries_updated_at ON employee_salaries;
CREATE TRIGGER update_employee_salaries_updated_at
  BEFORE UPDATE ON employee_salaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_versions_updated_at ON content_versions;
CREATE TRIGGER update_content_versions_updated_at
  BEFORE UPDATE ON content_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flowtrip_clients_updated_at ON flowtrip_clients;
CREATE TRIGGER update_flowtrip_clients_updated_at
  BEFORE UPDATE ON flowtrip_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flowtrip_subscriptions_updated_at ON flowtrip_subscriptions;
CREATE TRIGGER update_flowtrip_subscriptions_updated_at
  BEFORE UPDATE ON flowtrip_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE master_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowtrip_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowtrip_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser ajustadas conforme necessário)
-- Master Financial Records
DROP POLICY IF EXISTS "Admins can manage master_financial_records" ON master_financial_records;
CREATE POLICY "Admins can manage master_financial_records"
  ON master_financial_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- Expenses
DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
CREATE POLICY "Admins can manage expenses"
  ON expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- Employee Salaries
DROP POLICY IF EXISTS "Admins can manage employee_salaries" ON employee_salaries;
CREATE POLICY "Admins can manage employee_salaries"
  ON employee_salaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- Content Versions
DROP POLICY IF EXISTS "Admins can manage content_versions" ON content_versions;
CREATE POLICY "Admins can manage content_versions"
  ON content_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin', 'editor')
    )
  );

-- Flowtrip Clients
DROP POLICY IF EXISTS "Admins can manage flowtrip_clients" ON flowtrip_clients;
CREATE POLICY "Admins can manage flowtrip_clients"
  ON flowtrip_clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- Flowtrip Subscriptions
DROP POLICY IF EXISTS "Admins can manage flowtrip_subscriptions" ON flowtrip_subscriptions;
CREATE POLICY "Admins can manage flowtrip_subscriptions"
  ON flowtrip_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE master_financial_records IS 'Registros financeiros (receitas, despesas, etc.)';
COMMENT ON TABLE expenses IS 'Despesas e contas a pagar da plataforma';
COMMENT ON TABLE employee_salaries IS 'Histórico mensal de salários dos funcionários';
COMMENT ON TABLE content_versions IS 'Versões de conteúdo editável por plataforma';
COMMENT ON TABLE flowtrip_clients IS 'Clientes do sistema FlowTrip/ViaJAR';
COMMENT ON TABLE flowtrip_subscriptions IS 'Assinaturas dos clientes FlowTrip/ViaJAR';

