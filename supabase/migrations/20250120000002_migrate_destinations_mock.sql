-- Migration: Migrar destinos mock para a tabela destinations
-- Data: 2025-01-20
-- Descrição: Insere os destinos mock que aparecem na página de destinos quando não há dados no banco

-- Inserir destinos mock apenas se a tabela estiver vazia
INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Bonito',
  'Águas cristalinas e ecoturismo de classe mundial. Explore grutas, rios e cachoeiras em um dos destinos mais preservados do Brasil.',
  'Bonito - MS',
  'Sudoeste',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Bonito');

INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Pantanal',
  'A maior planície alagável do mundo e sua biodiversidade única. Observe onças-pintadas, ariranhas e mais de 650 espécies de aves.',
  'Corumbá - MS',
  'Pantanal',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Pantanal');

INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Corumbá',
  'A capital do Pantanal, com rico histórico e cultura. Porto histórico às margens do Rio Paraguai, com forte influência cultural.',
  'Corumbá - MS',
  'Pantanal',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Corumbá');

INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Campo Grande',
  'A capital do estado, com atrativos urbanos e culturais. Cidade planejada com amplas avenidas e rica gastronomia regional.',
  'Campo Grande - MS',
  'Centro',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Campo Grande');

INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ponta Porã',
  'Fronteira com o Paraguai, ideal para compras e cultura. Cidade gêmea de Pedro Juan Caballero, com comércio intenso.',
  'Ponta Porã - MS',
  'Sul',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Ponta Porã');

INSERT INTO destinations (id, name, description, location, region, image_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Três Lagoas',
  'Praia de água doce e desenvolvimento econômico. Lagoas naturais e artificiais ideais para esportes náuticos.',
  'Três Lagoas - MS',
  'Leste',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Três Lagoas');

-- Comentário: Os destinos mock foram migrados para o banco de dados.
-- Agora eles podem ser editados através do admin em /viajar/admin/descubra-ms/destinations
-- A página de destinos não precisará mais usar dados mock hardcoded.

