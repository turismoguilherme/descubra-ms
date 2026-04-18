CREATE TABLE IF NOT EXISTS viajar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  image_url TEXT,
  video_url TEXT,
  icon_name TEXT,
  gradient_colors TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  cta_text TEXT DEFAULT 'Saiba mais',
  cta_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viajar_products_display_order ON viajar_products(display_order);
CREATE INDEX IF NOT EXISTS idx_viajar_products_is_active ON viajar_products(is_active);

ALTER TABLE viajar_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON viajar_products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all products"
  ON viajar_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert products"
  ON viajar_products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can update products"
  ON viajar_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can delete products"
  ON viajar_products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE OR REPLACE FUNCTION update_viajar_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_viajar_products_updated_at
  BEFORE UPDATE ON viajar_products
  FOR EACH ROW
  EXECUTE FUNCTION update_viajar_products_updated_at();
