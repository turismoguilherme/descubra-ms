
-- Tabela para regiões turísticas
CREATE TABLE IF NOT EXISTS tourist_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  visual_art_url TEXT,
  video_url TEXT,
  guardian_avatar_url TEXT,
  map_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para cidades das regiões
CREATE TABLE IF NOT EXISTS region_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES tourist_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  icon_url TEXT,
  cultural_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela melhorada para roteiros
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES region_cities(id);
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100;
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS requires_proof BOOLEAN DEFAULT true;
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS proof_type TEXT DEFAULT 'geolocation';
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS map_image_url TEXT;
ALTER TABLE tourist_routes ADD COLUMN IF NOT EXISTS stamp_icon_url TEXT;

-- Tabela para recompensas
CREATE TABLE IF NOT EXISTS route_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES tourist_routes(id) ON DELETE CASCADE,
  region_id UUID REFERENCES tourist_regions(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('discount', 'coupon', 'gift', 'certificate')) DEFAULT 'discount',
  discount_percentage INTEGER,
  partner_name TEXT,
  partner_contact TEXT,
  how_to_claim TEXT NOT NULL,
  where_to_claim TEXT,
  valid_until DATE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para progressão do usuário
CREATE TABLE IF NOT EXISTS user_passport_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  region_id UUID REFERENCES tourist_regions(id),
  city_id UUID REFERENCES region_cities(id),
  route_id UUID REFERENCES tourist_routes(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  stamp_earned BOOLEAN DEFAULT false,
  proof_photo_url TEXT,
  user_notes TEXT,
  UNIQUE(user_id, route_id)
);

-- Tabela para carimbos coletados
CREATE TABLE IF NOT EXISTS digital_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  region_id UUID REFERENCES tourist_regions(id),
  city_id UUID REFERENCES region_cities(id),
  route_id UUID REFERENCES tourist_routes(id),
  stamp_name TEXT NOT NULL,
  stamp_icon_url TEXT,
  cultural_phrase TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_percentage DECIMAL(5,2) DEFAULT 100.00
);

-- Tabela para recompensas do usuário
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reward_id UUID REFERENCES route_rewards(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  is_claimed BOOLEAN DEFAULT false,
  claim_code TEXT,
  claim_location TEXT
);

-- Inserir as 10 regiões turísticas oficiais do MS
INSERT INTO tourist_regions (name, description, is_active) VALUES
('Pantanal', 'A maior planície alagável do mundo, patrimônio natural da humanidade', true),
('Bonito/Serra da Bodoquena', 'Destino de ecoturismo com águas cristalinas e cavernas', true),
('Campo Grande e Região', 'Capital do estado e portal de entrada para o turismo', true),
('Corumbá', 'Portal de entrada do Pantanal e cidade histórica fronteiriça', true),
('Costa Leste', 'Região de desenvolvimento econômico e turismo de negócios', true),
('Caminhos da Fronteira', 'Região fronteiriça com rica diversidade cultural', true),
('Grande Dourados', 'Centro de agronegócios e turismo rural', true),
('Cerrado Pantanal', 'Transição entre biomas com paisagens únicas', true),
('Cone Sul', 'Região de imigração e diversidade cultural', true),
('Portal Sul', 'Porta de entrada sul do estado', true)
ON CONFLICT DO NOTHING;

-- Funções para estatísticas
CREATE OR REPLACE FUNCTION get_region_statistics(region_uuid UUID)
RETURNS TABLE(
  total_users BIGINT,
  completed_routes BIGINT,
  most_visited_city TEXT,
  average_completion_time DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT upp.user_id) as total_users,
    COUNT(upp.route_id) as completed_routes,
    (SELECT rc.name FROM region_cities rc 
     JOIN user_passport_progress upp2 ON rc.id = upp2.city_id 
     WHERE rc.region_id = region_uuid 
     GROUP BY rc.name 
     ORDER BY COUNT(*) DESC LIMIT 1) as most_visited_city,
    AVG(EXTRACT(EPOCH FROM (upp.completed_at - upp.created_at))/60)::DECIMAL as average_completion_time
  FROM user_passport_progress upp
  WHERE upp.region_id = region_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tourist_regions_updated_at BEFORE UPDATE ON tourist_regions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_region_cities_updated_at BEFORE UPDATE ON region_cities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tourist_routes_updated_at BEFORE UPDATE ON tourist_routes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
