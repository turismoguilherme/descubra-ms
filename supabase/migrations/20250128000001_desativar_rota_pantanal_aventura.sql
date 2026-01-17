-- Migration: Desativar Rota "Rota Pantanal: Aventura no Coração do Brasil"
-- Data: 2025-01-28
-- Descrição: Desativa a rota mockada "Rota Pantanal: Aventura no Coração do Brasil"

BEGIN;

-- Desativar a rota específica "Rota Pantanal: Aventura no Coração do Brasil"
UPDATE routes
SET 
  is_active = false,
  updated_at = NOW()
WHERE 
  is_active = true
  AND (
    name ILIKE '%Rota Pantanal%' 
    AND name ILIKE '%Aventura no Coração do Brasil%'
  );

-- Log da ação
DO $$
DECLARE
  rotas_desativadas INTEGER;
BEGIN
  SELECT COUNT(*) INTO rotas_desativadas
  FROM routes
  WHERE 
    is_active = false
    AND name ILIKE '%Rota Pantanal%' 
    AND name ILIKE '%Aventura no Coração do Brasil%'
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE 'Rotas "Rota Pantanal: Aventura no Coração do Brasil" desativadas: %', rotas_desativadas;
END $$;

COMMIT;


