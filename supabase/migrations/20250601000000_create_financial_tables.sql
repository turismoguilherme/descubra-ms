-- Migration: Create Financial Management Tables
-- Description: Tables for comprehensive financial management (expenses, salaries, revenue tracking)
-- Date: 2025-06-01

-- ============================================
-- EMPLOYEE SALARIES (Histórico de Salários)
-- ============================================
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
-- EXPENSES (Despesas/Contas a Pagar)
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
-- UPDATE VIAJAR_EMPLOYEES (Adicionar campos de salário)
-- ============================================
ALTER TABLE viajar_employees
ADD COLUMN IF NOT EXISTS current_salary DECIMAL(10,2);

ALTER TABLE viajar_employees
ADD COLUMN IF NOT EXISTS salary_updated_at TIMESTAMPTZ;

-- ============================================
-- UPDATE MASTER_FINANCIAL_RECORDS (Adicionar campo source)
-- ============================================
ALTER TABLE master_financial_records
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('viajar_subscription', 'event_sponsor', 'partner', 'other'));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee_id ON employee_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_month_year ON employee_salaries(year, month);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_payment_status ON employee_salaries(payment_status);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(recurring);

CREATE INDEX IF NOT EXISTS idx_master_financial_records_source ON master_financial_records(source);
CREATE INDEX IF NOT EXISTS idx_master_financial_records_record_type ON master_financial_records(record_type);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE TRIGGER update_employee_salaries_updated_at
    BEFORE UPDATE ON employee_salaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can access
CREATE POLICY "Admins can manage employee_salaries"
    ON employee_salaries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage expenses"
    ON expenses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE employee_salaries IS 'Histórico mensal de salários dos funcionários';
COMMENT ON TABLE expenses IS 'Despesas e contas a pagar da plataforma';
COMMENT ON COLUMN viajar_employees.current_salary IS 'Salário atual do funcionário';
COMMENT ON COLUMN master_financial_records.source IS 'Origem da receita: viajar_subscription, event_sponsor, partner, other';

