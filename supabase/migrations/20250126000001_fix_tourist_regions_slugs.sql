-- Migration: Corrigir slugs das regiões turísticas
-- Data: 2025-01-26
-- Descrição: Garantir que os slugs das regiões correspondam exatamente aos usados nos paths SVG

-- Mapeamento correto de slugs conforme definido em touristRegions2025.ts
-- e usado como chaves no arquivo svg-regions-paths.json

-- Primeiro, garantir que todas as colunas necessárias existam
-- Usando uma abordagem robusta que tenta criar e ignora erros se já existirem
DO $$
BEGIN
  -- Criar coluna slug se não existir (com tratamento de erro)
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN slug TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- Coluna já existe, continuar
    NULL;
  END;
  
  -- Criar coluna color se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN color TEXT;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna color_hover se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN color_hover TEXT;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna description se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN description TEXT;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna cities se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN cities JSONB DEFAULT '[]'::jsonb;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna highlights se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN highlights JSONB DEFAULT '[]'::jsonb;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna order_index se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN order_index INTEGER DEFAULT 0;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Criar coluna is_active se não existir
  BEGIN
    ALTER TABLE tourist_regions ADD COLUMN is_active BOOLEAN DEFAULT true;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
  
  -- Garantir valores padrão para colunas que podem estar NULL
  UPDATE tourist_regions SET color = COALESCE(color, '#FFCA28') WHERE color IS NULL;
  UPDATE tourist_regions SET color_hover = COALESCE(color_hover, color) WHERE color_hover IS NULL;
  UPDATE tourist_regions SET cities = COALESCE(cities, '[]'::jsonb) WHERE cities IS NULL;
  UPDATE tourist_regions SET highlights = COALESCE(highlights, '[]'::jsonb) WHERE highlights IS NULL;
  UPDATE tourist_regions SET order_index = COALESCE(order_index, 0) WHERE order_index IS NULL;
  UPDATE tourist_regions SET is_active = COALESCE(is_active, true) WHERE is_active IS NULL;
END $$;

-- Garantir que slug tenha índice único (necessário para ON CONFLICT)
CREATE UNIQUE INDEX IF NOT EXISTS tourist_regions_slug_unique ON tourist_regions(slug);

