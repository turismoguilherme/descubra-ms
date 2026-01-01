-- Migration: Adicionar map_image_url na tabela destination_details
-- Data: 2025-01-31
-- Descrição: Permite adicionar imagem do mapa para regiões turísticas ao invés de usar Google Maps

-- Adicionar coluna map_image_url
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS map_image_url TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.destination_details.map_image_url IS 'URL da imagem do mapa para regiões turísticas (substitui o Google Maps quando fornecido)';

