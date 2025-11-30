-- Script para verificar se a rota do Pantanal foi criada corretamente

-- 1. Verificar se a rota existe
SELECT 
  id,
  name,
  region,
  difficulty,
  is_active,
  created_at
FROM routes 
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
   OR name LIKE '%Pantanal%';

-- 2. Verificar todas as rotas ativas
SELECT 
  id,
  name,
  region,
  difficulty,
  is_active,
  estimated_duration
FROM routes 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Verificar checkpoints da rota
SELECT 
  rc.id,
  rc.name,
  rc.order_sequence,
  rc.stamp_fragment_number,
  rc.geofence_radius,
  rc.requires_photo
FROM route_checkpoints rc
WHERE rc.route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
ORDER BY rc.order_sequence;

-- 4. Verificar configuração do passaporte
SELECT 
  pc.id,
  pc.stamp_theme,
  pc.stamp_fragments,
  pc.is_active
FROM passport_configurations pc
WHERE pc.route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;

-- 5. Verificar recompensas
SELECT 
  pr.id,
  pr.partner_name,
  pr.reward_type,
  pr.reward_description,
  pr.is_active
FROM passport_rewards pr
WHERE pr.route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;

