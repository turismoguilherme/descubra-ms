-- ================================================================
-- MIGRACOES SEPARADAS - EXECUTE UMA POR VEZ NO SUPABASE SQL EDITOR
-- ================================================================

-- ===============================
-- PARTE 1: INVENTÁRIO TURÍSTICO
-- ===============================
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
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
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON inventory_categories;
CREATE POLICY "Categories are viewable by everyone" ON inventory_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Categories are manageable by admins" ON inventory_categories;
CREATE POLICY "Categories are manageable by admins" ON inventory_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

DROP POLICY IF EXISTS "Inventory is viewable by everyone" ON tourism_inventory;
CREATE POLICY "Inventory is viewable by everyone" ON tourism_inventory
    FOR SELECT USING (is_active = true AND status = 'approved');

DROP POLICY IF EXISTS "Inventory is manageable by admins" ON tourism_inventory;
CREATE POLICY "Inventory is manageable by admins" ON tourism_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS completamente para permitir testes
ALTER TABLE tourism_inventory DISABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Admins can manage dynamic_menus" ON dynamic_menus;
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

DROP POLICY IF EXISTS "Anyone can view active products" ON viajar_products;
CREATE POLICY "Anyone can view active products"
  ON viajar_products
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all products" ON viajar_products;
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

DROP POLICY IF EXISTS "Admins can insert products" ON viajar_products;
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

DROP POLICY IF EXISTS "Admins can update products" ON viajar_products;
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

DROP POLICY IF EXISTS "Admins can delete products" ON viajar_products;
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

DROP TRIGGER IF EXISTS set_viajar_products_updated_at ON viajar_products;
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
DROP POLICY IF EXISTS "Gestores municipais podem gerenciar locais da sua cidade" ON attendant_allowed_locations;
CREATE POLICY "Gestores municipais podem gerenciar locais da sua cidade" ON attendant_allowed_locations
  FOR ALL USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    city_id = (auth.jwt() ->> 'city_id')::UUID
  );

DROP POLICY IF EXISTS "Gestores IGR podem ver locais da sua região" ON attendant_allowed_locations;
CREATE POLICY "Gestores IGR podem ver locais da sua região" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'gestor_igr' AND
    city_id IN (
      SELECT c.id FROM cities c
      WHERE c.region_id = (auth.jwt() ->> 'region_id')::UUID
    )
  );

DROP POLICY IF EXISTS "Diretores estaduais podem ver todos os locais do cliente" ON attendant_allowed_locations;
CREATE POLICY "Diretores estaduais podem ver todos os locais do cliente" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'diretor_estadual' AND
    client_slug = auth.jwt() ->> 'client_slug'
  );

DROP POLICY IF EXISTS "Atendentes podem ver seus locais autorizados" ON attendant_allowed_locations;
CREATE POLICY "Atendentes podem ver seus locais autorizados" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'atendente' AND
    id IN (
      SELECT location_id FROM attendant_location_assignments
      WHERE attendant_id = auth.uid() AND is_active = true
    )
  );

-- Políticas para attendant_checkins
DROP POLICY IF EXISTS "Atendentes podem gerenciar seus próprios check-ins" ON attendant_checkins;
CREATE POLICY "Atendentes podem gerenciar seus próprios check-ins" ON attendant_checkins
  FOR ALL USING (attendant_id = auth.uid());

DROP POLICY IF EXISTS "Gestores municipais podem ver check-ins dos atendentes da sua cidade" ON attendant_checkins;
CREATE POLICY "Gestores municipais podem ver check-ins dos atendentes da sua cidade" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    attendant_id IN (
      SELECT id FROM user_profiles
      WHERE city_id = (auth.jwt() ->> 'city_id')::UUID
      AND user_role = 'atendente'
    )
  );

DROP POLICY IF EXISTS "Gestores IGR podem ver check-ins da sua região" ON attendant_checkins;
CREATE POLICY "Gestores IGR podem ver check-ins da sua região" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'gestor_igr' AND
    attendant_id IN (
      SELECT up.id FROM user_profiles up
      JOIN cities c ON up.city = c.id
      WHERE c.region_id = (auth.jwt() ->> 'region_id')::UUID
      AND up.user_role = 'atendente'
    )
  );

