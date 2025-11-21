-- Tabela de atendimentos presenciais aos turistas
CREATE TABLE IF NOT EXISTS tourist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id),
  cat_id UUID,
  cat_name VARCHAR,
  service_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_type VARCHAR NOT NULL CHECK (service_type IN ('informacao', 'orientacao', 'venda', 'reclamacao', 'outro')),
  tourist_origin_country VARCHAR,
  tourist_origin_state VARCHAR,
  tourist_origin_city VARCHAR,
  tourist_motive TEXT,
  service_duration_minutes INTEGER,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_tourist_services_attendant ON tourist_services(attendant_id);
CREATE INDEX idx_tourist_services_date ON tourist_services(service_date);
CREATE INDEX idx_tourist_services_cat ON tourist_services(cat_id, cat_name);
CREATE INDEX idx_tourist_services_type ON tourist_services(service_type);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tourist_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tourist_services_updated_at
  BEFORE UPDATE ON tourist_services
  FOR EACH ROW
  EXECUTE FUNCTION update_tourist_services_updated_at();

-- RLS Policies
ALTER TABLE tourist_services ENABLE ROW LEVEL SECURITY;

-- Atendentes podem criar seus próprios registros
CREATE POLICY "Atendentes podem criar seus próprios registros" ON tourist_services
  FOR INSERT WITH CHECK (attendant_id = auth.uid());

-- Atendentes podem ver seus próprios registros
CREATE POLICY "Atendentes podem ver seus próprios registros" ON tourist_services
  FOR SELECT USING (attendant_id = auth.uid());

-- Atendentes podem atualizar seus próprios registros (apenas do dia)
CREATE POLICY "Atendentes podem atualizar seus próprios registros" ON tourist_services
  FOR UPDATE USING (
    attendant_id = auth.uid() AND
    DATE(service_date) = CURRENT_DATE
  );

-- Gestores municipais podem ver registros dos atendentes da sua cidade
CREATE POLICY "Gestores municipais podem ver registros dos atendentes da sua cidade" ON tourist_services
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' IN ('gestor_municipal', 'admin', 'tech') AND
    attendant_id IN (
      SELECT id FROM user_profiles 
      WHERE city_id = (auth.jwt() ->> 'city_id')::UUID 
      AND user_role = 'atendente'
    )
  );

-- Gestores IGR podem ver registros da sua região
CREATE POLICY "Gestores IGR podem ver registros da sua região" ON tourist_services
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'gestor_igr' AND
    attendant_id IN (
      SELECT up.id FROM user_profiles up
      JOIN cities c ON up.city_id = c.id
      WHERE c.region_id = (auth.jwt() ->> 'region_id')::UUID 
      AND up.user_role = 'atendente'
    )
  );

-- Diretores estaduais podem ver todos os registros do cliente
CREATE POLICY "Diretores estaduais podem ver todos os registros do cliente" ON tourist_services
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'diretor_estadual'
  );

