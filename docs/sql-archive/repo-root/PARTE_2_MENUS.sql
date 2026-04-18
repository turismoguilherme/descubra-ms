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

CREATE INDEX IF NOT EXISTS idx_dynamic_menus_platform ON dynamic_menus(platform);
CREATE INDEX IF NOT EXISTS idx_dynamic_menus_type ON dynamic_menus(menu_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_menus_active ON dynamic_menus(is_active);

ALTER TABLE dynamic_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage dynamic_menus"
    ON dynamic_menus FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );
