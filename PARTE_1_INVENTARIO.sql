CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
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
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    state VARCHAR(2),
    country VARCHAR(2) DEFAULT 'BR',
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    opening_hours JSONB,
    price_range VARCHAR(20),
    capacity INTEGER,
    amenities JSONB,
    images JSONB,
    videos JSONB,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    validation_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_category ON tourism_inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_city_state ON tourism_inventory(city, state);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_status ON tourism_inventory(status);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_active ON tourism_inventory(is_active);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_featured ON tourism_inventory(is_featured);

ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_inventory ENABLE ROW LEVEL SECURITY;

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
