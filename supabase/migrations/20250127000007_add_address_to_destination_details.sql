-- Migration: Add address field to destination_details
-- Description: Add address field to allow geocoding instead of manual coordinates

-- Adicionar coluna address na tabela destination_details
ALTER TABLE destination_details 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Comentário na coluna
COMMENT ON COLUMN destination_details.address IS 'Endereço completo do destino para geocoding (ex: Rua das Flores, 123, Bonito - MS)';

-- Criar índice para busca por endereço (opcional, mas útil)
CREATE INDEX IF NOT EXISTS idx_destination_details_address 
ON destination_details(address) 
WHERE address IS NOT NULL;