DROP POLICY IF EXISTS "Diretores estaduais podem ver todos os check-ins do cliente" ON attendant_checkins;
CREATE POLICY "Diretores estaduais podem ver todos os check-ins do cliente" ON attendant_checkins
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'diretor_estadual' AND
    client_slug = auth.jwt() ->> 'client_slug'
  );

-- Políticas para attendant_location_assignments
DROP POLICY IF EXISTS "Gestores municipais podem gerenciar assignments da sua cidade" ON attendant_location_assignments;
CREATE POLICY "Gestores municipais podem gerenciar assignments da sua cidade" ON attendant_location_assignments
  FOR ALL USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    location_id IN (
      SELECT id FROM attendant_allowed_locations
      WHERE city_id = (auth.jwt() ->> 'city_id')::UUID
    )
  );

DROP POLICY IF EXISTS "Atendentes podem ver seus próprios assignments" ON attendant_location_assignments;
CREATE POLICY "Atendentes podem ver seus próprios assignments" ON attendant_location_assignments
  FOR SELECT USING (attendant_id = auth.uid());

-- ===============================
-- PARTE 5: CAMPOS SETUR (EXECUTE APÓS AS OUTRAS PARTES)
-- ===============================
-- Migration: Add SeTur (Sistema de Estatísticas de Turismo) fields
-- Description: Adiciona campos obrigatórios do padrão SeTur para conformidade nacional
-- Date: 2025-02-01

