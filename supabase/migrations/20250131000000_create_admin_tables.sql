-- Migration: Create Admin Panel Tables
-- Description: Tables for ViaJAR administrative area

-- ============================================
-- VIAJAR EMPLOYEES
-- ============================================
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

-- ============================================
-- CONTENT VERSIONS
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
-- DYNAMIC MENUS
-- ============================================
CREATE TABLE IF NOT EXISTS dynamic_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('viajar', 'descubra_ms')),
  menu_type TEXT NOT NULL CHECK (menu_type IN ('main', 'footer', 'sidebar')),
  label TEXT NOT NULL,
  path TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  roles TEXT[],
  parent_id UUID REFERENCES dynamic_menus(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SYSTEM FALLBACK CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS system_fallback_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('viajar', 'descubra_ms')),
  fallback_enabled BOOLEAN DEFAULT true,
  fallback_mode TEXT CHECK (fallback_mode IN ('maintenance', 'readonly', 'redirect')),
  maintenance_message TEXT,
  redirect_url TEXT,
  last_check TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform)
);

-- ============================================
-- PAYMENT RECONCILIATION
-- ============================================
CREATE TABLE IF NOT EXISTS payment_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES flowtrip_subscriptions(id) ON DELETE SET NULL,
  stripe_payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_date DATE,
  reconciled BOOLEAN DEFAULT false,
  reconciled_by UUID REFERENCES viajar_employees(id) ON DELETE SET NULL,
  reconciled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI ADMIN ACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN ('monitor', 'analyze', 'suggest', 'execute')),
  platform TEXT CHECK (platform IN ('viajar', 'descubra_ms', 'both')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES viajar_employees(id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_viajar_employees_user_id ON viajar_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_viajar_employees_email ON viajar_employees(email);
CREATE INDEX IF NOT EXISTS idx_viajar_employees_role ON viajar_employees(role);
CREATE INDEX IF NOT EXISTS idx_viajar_employees_is_active ON viajar_employees(is_active);

CREATE INDEX IF NOT EXISTS idx_content_versions_key_platform ON content_versions(content_key, platform);
CREATE INDEX IF NOT EXISTS idx_content_versions_published ON content_versions(is_published);

CREATE INDEX IF NOT EXISTS idx_dynamic_menus_platform ON dynamic_menus(platform);
CREATE INDEX IF NOT EXISTS idx_dynamic_menus_type ON dynamic_menus(menu_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_menus_active ON dynamic_menus(is_active);

CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_subscription ON payment_reconciliation(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_status ON payment_reconciliation(status);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_reconciled ON payment_reconciliation(reconciled);

CREATE INDEX IF NOT EXISTS idx_ai_admin_actions_status ON ai_admin_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_admin_actions_type ON ai_admin_actions(action_type);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_viajar_employees_updated_at
    BEFORE UPDATE ON viajar_employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_versions_updated_at
    BEFORE UPDATE ON content_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dynamic_menus_updated_at
    BEFORE UPDATE ON dynamic_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_fallback_config_updated_at
    BEFORE UPDATE ON system_fallback_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reconciliation_updated_at
    BEFORE UPDATE ON payment_reconciliation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_admin_actions_updated_at
    BEFORE UPDATE ON ai_admin_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE viajar_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_fallback_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_admin_actions ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can access
CREATE POLICY "Admins can manage viajar_employees"
    ON viajar_employees FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage content_versions"
    ON content_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage dynamic_menus"
    ON dynamic_menus FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage system_fallback_config"
    ON system_fallback_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage payment_reconciliation"
    ON payment_reconciliation FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

CREATE POLICY "Admins can manage ai_admin_actions"
    ON ai_admin_actions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default fallback configs
INSERT INTO system_fallback_config (platform, fallback_enabled, status)
VALUES 
    ('viajar', true, 'healthy'),
    ('descubra_ms', true, 'healthy')
ON CONFLICT (platform) DO NOTHING;

