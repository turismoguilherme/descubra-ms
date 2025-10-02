-- Create cat_locations table
CREATE TABLE cat_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
    phone TEXT,
    email TEXT,
    opening_hours TEXT,
    services TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cat_attendants table
CREATE TABLE cat_attendants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cat_location_id UUID REFERENCES cat_locations(id),
    cat_name TEXT NOT NULL,
    role TEXT DEFAULT 'attendant' CHECK (role IN ('attendant', 'supervisor', 'manager')),
    is_active BOOLEAN DEFAULT TRUE,
    working_hours JSONB NOT NULL DEFAULT '{
        "monday": {"start": "08:00", "end": "18:00", "is_working": true},
        "tuesday": {"start": "08:00", "end": "18:00", "is_working": true},
        "wednesday": {"start": "08:00", "end": "18:00", "is_working": true},
        "thursday": {"start": "08:00", "end": "18:00", "is_working": true},
        "friday": {"start": "08:00", "end": "18:00", "is_working": true},
        "saturday": {"start": "08:00", "end": "14:00", "is_working": true},
        "sunday": {"start": "08:00", "end": "14:00", "is_working": false}
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tourist_services table
CREATE TABLE tourist_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('information', 'assistance', 'emergency', 'booking', 'transport', 'accommodation')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'maintenance', 'unavailable')),
    location_id UUID REFERENCES cat_locations(id),
    attendant_id UUID REFERENCES cat_attendants(id),
    estimated_duration INTEGER DEFAULT 30, -- in minutes
    is_public_service BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tourist_interactions table
CREATE TABLE tourist_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tourist_name TEXT NOT NULL,
    tourist_email TEXT,
    tourist_phone TEXT,
    tourist_origin TEXT,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('in_person', 'phone', 'email', 'chat', 'whatsapp')),
    service_requested TEXT NOT NULL,
    service_provided TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    duration_minutes INTEGER DEFAULT 0,
    attendant_id UUID REFERENCES cat_attendants(id),
    location_id UUID REFERENCES cat_locations(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled', 'escalated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public_reports table
CREATE TABLE public_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    generated_by UUID REFERENCES auth.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE
);

-- Create emergency_alerts table
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location_id UUID REFERENCES cat_locations(id),
    affected_services TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

-- Enable RLS
ALTER TABLE cat_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cat_locations (public read, admin write)
CREATE POLICY "CAT locations are viewable by everyone"
  ON cat_locations FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage CAT locations"
  ON cat_locations FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'master_admin')
    )
  );

-- RLS Policies for cat_attendants
CREATE POLICY "CAT attendants are viewable by everyone"
  ON cat_attendants FOR SELECT USING (TRUE);

CREATE POLICY "Users can view their own attendant profile"
  ON cat_attendants FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Only admins can manage CAT attendants"
  ON cat_attendants FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'master_admin')
    )
  );

-- RLS Policies for tourist_services (public read, admin write)
CREATE POLICY "Tourist services are viewable by everyone"
  ON tourist_services FOR SELECT USING (is_public_service = TRUE);

CREATE POLICY "Only admins can manage tourist services"
  ON tourist_services FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'master_admin')
    )
  );