-- Adicionar campos SeTur na tabela tourism_inventory
DO $$
BEGIN
  -- Código SeTur único (formato: SETUR-{UF}-{CAT}-{SEQ})
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_code'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_code VARCHAR(50) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_tourism_inventory_setur_code ON tourism_inventory(setur_code);
    COMMENT ON COLUMN tourism_inventory.setur_code IS 'Código único SeTur no formato SETUR-{UF}-{CAT}-{SEQ}';
  END IF;

  -- Código da categoria SeTur
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_category_code'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_category_code VARCHAR(10);
    COMMENT ON COLUMN tourism_inventory.setur_category_code IS 'Código da categoria conforme padrão SeTur';
  END IF;

  -- Razão social (para empresas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'legal_name'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN legal_name VARCHAR(200);
    COMMENT ON COLUMN tourism_inventory.legal_name IS 'Razão social ou nome legal do estabelecimento';
  END IF;

  -- Número de registro (CNPJ/CPF)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN registration_number VARCHAR(50);
    CREATE INDEX IF NOT EXISTS idx_tourism_inventory_registration ON tourism_inventory(registration_number);
    COMMENT ON COLUMN tourism_inventory.registration_number IS 'CNPJ ou CPF do estabelecimento';
  END IF;

  -- Número de licença/alvará
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'license_number'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN license_number VARCHAR(50);
    COMMENT ON COLUMN tourism_inventory.license_number IS 'Número de licença ou alvará de funcionamento';
  END IF;

  -- Data de validade da licença
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'license_expiry_date'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN license_expiry_date DATE;
    COMMENT ON COLUMN tourism_inventory.license_expiry_date IS 'Data de validade da licença ou alvará';
  END IF;

  -- Nome do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_name'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_name VARCHAR(200);
    COMMENT ON COLUMN tourism_inventory.responsible_name IS 'Nome do responsável legal pelo estabelecimento';
  END IF;

  -- CPF do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_cpf'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_cpf VARCHAR(14);
    COMMENT ON COLUMN tourism_inventory.responsible_cpf IS 'CPF do responsável legal';
  END IF;

  -- Email do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_email'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_email VARCHAR(100);
    COMMENT ON COLUMN tourism_inventory.responsible_email IS 'Email do responsável legal';
  END IF;

  -- Telefone do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_phone'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_phone VARCHAR(20);
    COMMENT ON COLUMN tourism_inventory.responsible_phone IS 'Telefone do responsável legal';
  END IF;

  -- Recursos de acessibilidade detalhados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'accessibility_features'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN accessibility_features JSONB;
    COMMENT ON COLUMN tourism_inventory.accessibility_features IS 'Recursos de acessibilidade detalhados (rampa, banheiro adaptado, etc)';
  END IF;

  -- Detalhes de capacidade por tipo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'capacity_details'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN capacity_details JSONB;
    COMMENT ON COLUMN tourism_inventory.capacity_details IS 'Detalhes de capacidade por tipo (ex: quartos, mesas, lugares)';
  END IF;

  -- Formas de pagamento aceitas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'payment_methods'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN payment_methods JSONB;
    COMMENT ON COLUMN tourism_inventory.payment_methods IS 'Formas de pagamento aceitas (dinheiro, cartão, pix, etc)';
  END IF;

  -- Idiomas falados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'languages_spoken'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN languages_spoken TEXT[];
    COMMENT ON COLUMN tourism_inventory.languages_spoken IS 'Idiomas falados pelos atendentes';
  END IF;

  -- Certificações
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN certifications JSONB;
    COMMENT ON COLUMN tourism_inventory.certifications IS 'Certificações (ISO, selos de qualidade, etc)';
  END IF;

  -- Última data de verificação
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'last_verified_date'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN last_verified_date DATE;
    COMMENT ON COLUMN tourism_inventory.last_verified_date IS 'Última data em que os dados foram verificados';
  END IF;

  -- Status da verificação
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';
    COMMENT ON COLUMN tourism_inventory.verification_status IS 'Status da verificação: pending, verified, expired, needs_update';
  END IF;

  -- Score de completude dos dados (0-100)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'data_completeness_score'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN data_completeness_score INTEGER DEFAULT 0;
    COMMENT ON COLUMN tourism_inventory.data_completeness_score IS 'Score de completude dos dados (0-100)';
  END IF;

  -- Score de conformidade SeTur (0-100)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_compliance_score'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_compliance_score INTEGER DEFAULT 0;
    COMMENT ON COLUMN tourism_inventory.setur_compliance_score IS 'Score de conformidade com padrão SeTur (0-100)';
  END IF;
END $$;

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_verification_status ON tourism_inventory(verification_status);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_completeness_score ON tourism_inventory(data_completeness_score);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_compliance_score ON tourism_inventory(setur_compliance_score);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_last_verified ON tourism_inventory(last_verified_date);

-- Comentários na tabela
COMMENT ON TABLE tourism_inventory IS 'Inventário turístico conforme padrão SeTur (Sistema de Estatísticas de Turismo)';

-- ===============================
-- PARTE 6: CAMPOS USER PROFILES (EXECUTE APÓS AS OUTRAS PARTES)
-- ===============================
-- Migration: Add city_id column to user_profiles
-- Description: Adiciona coluna city_id obrigatória para políticas RLS
-- Date: 2025-02-20

DO $$
BEGIN
  -- Adicionar coluna city_id na tabela user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;

    COMMENT ON COLUMN public.user_profiles.city_id IS 'ID da cidade do usuário (obrigatório para cálculos de IA)';

    -- Criar índice para performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_city_id
    ON public.user_profiles(city_id);
  END IF;

  -- Adicionar coluna region_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'region_id'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL;

    COMMENT ON COLUMN public.user_profiles.region_id IS 'ID da região do usuário';

    -- Criar índice para performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_region_id
    ON public.user_profiles(region_id);
  END IF;

  -- Adicionar coluna user_role se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN user_role TEXT DEFAULT 'user';

    COMMENT ON COLUMN public.user_profiles.user_role IS 'Papel do usuário no sistema';

    -- Criar índice para performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role
    ON public.user_profiles(user_role);
  END IF;

  -- Adicionar coluna client_slug se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'client_slug'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN client_slug TEXT DEFAULT 'descubra_ms';

    COMMENT ON COLUMN public.user_profiles.client_slug IS 'Slug do cliente (descubra_ms, viajar, etc)';

    -- Criar índice para performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_client_slug
    ON public.user_profiles(client_slug);
  END IF;
END $$;

-- ===============================
-- SUCESSO
-- ===============================
SELECT '✅ MIGRACOES SEPARADAS EXECUTADAS COM SUCESSO!' as resultado,
       'Execute uma parte por vez no SQL Editor do Supabase' as instrucao,
       NOW() as timestamp_aplicacao;
