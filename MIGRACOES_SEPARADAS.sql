-- ================================================================
-- MIGRACOES SEPARADAS - EXECUTE UMA POR VEZ NO SUPABASE SQL EDITOR
-- ================================================================

-- ===============================
-- PARTE 1: INVENTÁRIO TURÍSTICO
-- ===============================
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    parent_id UUID REFERENCES inventory_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tourism_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES inventory_categories(id),
    subcategory_id UUID REFERENCES inventory_categories(id),

    -- Location data
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    state VARCHAR(2),
    country VARCHAR(2) DEFAULT 'BR',
    postal_code VARCHAR(10),

    -- Contact information
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),

    -- Business information
    opening_hours JSONB, -- {"monday": {"open": "08:00", "close": "18:00"}, ...}
    price_range VARCHAR(20), -- "free", "low", "medium", "high"
    capacity INTEGER,
    amenities JSONB, -- ["wifi", "parking", "accessibility", ...]

    -- Media
    images JSONB, -- ["url1", "url2", ...]
    videos JSONB, -- ["url1", "url2", ...]

    -- SEO and content
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    tags TEXT[], -- ["pantanal", "natureza", "fotografia", ...]

    -- Status and validation
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending, approved, rejected
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    validation_notes TEXT,

    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para inventory_categories
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(is_active);

-- Índices para tourism_inventory
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_category ON tourism_inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_city_state ON tourism_inventory(city, state);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_status ON tourism_inventory(status);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_active ON tourism_inventory(is_active);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_featured ON tourism_inventory(is_featured);

-- RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_inventory ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Categories are viewable by everyone" ON inventory_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories are manageable by admins" ON inventory_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

CREATE POLICY "Inventory is viewable by everyone" ON tourism_inventory
    FOR SELECT USING (is_active = true AND status = 'approved');

CREATE POLICY "Inventory is manageable by admins" ON tourism_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

CREATE POLICY "Users can manage their own inventory" ON tourism_inventory
    FOR ALL USING (created_by = auth.uid());

-- Dados iniciais
INSERT INTO inventory_categories (name, description, icon, color, sort_order) VALUES
('Atrativos Naturais', 'Parques, cachoeiras, rios, montanhas e outros atrativos naturais', 'tree-pine', '#10B981', 1),
('Atrativos Culturais', 'Museus, centros culturais, igrejas, monumentos históricos', 'building-2', '#8B5CF6', 2),
('Gastronomia', 'Restaurantes, bares, cafés, food trucks e experiências gastronômicas', 'utensils', '#F59E0B', 3),
('Hospedagem', 'Hotéis, pousadas, hostels, camping e outras opções de hospedagem', 'bed', '#3B82F6', 4),
('Eventos', 'Festivais, shows, feiras, congressos e eventos especiais', 'calendar', '#EF4444', 5),
('Serviços', 'Agências de turismo, guias, transporte e outros serviços turísticos', 'briefcase', '#6B7280', 6),
('Comércio', 'Lojas, mercados, artesanato e produtos locais', 'shopping-bag', '#84CC16', 7),
('Entretenimento', 'Parques de diversão, cinemas, teatros e lazer', 'gamepad-2', '#EC4899', 8)
ON CONFLICT (name) DO NOTHING;

-- ===============================
-- PARTE 2: MENUS DINÂMICOS
-- ===============================
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

-- Índices e RLS para dynamic_menus
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

-- ===============================
-- PARTE 3: PRODUTOS VIAJAR
-- ===============================
CREATE TABLE IF NOT EXISTS viajar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informações Básicas (Marketing)
  title TEXT NOT NULL,
  short_description TEXT,                  -- Descrição curta e marketing
  full_description TEXT,                   -- Descrição completa (opcional)

  -- Mídia (IMPORTANTE!)
  image_url TEXT,                          -- URL da imagem principal
  video_url TEXT,                          -- URL do vídeo (YouTube) - OPCIONAL
  icon_name TEXT,                          -- Nome do ícone Lucide (ex: "Brain")
  gradient_colors TEXT,                    -- Cores do gradiente (ex: "from-purple-500 to-violet-600")

  -- Ordenação e Status
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Links e CTAs
  cta_text TEXT DEFAULT 'Saiba mais',     -- Texto do botão
  cta_link TEXT,                          -- Link (ex: "/solucoes/guata-ia")

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices e RLS para viajar_products
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

-- Trigger para viajar_products
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