-- Atualizar ou inserir regiões com slugs corretos
DO $$
BEGIN
  -- 1. Pantanal
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Pantanal',
    'pantanal',
    '#FFCA28',
    '#FFB300',
    'A maior planície alagável do mundo, santuário de vida selvagem com onças-pintadas, ariranhas e mais de 650 espécies de aves.',
    '["Corumbá", "Ladário", "Aquidauana", "Miranda", "Anastácio"]'::jsonb,
    '["Safari fotográfico", "Pesca esportiva", "Observação de fauna", "Passeios de barco"]'::jsonb,
    1,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 2. Bonito-Serra da Bodoquena
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Bonito-Serra da Bodoquena',
    'bonito-serra-bodoquena',
    '#4FC3F7',
    '#29B6F6',
    'Paraíso do ecoturismo com rios de águas cristalinas, grutas, cachoeiras e flutuação em meio à natureza preservada.',
    '["Bonito", "Jardim", "Bodoquena", "Guia Lopes da Laguna", "Nioaque", "Porto Murtinho", "Bela Vista"]'::jsonb,
    '["Flutuação", "Mergulho em grutas", "Cachoeiras", "Balneários"]'::jsonb,
    2,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 3. Campo Grande dos Ipês
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Campo Grande dos Ipês',
    'campo-grande-ipes',
    '#7E57C2',
    '#673AB7',
    'A capital sul-mato-grossense, cidade planejada com amplas avenidas, rica gastronomia e atrativos culturais.',
    '["Campo Grande", "Terenos", "Sidrolândia", "Nova Alvorada do Sul", "Rochedo", "Corguinho", "Rio Negro", "Jaraguari", "Ribas do Rio Pardo"]'::jsonb,
    '["Gastronomia regional", "Parques urbanos", "Museus", "Feiras e eventos"]'::jsonb,
    3,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 4. Caminhos da Fronteira
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Caminhos da Fronteira',
    'caminhos-fronteira',
    '#8D6E63',
    '#6D4C41',
    'Região de fronteira com Paraguai, rica em cultura, história e comércio internacional.',
    '["Ponta Porã", "Antônio João", "Aral Moreira", "Coronel Sapucaia", "Paranhos", "Sete Quedas", "Caracol", "Amambai"]'::jsonb,
    '["Compras", "Gastronomia de fronteira", "Turismo histórico", "Cultura guarani"]'::jsonb,
    4,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 5. Caminhos da Natureza-Cone Sul
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Caminhos da Natureza-Cone Sul',
    'caminhos-natureza-cone-sul',
    '#FF9800',
    '#F57C00',
    'Natureza exuberante no extremo sul do estado, com rios, cachoeiras e rica biodiversidade.',
    '["Naviraí", "Eldorado", "Mundo Novo", "Iguatemi", "Itaquiraí", "Japorã", "Tacuru", "Sete Quedas"]'::jsonb,
    '["Cachoeiras", "Rios para banho", "Pesca", "Turismo rural"]'::jsonb,
    5,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 6. Celeiro do MS
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Celeiro do MS',
    'celeiro-ms',
    '#CE93D8',
    '#BA68C8',
    'Região de forte produção agrícola, com turismo rural e eventos ligados ao agronegócio.',
    '["Dourados", "Maracaju", "Rio Brilhante", "Itaporã", "Douradina", "Fátima do Sul", "Vicentina", "Caarapó", "Laguna Carapã", "Juti", "Deodápolis", "Glória de Dourados"]'::jsonb,
    '["Turismo rural", "Agroturismo", "Eventos country", "Gastronomia regional"]'::jsonb,
    6,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 7. Costa Leste
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Costa Leste',
    'costa-leste',
    '#EF5350',
    '#E53935',
    'Região banhada pelo Rio Paraná, com praias de água doce e desenvolvimento econômico.',
    '["Três Lagoas", "Aparecida do Taboado", "Paranaíba", "Cassilândia", "Inocência", "Selvíria", "Brasilândia", "Santa Rita do Pardo", "Água Clara"]'::jsonb,
    '["Praias fluviais", "Pesca esportiva", "Esportes náuticos", "Turismo de negócios"]'::jsonb,
    7,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 8. Rota Cerrado Pantanal
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Rota Cerrado Pantanal',
    'rota-cerrado-pantanal',
    '#66BB6A',
    '#43A047',
    'Transição entre o Cerrado e o Pantanal, com paisagens únicas e rica biodiversidade.',
    '["Coxim", "São Gabriel do Oeste", "Rio Verde de Mato Grosso", "Camapuã", "Pedro Gomes", "Sonora", "Costa Rica", "Alcinópolis", "Figueirão", "Chapadão do Sul"]'::jsonb,
    '["Pesca", "Cachoeiras", "Turismo ecológico", "Observação de aves"]'::jsonb,
    8,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  -- 9. Vale das Águas
  INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, order_index, is_active)
  VALUES (
    'Vale das Águas',
    'vale-das-aguas',
    '#42A5F5',
    '#1E88E5',
    'Região rica em recursos hídricos, com rios e cachoeiras ideais para o turismo de aventura.',
    '["Nova Andradina", "Ivinhema", "Batayporã", "Taquarussu", "Novo Horizonte do Sul", "Anaurilândia", "Bataguassu"]'::jsonb,
    '["Cachoeiras", "Rios", "Pesca", "Turismo de aventura"]'::jsonb,
    9,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    color_hover = EXCLUDED.color_hover,
    description = EXCLUDED.description,
    cities = EXCLUDED.cities,
    highlights = EXCLUDED.highlights,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

END $$;

-- Verificar se todas as regiões têm slugs corretos
DO $$
DECLARE
  expected_slugs TEXT[] := ARRAY[
    'pantanal',
    'bonito-serra-bodoquena',
    'campo-grande-ipes',
    'caminhos-fronteira',
    'caminhos-natureza-cone-sul',
    'celeiro-ms',
    'costa-leste',
    'rota-cerrado-pantanal',
    'vale-das-aguas'
  ];
  missing_slugs TEXT[];
BEGIN
  SELECT ARRAY_AGG(slug)
  INTO missing_slugs
  FROM tourist_regions
  WHERE slug NOT IN (SELECT UNNEST(expected_slugs))
    AND is_active = true;

  IF missing_slugs IS NOT NULL AND array_length(missing_slugs, 1) > 0 THEN
    RAISE WARNING 'Regiões com slugs não esperados encontradas: %', missing_slugs;
  END IF;

  RAISE NOTICE 'Migração de slugs concluída. Verifique se todas as 9 regiões estão ativas.';
END $$;

