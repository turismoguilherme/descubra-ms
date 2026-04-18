CREATE TABLE IF NOT EXISTS attendant_allowed_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  allowed_radius INTEGER NOT NULL DEFAULT 100,
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
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER,
  checkin_time TIMESTAMPTZ DEFAULT NOW(),
  checkout_time TIMESTAMPTZ,
  checkout_latitude DECIMAL(10, 8),
  checkout_longitude DECIMAL(11, 8),
  is_valid BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
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

ALTER TABLE attendant_allowed_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendant_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendant_location_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores municipais podem gerenciar locais da sua cidade" ON attendant_allowed_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('gestor_municipal', 'admin', 'tech')
    )
  );

CREATE POLICY "Gestores IGR podem ver locais da sua região" ON attendant_allowed_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'gestor_igr'
    )
  );

CREATE POLICY "Diretores estaduais podem ver todos os locais do cliente" ON attendant_allowed_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'diretor_estadual'
    )
  );

CREATE POLICY "Atendentes podem ver seus locais autorizados" ON attendant_allowed_locations
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'atendente' AND
    id IN (
      SELECT location_id FROM attendant_location_assignments
      WHERE attendant_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Atendentes podem gerenciar seus próprios check-ins" ON attendant_checkins
  FOR ALL USING (attendant_id = auth.uid());

CREATE POLICY "Gestores municipais podem ver check-ins dos atendentes da sua cidade" ON attendant_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('gestor_municipal', 'admin', 'tech')
    )
  );

CREATE POLICY "Gestores IGR podem ver check-ins da sua região" ON attendant_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'gestor_igr'
    )
  );

CREATE POLICY "Diretores estaduais podem ver todos os check-ins do cliente" ON attendant_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'diretor_estadual'
    )
  );

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
