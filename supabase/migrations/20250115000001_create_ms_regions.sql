-- Migração: Implementação das 10 Regiões Turísticas do MS
-- Data: Janeiro 2025
-- Objetivo: Criar estrutura completa das regiões turísticas do Mato Grosso do Sul

-- 1. Criar tabela de regiões turísticas (se não existir)
CREATE TABLE IF NOT EXISTS tourism_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  cities JSONB NOT NULL,
  coordinates JSONB, -- {lat: number, lng: number}
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE tourism_regions ENABLE ROW LEVEL SECURITY;

-- 3. Política de segurança - todos podem ler as regiões
CREATE POLICY "Allow public read access to tourism regions"
ON tourism_regions FOR SELECT
USING (true);

-- 4. Política de segurança - apenas admins podem modificar
CREATE POLICY "Allow admin write access to tourism regions"
ON tourism_regions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'diretor_estadual', 'gestor_igr')
  )
);

-- 5. Inserir as 10 regiões turísticas do MS
INSERT INTO tourism_regions (name, slug, description, cities, coordinates) VALUES
(
  'Bonito / Serra da Bodoquena',
  'bonito-serra-bodoquena',
  'Região conhecida por suas águas cristalinas, grutas e cachoeiras. Destino principal para ecoturismo e turismo de aventura.',
  '["Bonito", "Bodoquena", "Jardim", "Bela Vista", "Caracol", "Guia Lopes da Laguna", "Nioaque", "Porto Murtinho"]',
  '{"lat": -21.1261, "lng": -56.4846}'
),
(
  'Pantanal',
  'pantanal',
  'Maior planície alagada do mundo, rica em biodiversidade. Ideal para observação de fauna e flora, pesca esportiva e turismo rural.',
  '["Corumbá", "Aquidauana", "Miranda", "Anastácio", "Ladário"]',
  '{"lat": -19.0084, "lng": -57.6517}'
),
(
  'Caminho dos Ipês',
  'caminho-ipes',
  'Rota turística que conecta Campo Grande às principais cidades do estado, conhecida pela beleza dos ipês amarelos na primavera.',
  '["Campo Grande", "Corguinho", "Dois Irmãos do Buriti", "Jaraguari", "Nova Alvorada do Sul", "Ribas do Rio Pardo", "Rio Negro", "Sidrolândia", "Terenos"]',
  '{"lat": -20.4486, "lng": -54.6295}'
),
(
  'Rota Norte',
  'rota-norte',
  'Região de transição entre Cerrado e Pantanal, com destaque para o turismo rural, pesca e ecoturismo.',
  '["Alcinópolis", "Bandeirantes", "Camapuã", "Costa Rica", "Coxim", "Figueirão", "Paraíso das Águas", "Pedro Gomes", "Rio Verde de Mato Grosso", "São Gabriel do Oeste", "Sonora"]',
  '{"lat": -18.5122, "lng": -54.6365}'
),
(
  'Costa Leste',
  'costa-leste',
  'Região banhada pelo Rio Paraná, com destaque para pesca esportiva, turismo náutico e belezas naturais.',
  '["Água Clara", "Anaurilândia", "Aparecida do Taboado", "Bataguassu", "Brasilândia", "Selvíria", "Três Lagoas"]',
  '{"lat": -20.4486, "lng": -51.5522}'
),
(
  'Grande Dourados',
  'grande-dourados',
  'Região multicultural com forte influência indígena e de imigrantes. Destaque para gastronomia, cultura e turismo urbano.',
  '["Caarapó", "Dourados", "Fátima do Sul", "Itaporã", "Laguna Carapã", "Ponta Porã"]',
  '{"lat": -22.2208, "lng": -54.8121}'
),
(
  'Sete Caminhos da Natureza / Cone Sul',
  'sete-caminhos-natureza',
  'Região de fronteira com o Paraguai, conhecida por suas belezas naturais, cachoeiras e turismo de aventura.',
  '["Eldorado", "Iguatemi", "Itaquiraí", "Japorã", "Mundo Novo", "Naviraí"]',
  '{"lat": -23.1106, "lng": -54.2483}'
),
(
  'Vale das Águas',
  'vale-aguas',
  'Região rica em recursos hídricos, com destaque para pesca esportiva, turismo rural e ecoturismo.',
  '["Angélica", "Batayporã", "Ivinhema", "Jateí", "Nova Andradina", "Novo Horizonte do Sul", "Taquarussu"]',
  '{"lat": -22.2308, "lng": -53.3441}'
),
(
  'Vale do Aporé',
  'vale-apore',
  'Região de fronteira com Goiás, conhecida por suas paisagens naturais e turismo rural.',
  '["Cassilândia", "Inocência", "Paranaíba"]',
  '{"lat": -19.1136, "lng": -51.7342}'
),
(
  'Caminho da Fronteira',
  'caminho-fronteira',
  'Região de fronteira com o Paraguai, com destaque para o turismo de compras, cultura e história.',
  '["Amambai", "Aral Moreira", "Coronel Sapucaia", "Paranhos", "Sete Quedas"]',
  '{"lat": -23.1056, "lng": -55.2253}'
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tourism_regions_slug ON tourism_regions(slug);
CREATE INDEX IF NOT EXISTS idx_tourism_regions_cities ON tourism_regions USING GIN(cities);

-- 7. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tourism_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_tourism_regions_updated_at
  BEFORE UPDATE ON tourism_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_tourism_regions_updated_at();

-- 9. Comentários para documentação
COMMENT ON TABLE tourism_regions IS 'Regiões turísticas do Mato Grosso do Sul';
COMMENT ON COLUMN tourism_regions.cities IS 'Array JSON com as cidades da região';
COMMENT ON COLUMN tourism_regions.coordinates IS 'Coordenadas geográficas da região (centro)'; 