-- ===============================
-- PARTE 4: SISTEMA DE CHECK-INS
-- ===============================
CREATE TABLE IF NOT EXISTS attendant_allowed_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  allowed_radius INTEGER NOT NULL DEFAULT 100, -- metros
  working_hours JSONB NOT NULL DEFAULT '{"start": "08:00", "end": "18:00"}',
  city_id UUID REFERENCES cities(id),
  client_slug VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS attendant_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),

  location_id UUID REFERENCES attendant_allowed_locations(id),

  -- Dados de entrada
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER, -- precisão GPS em metros
  checkin_time TIMESTAMPTZ DEFAULT NOW(),

  -- Dados de saída
  checkout_time TIMESTAMPTZ,
  checkout_latitude DECIMAL(10, 8),
  checkout_longitude DECIMAL(11, 8),

  -- Validação
  is_valid BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,

  -- Metadados
  client_slug VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendant_location_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),
  location_id UUID NOT NULL REFERENCES attendant_allowed_locations(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,

  UNIQUE(attendant_id, location_id)
);

-- Índices para attendant tables
CREATE INDEX IF NOT EXISTS idx_attendant_allowed_locations_city ON attendant_allowed_locations(city_id);
CREATE INDEX IF NOT EXISTS idx_attendant_allowed_locations_client ON attendant_allowed_locations(client_slug);
CREATE INDEX IF NOT EXISTS idx_attendant_allowed_locations_active ON attendant_allowed_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_attendant ON attendant_checkins(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_location ON attendant_checkins(location_id);
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_client ON attendant_checkins(client_slug);
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_valid ON attendant_checkins(is_valid);
CREATE INDEX IF NOT EXISTS idx_attendant_assignments_attendant ON attendant_location_assignments(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendant_assignments_location ON attendant_location_assignments(location_id);
CREATE INDEX IF NOT EXISTS idx_attendant_assignments_active ON attendant_location_assignments(is_active);

-- RLS para attendant tables
ALTER TABLE attendant_allowed_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendant_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendant_location_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para attendant_allowed_locations
CREATE POLICY "Gestores municipais podem gerenciar locais da sua cidade" ON attendant_allowed_locations
  FOR ALL USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    city_id = (auth.jwt() ->> 'city_id')::UUID
  );

CREATE POLICY "Gestores IGR podem ver locais da sua região" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'gestor_igr' AND
    city_id IN (
      SELECT c.id FROM cities c
      WHERE c.region_id = (auth.jwt() ->> 'region_id')::UUID
    )
  );

CREATE POLICY "Diretores estaduais podem ver todos os locais do cliente" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'diretor_estadual' AND
    client_slug = auth.jwt() ->> 'client_slug'
  );

CREATE POLICY "Atendentes podem ver seus locais autorizados" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'atendente' AND
    id IN (
      SELECT location_id FROM attendant_location_assignments
      WHERE attendant_id = auth.uid() AND is_active = true
    )
  );

-- Políticas para attendant_checkins
CREATE POLICY "Atendentes podem gerenciar seus próprios check-ins" ON attendant_checkins
  FOR ALL USING (attendant_id = auth.uid());

CREATE POLICY "Gestores municipais podem ver check-ins dos atendentes da sua cidade" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    attendant_id IN (
      SELECT id FROM user_profiles
      WHERE city_id = (auth.jwt() ->> 'city_id')::UUID
      AND user_role = 'atendente'
    )
  );

CREATE POLICY "Gestores IGR podem ver check-ins da sua região" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'gestor_igr' AND
    attendant_id IN (
      SELECT up.id FROM user_profiles up
      JOIN cities c ON up.city_id = c.id
      WHERE c.region_id = (auth.jwt() ->> 'region_id')::UUID
      AND up.user_role = 'atendente'
    )
  );

CREATE POLICY "Diretores estaduais podem ver todos os check-ins do cliente" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'diretor_estadual' AND
    client_slug = auth.jwt() ->> 'client_slug'
  );

-- Políticas para attendant_location_assignments
CREATE POLICY "Gestores municipais podem gerenciar assignments da sua cidade" ON attendant_location_assignments
  FOR ALL USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    location_id IN (
      SELECT id FROM attendant_allowed_locations
      WHERE city_id = (auth.jwt() ->> 'city_id')::UUID
    )
  );

CREATE POLICY "Atendentes podem ver seus próprios assignments" ON attendant_location_assignments
  FOR SELECT USING (attendant_id = auth.uid());

-- ===============================
-- SUCESSO
-- ===============================
SELECT '✅ MIGRACOES SEPARADAS EXECUTADAS COM SUCESSO!' as resultado,
       'Execute uma parte por vez no SQL Editor do Supabase' as instrucao,
       NOW() as timestamp_aplicacao;
