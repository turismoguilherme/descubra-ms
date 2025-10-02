-- Migration: Create Tourism Inventory Tables
-- Description: Tables for tourism inventory management system

-- Create inventory categories table
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

-- Create tourism inventory table
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

-- Create inventory reviews table
CREATE TABLE IF NOT EXISTS inventory_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES tourism_inventory(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory analytics table
CREATE TABLE IF NOT EXISTS inventory_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES tourism_inventory(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- view, click, favorite, share, etc.
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_tourism_inventory_category ON tourism_inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_city_state ON tourism_inventory(city, state);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_status ON tourism_inventory(status);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_active ON tourism_inventory(is_active);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_featured ON tourism_inventory(is_featured);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_location ON tourism_inventory USING GIST (ll_to_earth(latitude, longitude));

CREATE INDEX IF NOT EXISTS idx_inventory_reviews_inventory ON inventory_reviews(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reviews_user ON inventory_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reviews_approved ON inventory_reviews(is_approved);

CREATE INDEX IF NOT EXISTS idx_inventory_analytics_inventory ON inventory_analytics(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_event_type ON inventory_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_created_at ON inventory_analytics(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_categories
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

-- Create RLS policies for tourism_inventory
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

-- Create RLS policies for inventory_reviews
CREATE POLICY "Reviews are viewable by everyone" ON inventory_reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create their own reviews" ON inventory_reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON inventory_reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON inventory_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

-- Create RLS policies for inventory_analytics
CREATE POLICY "Analytics are viewable by admins" ON inventory_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'tech', 'diretor_estadual')
        )
    );

CREATE POLICY "Analytics can be inserted by anyone" ON inventory_analytics
    FOR INSERT WITH CHECK (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at 
    BEFORE UPDATE ON inventory_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourism_inventory_updated_at 
    BEFORE UPDATE ON tourism_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_reviews_updated_at 
    BEFORE UPDATE ON inventory_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO inventory_categories (name, description, icon, color, sort_order) VALUES
('Atrativos Naturais', 'Parques, cachoeiras, rios, montanhas e outros atrativos naturais', 'tree-pine', '#10B981', 1),
('Atrativos Culturais', 'Museus, centros culturais, igrejas, monumentos históricos', 'building-2', '#8B5CF6', 2),
('Gastronomia', 'Restaurantes, bares, cafés, food trucks e experiências gastronômicas', 'utensils', '#F59E0B', 3),
('Hospedagem', 'Hotéis, pousadas, hostels, camping e outras opções de hospedagem', 'bed', '#3B82F6', 4),
('Eventos', 'Festivais, shows, feiras, congressos e eventos especiais', 'calendar', '#EF4444', 5),
('Serviços', 'Agências de turismo, guias, transporte e outros serviços turísticos', 'briefcase', '#6B7280', 6),
('Comércio', 'Lojas, mercados, artesanato e produtos locais', 'shopping-bag', '#84CC16', 7),
('Entretenimento', 'Parques de diversão, cinemas, teatros e lazer', 'gamepad-2', '#EC4899', 8);

-- Insert subcategories for Atrativos Naturais
INSERT INTO inventory_categories (name, description, icon, color, parent_id, sort_order) VALUES
('Parques e Reservas', 'Parques nacionais, estaduais e reservas ecológicas', 'trees', '#10B981', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Naturais'), 1),
('Cachoeiras', 'Cachoeiras, cascatas e quedas d''água', 'droplets', '#06B6D4', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Naturais'), 2),
('Rios e Lagos', 'Rios, lagos, praias de água doce e balneários', 'waves', '#0EA5E9', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Naturais'), 3),
('Montanhas e Morros', 'Serras, morros, mirantes e trilhas', 'mountain', '#8B5CF6', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Naturais'), 4);

-- Insert subcategories for Atrativos Culturais
INSERT INTO inventory_categories (name, description, icon, color, parent_id, sort_order) VALUES
('Museus', 'Museus de arte, história, ciência e cultura', 'museum', '#8B5CF6', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Culturais'), 1),
('Centros Históricos', 'Centros históricos, praças e monumentos', 'landmark', '#F59E0B', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Culturais'), 2),
('Igrejas e Templos', 'Igrejas, templos e locais de culto', 'church', '#10B981', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Culturais'), 3),
('Artesanato', 'Centros de artesanato e ateliês', 'palette', '#EC4899', (SELECT id FROM inventory_categories WHERE name = 'Atrativos Culturais'), 4);

-- Insert subcategories for Gastronomia
INSERT INTO inventory_categories (name, description, icon, color, parent_id, sort_order) VALUES
('Restaurantes', 'Restaurantes tradicionais e contemporâneos', 'utensils', '#F59E0B', (SELECT id FROM inventory_categories WHERE name = 'Gastronomia'), 1),
('Bares e Pubs', 'Bares, pubs, cervejarias e casas noturnas', 'wine', '#DC2626', (SELECT id FROM inventory_categories WHERE name = 'Gastronomia'), 2),
('Cafés e Lanchonetes', 'Cafés, lanchonetes e padarias', 'coffee', '#8B4513', (SELECT id FROM inventory_categories WHERE name = 'Gastronomia'), 3),
('Comida de Rua', 'Food trucks, barracas e comida de rua', 'truck', '#F97316', (SELECT id FROM inventory_categories WHERE name = 'Gastronomia'), 4);

-- Insert subcategories for Hospedagem
INSERT INTO inventory_categories (name, description, icon, color, parent_id, sort_order) VALUES
('Hotéis', 'Hotéis de luxo, executivos e econômicos', 'bed', '#3B82F6', (SELECT id FROM inventory_categories WHERE name = 'Hospedagem'), 1),
('Pousadas', 'Pousadas, bed & breakfast e hospedagem familiar', 'home', '#10B981', (SELECT id FROM inventory_categories WHERE name = 'Hospedagem'), 2),
('Hostels', 'Hostels, albergues e hospedagem compartilhada', 'users', '#8B5CF6', (SELECT id FROM inventory_categories WHERE name = 'Hospedagem'), 3),
('Camping', 'Campings, glamping e hospedagem em contato com a natureza', 'tent', '#059669', (SELECT id FROM inventory_categories WHERE name = 'Hospedagem'), 4);
