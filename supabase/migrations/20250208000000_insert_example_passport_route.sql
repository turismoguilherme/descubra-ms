-- Migration: Roteiro de Exemplo - Pantanal MS
-- Cria um roteiro completo de exemplo para demonstração do passaporte digital

-- ============================================
-- 1. INSERIR ROTA DE EXEMPLO
-- ============================================
INSERT INTO routes (
  id,
  name,
  description,
  region,
  difficulty,
  estimated_duration,
  distance_km,
  image_url,
  video_url,
  passport_number_prefix,
  is_active,
  created_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Rota Pantanal: Aventura no Coração do Brasil',
  'Explore a maior planície alagável do mundo! Esta rota leva você pelos principais atrativos do Pantanal Sul-Mato-Grossense, onde você poderá observar a rica fauna e flora local, incluindo jacarés, capivaras, tuiuiús e, com sorte, até uma onça-pintada! Uma experiência única de ecoturismo e aventura.',
  'Pantanal',
  'medium',
  '2 days'::interval,
  180.5,
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
  'https://www.youtube.com/watch?v=example-pantanal',
  'PNT',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  region = EXCLUDED.region,
  difficulty = EXCLUDED.difficulty,
  estimated_duration = EXCLUDED.estimated_duration,
  distance_km = EXCLUDED.distance_km,
  image_url = EXCLUDED.image_url,
  video_url = EXCLUDED.video_url,
  passport_number_prefix = EXCLUDED.passport_number_prefix,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- 2. INSERIR CHECKPOINTS DA ROTA
-- ============================================
-- Checkpoint 1: Porto da Manga
INSERT INTO route_checkpoints (
  id,
  route_id,
  name,
  description,
  latitude,
  longitude,
  order_sequence,
  stamp_fragment_number,
  geofence_radius,
  requires_photo,
  is_mandatory,
  created_at
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567891'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Porto da Manga',
  'Ponto de entrada para o Pantanal. Aqui você encontra embarcações para passeios pelos rios e observação da fauna aquática.',
  -20.2345,
  -56.1234,
  1,
  1,
  150,
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  order_sequence = EXCLUDED.order_sequence,
  stamp_fragment_number = EXCLUDED.stamp_fragment_number,
  geofence_radius = EXCLUDED.geofence_radius,
  requires_photo = EXCLUDED.requires_photo;

-- Checkpoint 2: Passo do Lontra
INSERT INTO route_checkpoints (
  id,
  route_id,
  name,
  description,
  latitude,
  longitude,
  order_sequence,
  stamp_fragment_number,
  geofence_radius,
  requires_photo,
  is_mandatory,
  created_at
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567892'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Passo do Lontra',
  'Local ideal para observação de lontras e outros mamíferos aquáticos. Trilha ecológica com guias especializados.',
  -20.2456,
  -56.1345,
  2,
  2,
  100,
  false,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  order_sequence = EXCLUDED.order_sequence,
  stamp_fragment_number = EXCLUDED.stamp_fragment_number,
  geofence_radius = EXCLUDED.geofence_radius,
  requires_photo = EXCLUDED.requires_photo;

-- Checkpoint 3: Mirante do Tuiuiú
INSERT INTO route_checkpoints (
  id,
  route_id,
  name,
  description,
  latitude,
  longitude,
  order_sequence,
  stamp_fragment_number,
  geofence_radius,
  requires_photo,
  is_mandatory,
  created_at
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567893'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Mirante do Tuiuiú',
  'Torre de observação com vista panorâmica. Local perfeito para fotografar tuiuiús e outras aves pantaneiras em seus ninhos.',
  -20.2567,
  -56.1456,
  3,
  3,
  200,
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  order_sequence = EXCLUDED.order_sequence,
  stamp_fragment_number = EXCLUDED.stamp_fragment_number,
  geofence_radius = EXCLUDED.geofence_radius,
  requires_photo = EXCLUDED.requires_photo;

-- Checkpoint 4: Fazenda São Francisco
INSERT INTO route_checkpoints (
  id,
  route_id,
  name,
  description,
  latitude,
  longitude,
  order_sequence,
  stamp_fragment_number,
  geofence_radius,
  requires_photo,
  is_mandatory,
  created_at
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567894'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Fazenda São Francisco',
  'Fazenda tradicional pantaneira com passeios a cavalo, focagem noturna e experiência de vida rural. Hospedagem e restaurante típico.',
  -20.2678,
  -56.1567,
  4,
  4,
  300,
  false,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  order_sequence = EXCLUDED.order_sequence,
  stamp_fragment_number = EXCLUDED.stamp_fragment_number,
  geofence_radius = EXCLUDED.geofence_radius,
  requires_photo = EXCLUDED.requires_photo;

-- Checkpoint 5: Base de Pesquisa Onça-Pintada
INSERT INTO route_checkpoints (
  id,
  route_id,
  name,
  description,
  latitude,
  longitude,
  order_sequence,
  stamp_fragment_number,
  geofence_radius,
  requires_photo,
  is_mandatory,
  created_at
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567895'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Base de Pesquisa Onça-Pintada',
  'Centro de pesquisa e conservação da onça-pintada. Visita guiada com informações sobre o maior felino das Américas e seus hábitos no Pantanal.',
  -20.2789,
  -56.1678,
  5,
  5,
  250,
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  order_sequence = EXCLUDED.order_sequence,
  stamp_fragment_number = EXCLUDED.stamp_fragment_number,
  geofence_radius = EXCLUDED.geofence_radius,
  requires_photo = EXCLUDED.requires_photo;

-- ============================================
-- 3. CONFIGURAR PASSAPORTE PARA A ROTA
-- ============================================
INSERT INTO passport_configurations (
  id,
  route_id,
  stamp_theme,
  stamp_fragments,
  video_url,
  description,
  map_config,
  is_active,
  created_at,
  updated_at
) VALUES (
  'c1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'onca',
  5,
  'https://www.youtube.com/watch?v=example-pantanal',
  'Complete os 5 checkpoints para desbloquear o selo completo da Onça-Pintada, símbolo máximo do Pantanal!',
  '{"center": [-56.15, -20.25], "zoom": 10, "style": "satellite"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (route_id) DO UPDATE SET
  stamp_theme = EXCLUDED.stamp_theme,
  stamp_fragments = EXCLUDED.stamp_fragments,
  video_url = EXCLUDED.video_url,
  description = EXCLUDED.description,
  map_config = EXCLUDED.map_config,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- 4. CRIAR RECOMPENSAS PARA A ROTA
-- ============================================
-- Recompensa 1: Desconto em Passeio de Barco
INSERT INTO passport_rewards (
  id,
  route_id,
  partner_name,
  reward_type,
  reward_description,
  reward_code_prefix,
  discount_percentage,
  partner_address,
  partner_phone,
  partner_email,
  is_active,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'd1b2c3d4-e5f6-7890-abcd-ef1234567891'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Pantanal Turismo & Aventura',
  'desconto',
  '20% de desconto em passeios de barco pelo Rio Paraguai',
  'PNT-BARCO',
  20,
  'Av. Pantanal, 1234 - Corumbá/MS',
  '(67) 3234-5678',
  'contato@pantanalturismo.com.br',
  true,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  partner_name = EXCLUDED.partner_name,
  reward_type = EXCLUDED.reward_type,
  reward_description = EXCLUDED.reward_description,
  discount_percentage = EXCLUDED.discount_percentage,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- Recompensa 2: Brinde Exclusivo
INSERT INTO passport_rewards (
  id,
  route_id,
  partner_name,
  reward_type,
  reward_description,
  reward_code_prefix,
  partner_address,
  partner_phone,
  partner_email,
  is_active,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'd1b2c3d4-e5f6-7890-abcd-ef1234567892'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Loja Pantanal Souvenirs',
  'brinde',
  'Camiseta exclusiva "Eu explorei o Pantanal" + adesivo da Onça-Pintada',
  'PNT-BRINDE',
  'Rua do Comércio, 567 - Corumbá/MS',
  '(67) 3234-9012',
  'loja@pantanalsouvenirs.com.br',
  true,
  NOW() + INTERVAL '6 months',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  partner_name = EXCLUDED.partner_name,
  reward_type = EXCLUDED.reward_type,
  reward_description = EXCLUDED.reward_description,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- Recompensa 3: Experiência Exclusiva
INSERT INTO passport_rewards (
  id,
  route_id,
  partner_name,
  reward_type,
  reward_description,
  reward_code_prefix,
  partner_address,
  partner_phone,
  partner_email,
  is_active,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'd1b2c3d4-e5f6-7890-abcd-ef1234567893'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Fazenda São Francisco',
  'experiencia',
  'Passeio exclusivo de focagem noturna com guia especializado (gratuito para completadores da rota)',
  'PNT-FOCAGEM',
  'Estrada do Pantanal, Km 45 - Corumbá/MS',
  '(67) 3234-3456',
  'reservas@fazendasaofrancisco.com.br',
  true,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  partner_name = EXCLUDED.partner_name,
  reward_type = EXCLUDED.reward_type,
  reward_description = EXCLUDED.reward_description,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON TABLE routes IS 'Roteiro de exemplo criado: Rota Pantanal - Aventura no Coração do Brasil';
COMMENT ON TABLE route_checkpoints IS '5 checkpoints criados para a rota do Pantanal';
COMMENT ON TABLE passport_configurations IS 'Configuração de passaporte com tema Onça-Pintada';
COMMENT ON TABLE passport_rewards IS '3 recompensas criadas: desconto, brinde e experiência exclusiva';

