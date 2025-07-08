
-- Criar tabela para armazenar check-ins dos atendentes
CREATE TABLE public.cat_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attendant_name TEXT NOT NULL,
  cat_name TEXT NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  checkin_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('confirmado', 'fora_da_area')),
  device_info TEXT,
  distance_from_cat NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para localização oficial dos CATs
CREATE TABLE public.cat_official_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_name TEXT NOT NULL UNIQUE,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  address TEXT,
  radius_meters INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir localizações dos CATs existentes
INSERT INTO public.cat_official_locations (cat_name, latitude, longitude, address, radius_meters) VALUES
('CAT Campo Grande', -20.4697, -54.6201, 'Av. Afonso Pena, 7000', 100),
('CAT Bonito', -21.1261, -56.4514, 'Rua Cel. Pilad Rebuá, 1780', 100),
('CAT Corumbá', -19.0078, -57.6506, 'Rua Delamare, 1546', 100),
('CAT Dourados', -22.2210, -54.8011, 'Av. Weimar Gonçalves Torres, 825', 100),
('CAT Ponta Porã', -22.5296, -55.7203, 'Centro', 100);

-- Habilitar RLS nas tabelas
ALTER TABLE public.cat_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_official_locations ENABLE ROW LEVEL SECURITY;

-- Políticas para cat_checkins
CREATE POLICY "Attendants can view their own checkins" 
  ON public.cat_checkins 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = attendant_id);

CREATE POLICY "Attendants can insert their own checkins" 
  ON public.cat_checkins 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = attendant_id);

CREATE POLICY "Managers can view all checkins" 
  ON public.cat_checkins 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Políticas para cat_official_locations
CREATE POLICY "All authenticated users can view CAT locations" 
  ON public.cat_official_locations 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Only managers can modify CAT locations" 
  ON public.cat_official_locations 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Função para calcular distância entre dois pontos (Haversine)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC, 
  lat2 NUMERIC, lon2 NUMERIC
) 
RETURNS NUMERIC AS $$
DECLARE
  R NUMERIC := 6371000; -- Raio da Terra em metros
  dLat NUMERIC;
  dLon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;
