-- Migration: Adicionar campo radius_km na tabela cat_locations
-- Data: 2025-01-29
-- Descrição: Adiciona campo para definir raio de atuação dos CATs em quilômetros

-- Adicionar campo radius_km se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cat_locations' AND column_name = 'radius_km'
  ) THEN
    ALTER TABLE cat_locations ADD COLUMN radius_km DECIMAL(5, 2) DEFAULT 1.0;
    COMMENT ON COLUMN cat_locations.radius_km IS 'Raio de atuação do CAT em quilômetros';
  END IF;
END $$;

-- Criar índice para melhor performance em buscas por raio
CREATE INDEX IF NOT EXISTS idx_cat_locations_radius ON cat_locations(radius_km);

