-- Migration: Adicionar campo platform na tabela cat_locations
-- Descrição: Permite diferenciar CATs entre Descubra MS e ViaJAR
-- Data: 2025-02-10

-- Adicionar coluna platform
ALTER TABLE cat_locations 
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('ms', 'viajar', NULL));

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_cat_locations_platform ON cat_locations(platform);

-- Comentário na coluna
COMMENT ON COLUMN cat_locations.platform IS 'Plataforma onde o CAT é exibido: ms (Descubra MS), viajar (ViaJAR), ou NULL (ambas)';




