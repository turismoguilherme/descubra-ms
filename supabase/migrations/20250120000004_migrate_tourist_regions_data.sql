-- Migration: Migrar dados de regiões turísticas do arquivo para o banco
-- Data: 2025-01-20
-- Descrição: Insere as 9 regiões turísticas oficiais de Mato Grosso do Sul

-- Inserir Pantanal
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Pantanal',
  'pantanal',
  '#FFCA28',
  '#FFB300',
  'A maior planície alagável do mundo, santuário de vida selvagem com onças-pintadas, ariranhas e mais de 650 espécies de aves.',
  '["Corumbá", "Ladário", "Aquidauana", "Miranda", "Anastácio"]'::jsonb,
  '["Safari fotográfico", "Pesca esportiva", "Observação de fauna", "Passeios de barco"]'::jsonb,
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'pantanal');

-- Inserir Bonito-Serra da Bodoquena
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Bonito-Serra da Bodoquena',
  'bonito-serra-bodoquena',
  '#4FC3F7',
  '#29B6F6',
  'Paraíso do ecoturismo com rios de águas cristalinas, grutas, cachoeiras e flutuação em meio à natureza preservada.',
  '["Bonito", "Jardim", "Bodoquena", "Guia Lopes da Laguna", "Nioaque", "Porto Murtinho", "Bela Vista"]'::jsonb,
  '["Flutuação", "Mergulho em grutas", "Cachoeiras", "Balneários"]'::jsonb,
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'bonito-serra-bodoquena');

-- Inserir Campo Grande dos Ipês
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Campo Grande dos Ipês',
  'campo-grande-ipes',
  '#7E57C2',
  '#673AB7',
  'A capital sul-mato-grossense, cidade planejada com amplas avenidas, rica gastronomia e atrativos culturais.',
  '["Campo Grande", "Terenos", "Sidrolândia", "Nova Alvorada do Sul", "Rochedo", "Corguinho", "Rio Negro", "Jaraguari", "Ribas do Rio Pardo"]'::jsonb,
  '["Gastronomia regional", "Parques urbanos", "Museus", "Feiras e eventos"]'::jsonb,
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'campo-grande-ipes');

-- Inserir Caminhos da Fronteira
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Caminhos da Fronteira',
  'caminhos-fronteira',
  '#8D6E63',
  '#6D4C41',
  'Região de fronteira com Paraguai, rica em cultura, história e comércio internacional.',
  '["Ponta Porã", "Antônio João", "Aral Moreira", "Coronel Sapucaia", "Paranhos", "Sete Quedas", "Caracol", "Amambai"]'::jsonb,
  '["Compras", "Gastronomia de fronteira", "Turismo histórico", "Cultura guarani"]'::jsonb,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  4,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'caminhos-fronteira');

-- Inserir Caminhos da Natureza-Cone Sul
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Caminhos da Natureza-Cone Sul',
  'caminhos-natureza-cone-sul',
  '#FF9800',
  '#F57C00',
  'Natureza exuberante no extremo sul do estado, com rios, cachoeiras e rica biodiversidade.',
  '["Naviraí", "Eldorado", "Mundo Novo", "Iguatemi", "Itaquiraí", "Japorã", "Tacuru", "Sete Quedas"]'::jsonb,
  '["Cachoeiras", "Rios para banho", "Pesca", "Turismo rural"]'::jsonb,
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  5,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'caminhos-natureza-cone-sul');

-- Inserir Celeiro do MS
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Celeiro do MS',
  'celeiro-ms',
  '#CE93D8',
  '#BA68C8',
  'Região de forte produção agrícola, com turismo rural e eventos ligados ao agronegócio.',
  '["Dourados", "Maracaju", "Rio Brilhante", "Itaporã", "Douradina", "Fátima do Sul", "Vicentina", "Caarapó", "Laguna Carapã", "Juti", "Deodápolis", "Glória de Dourados"]'::jsonb,
  '["Turismo rural", "Agroturismo", "Eventos country", "Gastronomia regional"]'::jsonb,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  6,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'celeiro-ms');

-- Inserir Costa Leste
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Costa Leste',
  'costa-leste',
  '#EF5350',
  '#E53935',
  'Região banhada pelo Rio Paraná, com praias de água doce e desenvolvimento econômico.',
  '["Três Lagoas", "Aparecida do Taboado", "Paranaíba", "Cassilândia", "Inocência", "Selvíria", "Brasilândia", "Santa Rita do Pardo", "Água Clara"]'::jsonb,
  '["Praias fluviais", "Pesca esportiva", "Esportes náuticos", "Turismo de negócios"]'::jsonb,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  7,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'costa-leste');

-- Inserir Rota Cerrado Pantanal
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Rota Cerrado Pantanal',
  'rota-cerrado-pantanal',
  '#66BB6A',
  '#43A047',
  'Transição entre o Cerrado e o Pantanal, com paisagens únicas e rica biodiversidade.',
  '["Coxim", "São Gabriel do Oeste", "Rio Verde de Mato Grosso", "Camapuã", "Pedro Gomes", "Sonora", "Costa Rica", "Alcinópolis", "Figueirão", "Chapadão do Sul"]'::jsonb,
  '["Pesca", "Cachoeiras", "Turismo ecológico", "Observação de aves"]'::jsonb,
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
  8,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'rota-cerrado-pantanal');

-- Inserir Vale das Águas
INSERT INTO tourist_regions (name, slug, color, color_hover, description, cities, highlights, image_url, order_index, is_active)
SELECT 
  'Vale das Águas',
  'vale-das-aguas',
  '#42A5F5',
  '#1E88E5',
  'Região rica em recursos hídricos, com rios e cachoeiras ideais para o turismo de aventura.',
  '["Nova Andradina", "Ivinhema", "Batayporã", "Taquarussu", "Novo Horizonte do Sul", "Anaurilândia", "Bataguassu"]'::jsonb,
  '["Cachoeiras", "Rios", "Pesca", "Turismo de aventura"]'::jsonb,
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800',
  9,
  true
WHERE NOT EXISTS (SELECT 1 FROM tourist_regions WHERE slug = 'vale-das-aguas');

-- Comentário final
COMMENT ON TABLE tourist_regions IS 'Regiões turísticas migradas do arquivo touristRegions2025.ts. Agora editáveis pelo admin.';



