-- Tabela de locais autorizados para check-in
CREATE TABLE attendant_allowed_locations (
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

-- Tabela de check-ins dos atendentes
CREATE TABLE attendant_checkins (
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

-- Tabela de associação atendente-local
CREATE TABLE attendant_location_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),
  location_id UUID NOT NULL REFERENCES attendant_allowed_locations(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(attendant_id, location_id)
);

-- Índices para performance
CREATE INDEX idx_attendant_allowed_locations_city ON attendant_allowed_locations(city_id);
CREATE INDEX idx_attendant_allowed_locations_client ON attendant_allowed_locations(client_slug);
CREATE INDEX idx_attendant_allowed_locations_active ON attendant_allowed_locations(is_active);

CREATE INDEX idx_attendant_checkins_attendant ON attendant_checkins(attendant_id);
CREATE INDEX idx_attendant_checkins_location ON attendant_checkins(location_id);
-- Substitui índice em expressão por coluna + trigger para compatibilidade
ALTER TABLE attendant_checkins ADD COLUMN IF NOT EXISTS checkin_date DATE;
CREATE OR REPLACE FUNCTION set_checkin_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checkin_time IS NOT NULL THEN
    NEW.checkin_date := (NEW.checkin_time AT TIME ZONE 'UTC')::date;
  ELSE
    NEW.checkin_date := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_set_checkin_date ON attendant_checkins;
CREATE TRIGGER trg_set_checkin_date BEFORE INSERT OR UPDATE ON attendant_checkins
FOR EACH ROW EXECUTE FUNCTION set_checkin_date();
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_date ON attendant_checkins(checkin_date);
CREATE INDEX idx_attendant_checkins_client ON attendant_checkins(client_slug);
CREATE INDEX idx_attendant_checkins_valid ON attendant_checkins(is_valid);

CREATE INDEX idx_attendant_assignments_attendant ON attendant_location_assignments(attendant_id);
CREATE INDEX idx_attendant_assignments_location ON attendant_location_assignments(location_id);
CREATE INDEX idx_attendant_assignments_active ON attendant_location_assignments(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendant_allowed_locations_updated_at 
  BEFORE UPDATE ON attendant_allowed_locations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_attendant_checkins_updated_at 
  BEFORE UPDATE ON attendant_checkins 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Row Level Security)
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

-- Função para validar check-in por geolocalização
CREATE OR REPLACE FUNCTION validate_attendant_checkin(
  p_attendant_id UUID,
  p_check_lat DECIMAL,
  p_check_lng DECIMAL,
  p_check_accuracy INTEGER DEFAULT 100
) RETURNS JSON AS $$
DECLARE
  allowed_location RECORD;
  distance_meters DECIMAL;
  is_valid BOOLEAN := FALSE;
  location_found RECORD;
  result JSON;
  current_time TIME;
  working_start TIME;
  working_end TIME;
BEGIN
  current_time := CURRENT_TIME;
  
  -- Buscar locais permitidos para o atendente
  FOR allowed_location IN 
    SELECT 
      al.*,
      ST_Distance(
        ST_Point(p_check_lng, p_check_lat)::geography,
        ST_Point(al.longitude, al.latitude)::geography
      ) as distance
    FROM attendant_allowed_locations al
    JOIN attendant_location_assignments ala ON al.id = ala.location_id
    WHERE ala.attendant_id = p_attendant_id 
    AND ala.is_active = true 
    AND al.is_active = true
  LOOP
    -- Verificar se está dentro do raio permitido
    IF allowed_location.distance <= allowed_location.allowed_radius THEN
      -- Verificar horário de trabalho
      working_start := (allowed_location.working_hours->>'start')::TIME;
      working_end := (allowed_location.working_hours->>'end')::TIME;
      
      IF current_time >= working_start AND current_time <= working_end THEN
        is_valid := TRUE;
        location_found := allowed_location;
        EXIT; -- Sair do loop se encontrou local válido
      END IF;
    END IF;
  END LOOP;
  
  -- Registrar tentativa de check-in
  IF is_valid THEN
    INSERT INTO attendant_checkins (
      attendant_id,
      location_id,
      latitude,
      longitude,
      accuracy,
      is_valid,
      client_slug
    ) VALUES (
      p_attendant_id,
      location_found.id,
      p_check_lat,
      p_check_lng,
      p_check_accuracy,
      TRUE,
      'ms' -- ou pegar do contexto
    );
    
    result := json_build_object(
      'success', true,
      'message', 'Check-in realizado com sucesso',
      'location_name', location_found.name,
      'distance', round(location_found.distance),
      'timestamp', NOW()
    );
  ELSE
    INSERT INTO attendant_checkins (
      attendant_id,
      latitude,
      longitude,
      accuracy,
      is_valid,
      rejection_reason,
      client_slug
    ) VALUES (
      p_attendant_id,
      p_check_lat,
      p_check_lng,
      p_check_accuracy,
      FALSE,
      'Location outside allowed radius or outside working hours',
      'ms'
    );
    
    result := json_build_object(
      'success', false,
      'message', 'Localização fora da área permitida ou fora do horário de trabalho',
      'timestamp', NOW()
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de check-ins
CREATE OR REPLACE FUNCTION get_attendant_checkin_stats(
  p_city_id UUID DEFAULT NULL,
  p_region_id UUID DEFAULT NULL,
  p_date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_date_to DATE DEFAULT CURRENT_DATE
) RETURNS JSON AS $$
DECLARE
  stats JSON;
  total_checkins INTEGER;
  valid_checkins INTEGER;
  unique_attendants INTEGER;
  online_now INTEGER;
BEGIN
  -- Filtrar por cidade ou região conforme necessário
  WITH filtered_checkins AS (
    SELECT ac.* 
    FROM attendant_checkins ac
    JOIN user_profiles up ON ac.attendant_id = up.id
    JOIN cities c ON up.city_id = c.id
    WHERE 
      ac.checkin_time::DATE BETWEEN p_date_from AND p_date_to
      AND (p_city_id IS NULL OR up.city_id = p_city_id)
      AND (p_region_id IS NULL OR c.region_id = p_region_id)
  )
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_valid = true) as valid,
    COUNT(DISTINCT attendant_id) as unique_att,
    COUNT(*) FILTER (WHERE 
      checkin_time::DATE = CURRENT_DATE 
      AND checkout_time IS NULL 
      AND is_valid = true
    ) as online
  INTO total_checkins, valid_checkins, unique_attendants, online_now
  FROM filtered_checkins;
  
  stats := json_build_object(
    'total_checkins', COALESCE(total_checkins, 0),
    'valid_checkins', COALESCE(valid_checkins, 0),
    'invalid_checkins', COALESCE(total_checkins - valid_checkins, 0),
    'unique_attendants', COALESCE(unique_attendants, 0),
    'online_now', COALESCE(online_now, 0),
    'success_rate', 
      CASE 
        WHEN total_checkins > 0 THEN ROUND((valid_checkins::DECIMAL / total_checkins::DECIMAL) * 100, 2)
        ELSE 0 
      END,
    'period', json_build_object(
      'from', p_date_from,
      'to', p_date_to
    )
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cleanup de registros antigos
CREATE OR REPLACE FUNCTION cleanup_old_attendant_checkins()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remover check-ins inválidos mais antigos que 90 dias
  DELETE FROM attendant_checkins 
  WHERE is_valid = false 
  AND checkin_time < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir locais padrão para demonstração (Bonito/MS)
INSERT INTO attendant_allowed_locations (
  name, 
  address, 
  latitude, 
  longitude, 
  allowed_radius, 
  working_hours,
  client_slug,
  city_id
) VALUES 
(
  'Centro de Atendimento Bonito',
  'Rua Coronel Pilad Rebuá, 1777 - Centro, Bonito - MS',
  -20.7289,
  -56.4789,
  100,
  '{"start": "08:00", "end": "18:00"}',
  'ms',
  (SELECT id FROM cities WHERE name = 'Bonito' LIMIT 1)
),
(
  'Pantanal Visitor Center',
  'Estrada Parque Pantanal, Km 5 - Bonito - MS',
  -19.0028,
  -57.6558,
  150,
  '{"start": "07:00", "end": "17:00"}',
  'ms',
  (SELECT id FROM cities WHERE name = 'Bonito' LIMIT 1)
);

-- Comentários nas tabelas
COMMENT ON TABLE attendant_allowed_locations IS 'Locais autorizados para check-in de atendentes';
COMMENT ON TABLE attendant_checkins IS 'Registros de check-in/checkout dos atendentes com validação geográfica';
COMMENT ON TABLE attendant_location_assignments IS 'Associação entre atendentes e locais autorizados';

COMMENT ON COLUMN attendant_allowed_locations.allowed_radius IS 'Raio em metros para validação do check-in';
COMMENT ON COLUMN attendant_allowed_locations.working_hours IS 'Horários de trabalho no formato {"start": "HH:MM", "end": "HH:MM"}';
COMMENT ON COLUMN attendant_checkins.accuracy IS 'Precisão do GPS em metros no momento do check-in';
COMMENT ON COLUMN attendant_checkins.is_valid IS 'Se o check-in foi validado conforme localização e horário'; 