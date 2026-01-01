-- Migration: Tornar destination_id nullable na tabela destination_details
-- Descrição: Permite que destination_id seja NULL quando destination_details se refere a uma região turística
-- Isso é necessário porque a constraint CHECK garante que OU destination_id OU tourist_region_id seja preenchido

-- Remover a constraint NOT NULL da coluna destination_id
ALTER TABLE public.destination_details
ALTER COLUMN destination_id DROP NOT NULL;

-- Comentário
COMMENT ON COLUMN public.destination_details.destination_id IS 'ID do destino (nullable quando destination_details se refere a uma região turística)';

