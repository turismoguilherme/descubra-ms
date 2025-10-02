-- Migração para o Sistema Guatá Human
-- Criação das tabelas principais para turismo de MS

-- Tabela de Atrativos Turísticos
CREATE TABLE IF NOT EXISTS guata_tourist_attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'natureza', 'cultura', 'gastronomia', 'aventura', 'historia'
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) DEFAULT 'MS',
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    coordinates POINT, -- latitude, longitude
    average_price DECIMAL(10,2),
    opening_hours JSONB,
    best_time_to_visit VARCHAR(100),
    accessibility_info TEXT,
    images JSONB, -- array de URLs de imagens
    tags TEXT[], -- array de tags para busca
    official_source VARCHAR(255),
    last_verified DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Roteiros Prontos
CREATE TABLE IF NOT EXISTS guata_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    difficulty_level VARCHAR(50), -- 'facil', 'medio', 'dificil'
    target_audience VARCHAR(100), -- 'familia', 'aventureiros', 'idosos', 'criancas'
    total_cost_estimate DECIMAL(10,2),
    season_recommendation VARCHAR(100),
    attractions JSONB, -- array de IDs dos atrativos
    daily_schedule JSONB, -- cronograma dia a dia
    transportation_info TEXT,
    accommodation_suggestions TEXT,
    tips TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Memória Persistente do Usuário
CREATE TABLE IF NOT EXISTS guata_user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    memory_type VARCHAR(50) NOT NULL, -- 'preferences', 'conversation_history', 'travel_style'
    memory_key VARCHAR(255) NOT NULL,
    memory_value JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id, memory_type, memory_key)
);

-- Tabela de Feedback e Aprendizado
CREATE TABLE IF NOT EXISTS guata_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question_id VARCHAR(255) NOT NULL,
    original_question TEXT NOT NULL,
    original_answer TEXT NOT NULL,
    rating VARCHAR(20) NOT NULL, -- 'positive', 'negative', 'neutral'
    comment TEXT,
    correction TEXT,
    learning_patterns JSONB, -- padrões extraídos para aprendizado
    applied_corrections JSONB, -- correções já aplicadas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos e Atualizações
CREATE TABLE IF NOT EXISTS guata_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- 'festival', 'exposicao', 'show', 'esporte'
    location VARCHAR(255),
    city VARCHAR(100),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    price_info TEXT,
    website VARCHAR(255),
    contact_info JSONB,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    source VARCHAR(255),
    last_verified DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parceiros Verificados
CREATE TABLE IF NOT EXISTS guata_verified_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100), -- 'hotel', 'restaurante', 'agencia', 'guia'
    description TEXT,
    location VARCHAR(255),
    city VARCHAR(100),
    contact_info JSONB,
    services JSONB,
    pricing_info TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verification_date DATE,
    verified_by UUID REFERENCES auth.users(id),
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Buscas e Estatísticas
CREATE TABLE IF NOT EXISTS guata_search_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    query_category VARCHAR(100),
    results_count INTEGER,
    response_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    sources_used JSONB,
    user_satisfaction VARCHAR(20), -- 'positive', 'negative', 'neutral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_attractions_location ON guata_tourist_attractions(location, city);
CREATE INDEX IF NOT EXISTS idx_attractions_category ON guata_tourist_attractions(category);
CREATE INDEX IF NOT EXISTS idx_attractions_tags ON guata_tourist_attractions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_itineraries_duration ON guata_itineraries(duration_days);
CREATE INDEX IF NOT EXISTS idx_user_memory_user_session ON guata_user_memory(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session ON guata_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON guata_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_partners_city ON guata_verified_partners(city);
CREATE INDEX IF NOT EXISTS idx_search_stats_query ON guata_search_stats(query);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON guata_tourist_attractions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON guata_itineraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_memory_updated_at BEFORE UPDATE ON guata_user_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON guata_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON guata_verified_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais de exemplo
INSERT INTO guata_tourist_attractions (name, description, category, location, city, address, average_price, tags, official_source) VALUES
('Gruta do Lago Azul', 'Uma das mais belas grutas do Brasil, com águas cristalinas e formações rochosas impressionantes.', 'natureza', 'Bonito', 'Bonito', 'Rodovia MS-178, Km 50', 95.00, ARRAY['gruta', 'lago azul', 'bonito', 'natureza', 'turismo'], 'turismo.ms.gov.br'),
('Bioparque Pantanal', 'O maior parque de fauna silvestre da América Latina, com mais de 200 espécies de animais.', 'natureza', 'Campo Grande', 'Campo Grande', 'Av. Afonso Pena, 6277', 45.00, ARRAY['bioparque', 'pantanal', 'animais', 'campo grande', 'turismo'], 'bioparque.com.br'),
('Forte Coimbra', 'Forte histórico construído em 1775, importante marco da história militar brasileira.', 'historia', 'Corumbá', 'Corumbá', 'Margem do Rio Paraguai', 0.00, ARRAY['forte', 'historia', 'corumba', 'militar', 'turismo'], 'turismo.ms.gov.br');

INSERT INTO guata_itineraries (title, description, duration_days, difficulty_level, target_audience, total_cost_estimate, season_recommendation, attractions, daily_schedule) VALUES
('Bonito em 3 Dias', 'Roteiro completo para conhecer as principais atrações de Bonito, incluindo grutas, cachoeiras e flutuação.', 3, 'facil', 'familia', 800.00, 'abril a outubro', '[]', '{"dia1": "Chegada e Gruta do Lago Azul", "dia2": "Flutuação no Rio Sucuri e cachoeiras", "dia3": "Gruta São Miguel e retorno"}'),
('Pantanal em 5 Dias', 'Imersão completa no Pantanal, com safáris fotográficos, pesca esportiva e observação de fauna.', 5, 'medio', 'aventureiros', 1500.00, 'maio a setembro', '[]', '{"dia1": "Chegada e acomodação", "dia2": "Safári matutino", "dia3": "Pesca esportiva", "dia4": "Observação de aves", "dia5": "Retorno"}');

-- Comentários das tabelas
COMMENT ON TABLE guata_tourist_attractions IS 'Atrativos turísticos verificados de Mato Grosso do Sul';
COMMENT ON TABLE guata_itineraries IS 'Roteiros turísticos prontos e personalizáveis';
COMMENT ON TABLE guata_user_memory IS 'Memória persistente dos usuários para personalização';
COMMENT ON TABLE guata_feedback IS 'Sistema de feedback e aprendizado supervisionado';
COMMENT ON TABLE guata_events IS 'Eventos e atividades turísticas em MS';
COMMENT ON TABLE guata_verified_partners IS 'Parceiros verificados da plataforma';
COMMENT ON TABLE guata_search_stats IS 'Estatísticas de busca para análise e melhoria';






