-- RLS Policies for tourist_interactions
CREATE POLICY "Users can view interactions for their location"
  ON tourist_interactions FOR SELECT USING (
    location_id IN (
      SELECT id FROM cat_attendants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create interactions"
  ON tourist_interactions FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update interactions for their location"
  ON tourist_interactions FOR UPDATE USING (
    location_id IN (
      SELECT id FROM cat_attendants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS Policies for public_reports
CREATE POLICY "Public reports are viewable by everyone"
  ON public_reports FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own reports"
  ON public_reports FOR SELECT USING (generated_by = auth.uid());

CREATE POLICY "Users can create reports"
  ON public_reports FOR INSERT WITH CHECK (auth.uid() = generated_by);

-- RLS Policies for emergency_alerts
CREATE POLICY "Emergency alerts are viewable by everyone"
  ON emergency_alerts FOR SELECT USING (TRUE);

CREATE POLICY "Users can create emergency alerts"
  ON emergency_alerts FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update emergency alerts they created"
  ON emergency_alerts FOR UPDATE USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_cat_attendants_location ON cat_attendants(cat_location_id);
CREATE INDEX idx_cat_attendants_email ON cat_attendants(email);
CREATE INDEX idx_tourist_services_location ON tourist_services(location_id);
CREATE INDEX idx_tourist_services_attendant ON tourist_services(attendant_id);
CREATE INDEX idx_tourist_interactions_location ON tourist_interactions(location_id);
CREATE INDEX idx_tourist_interactions_attendant ON tourist_interactions(attendant_id);
CREATE INDEX idx_tourist_interactions_created_at ON tourist_interactions(created_at);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_alerts_location ON emergency_alerts(location_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_cat_locations_updated_at
    BEFORE UPDATE ON cat_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cat_attendants_updated_at
    BEFORE UPDATE ON cat_attendants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourist_services_updated_at
    BEFORE UPDATE ON tourist_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourist_interactions_updated_at
    BEFORE UPDATE ON tourist_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for CATs in Mato Grosso do Sul
INSERT INTO cat_locations (id, name, address, city, state, zip_code, coordinates, phone, email, opening_hours, services) VALUES
('1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 'CAT Campo Grande', 'Av. Afonso Pena, 1000 - Centro', 'Campo Grande', 'MS', '79002-070', '{"lat": -20.4697, "lng": -54.6201}', '(67) 3314-7000', 'cat.campogrande@ms.gov.br', 'Seg-Sex: 8h-18h, Sáb: 8h-14h', '{"Informações turísticas", "Reservas", "Atendimento bilíngue", "Wi-Fi gratuito"}'),
('2f2f2f2f-2f2f-2f2f-2f2f-2f2f2f2f2f2f', 'CAT Bonito', 'Rua da Liberdade, 200 - Centro', 'Bonito', 'MS', '79290-000', '{"lat": -21.1261, "lng": -56.4817}', '(67) 3255-2000', 'cat.bonito@ms.gov.br', 'Seg-Dom: 7h-19h', '{"Informações turísticas", "Reservas de passeios", "Atendimento bilíngue", "Mapas e guias"}'),
('3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f3f', 'CAT Corumbá', 'Rua da Liberdade, 300 - Porto Geral', 'Corumbá', 'MS', '79300-000', '{"lat": -19.0086, "lng": -57.6517}', '(67) 3231-3000', 'cat.corumba@ms.gov.br', 'Seg-Sex: 8h-17h, Sáb: 8h-12h', '{"Informações turísticas", "Reservas", "Atendimento bilíngue", "Informações sobre Pantanal"}'),
('4f4f4f4f-4f4f-4f4f-4f4f-4f4f4f4f4f4f', 'CAT Dourados', 'Av. Marcelino Pires, 400 - Centro', 'Dourados', 'MS', '79804-000', '{"lat": -22.2208, "lng": -54.8061}', '(67) 3411-4000', 'cat.dourados@ms.gov.br', 'Seg-Sex: 8h-18h', '{"Informações turísticas", "Reservas", "Atendimento bilíngue"}'),
('5f5f5f5f-5f5f-5f5f-5f5f-5f5f5f5f5f5f', 'CAT Três Lagoas', 'Rua Antônio João, 500 - Centro', 'Três Lagoas', 'MS', '79601-000', '{"lat": -20.7511, "lng": -51.6783}', '(67) 3521-5000', 'cat.treslagoas@ms.gov.br', 'Seg-Sex: 8h-17h', '{"Informações turísticas", "Reservas", "Atendimento bilíngue"}');

-- Insert sample attendants
INSERT INTO cat_attendants (id, name, email, phone, cat_location_id, cat_name, role) VALUES
('1g1g1g1g-1g1g-1g1g-1g1g-1g1g1g1g1g1g', 'Ana Silva', 'ana.silva@ms.gov.br', '(67) 99999-1001', '1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 'CAT Campo Grande', 'supervisor'),
('2g2g2g2g-2g2g-2g2g-2g2g-2g2g2g2g2g2g', 'Carlos Santos', 'carlos.santos@ms.gov.br', '(67) 99999-1002', '1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 'CAT Campo Grande', 'attendant'),
('3g3g3g3g-3g3g-3g3g-3g3g-3g3g3g3g3g3g', 'Maria Oliveira', 'maria.oliveira@ms.gov.br', '(67) 99999-1003', '2f2f2f2f-2f2f-2f2f-2f2f-2f2f2f2f2f2f', 'CAT Bonito', 'supervisor'),
('4g4g4g4g-4g4g-4g4g-4g4g-4g4g4g4g4g4g', 'João Costa', 'joao.costa@ms.gov.br', '(67) 99999-1004', '2f2f2f2f-2f2f-2f2f-2f2f-2f2f2f2f2f2f', 'CAT Bonito', 'attendant'),
('5g5g5g5g-5g5g-5g5g-5g5g-5g5g5g5g5g5g', 'Pedro Lima', 'pedro.lima@ms.gov.br', '(67) 99999-1005', '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f3f', 'CAT Corumbá', 'supervisor');

-- Insert sample tourist services
INSERT INTO tourist_services (id, name, description, category, priority, location_id, estimated_duration) VALUES
('1h1h1h1h-1h1h-1h1h-1h1h-1h1h1h1h1h1h', 'Informações Turísticas', 'Fornecimento de informações sobre pontos turísticos, roteiros e atrativos', 'information', 'medium', '1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 15),
('2h2h2h2h-2h2h-2h2h-2h2h-2h2h2h2h2h2h', 'Reservas de Passeios', 'Reserva e agendamento de passeios e atividades turísticas', 'booking', 'high', '2f2f2f2f-2f2f-2f2f-2f2f-2f2f2f2f2f2f', 30),
('3h3h3h3h-3h3h-3h3h-3h3h-3h3h3h3h3h3h', 'Atendimento de Emergência', 'Suporte em situações de emergência para turistas', 'emergency', 'urgent', '1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 60),
('4h4h4h4h-4h4h-4h4h-4h4h-4h4h4h4h4h4h', 'Assistência Bilíngue', 'Atendimento em inglês e espanhol', 'assistance', 'medium', '1f1f1f1f-1f1f-1f1f-1f1f-1f1f1f1f1f1f', 20),
('5h5h5h5h-5h5h-5h5h-5h5h-5h5h5h5h5h5h', 'Informações sobre Pantanal', 'Especialização em informações sobre o Pantanal', 'information', 'high', '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f3f', 25);
