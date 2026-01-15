-- Migration: Desativar Roteiros Mocados do Passaporte Digital
-- Data: 2025-01-27
-- Descrição: Desativa rotas que são claramente de teste/mock, mantendo histórico no banco

-- Identificar e desativar rotas mocadas baseado em padrões comuns
-- Padrões identificados:
-- 1. Nomes que contêm "test", "mock", "exemplo", "demo", "sample"
-- 2. Rotas sem checkpoints cadastrados (provavelmente não foram configuradas)
-- 3. Rotas criadas para teste

BEGIN;

-- Desativar rotas com nomes que indicam mock/teste (case insensitive)
-- Nota: Removendo filtro de state_id pois é UUID e pode variar
UPDATE routes
SET 
  is_active = false,
  updated_at = NOW()
WHERE 
  is_active = true
  AND (
    LOWER(name) LIKE '%test%' OR
    LOWER(name) LIKE '%mock%' OR
    LOWER(name) LIKE '%exemplo%' OR
    LOWER(name) LIKE '%demo%' OR
    LOWER(name) LIKE '%sample%' OR
    LOWER(name) LIKE '%teste%' OR
    LOWER(name) LIKE '%fake%' OR
    LOWER(name) LIKE '%dummy%' OR
    LOWER(name) LIKE '%placeholder%'
  );

-- Desativar rotas que não têm checkpoints cadastrados
-- (rotas reais devem ter pelo menos um checkpoint)
UPDATE routes
SET 
  is_active = false,
  updated_at = NOW()
WHERE 
  is_active = true
  AND id NOT IN (
    SELECT DISTINCT route_id 
    FROM route_checkpoints 
    WHERE route_id IS NOT NULL
  );

-- Log das rotas desativadas para auditoria
DO $$
DECLARE
  rotas_desativadas INTEGER;
BEGIN
  SELECT COUNT(*) INTO rotas_desativadas
  FROM routes
  WHERE 
    is_active = false
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE 'Total de rotas mocadas desativadas: %', rotas_desativadas;
END $$;

COMMIT;

-- Verificação: Listar rotas ativas restantes para validação
-- SELECT id, name, difficulty, is_active, created_at, state_id
-- FROM routes
-- WHERE is_active = true
-- ORDER BY name;

