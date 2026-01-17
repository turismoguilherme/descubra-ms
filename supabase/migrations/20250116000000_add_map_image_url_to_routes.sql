-- Migration: Adicionar map_image_url na tabela routes
-- Data: 2025-01-16
-- Descrição: Permite adicionar imagem do mapa para rotas do passaporte digital

-- Adicionar coluna map_image_url
ALTER TABLE public.routes
ADD COLUMN IF NOT EXISTS map_image_url TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.routes.map_image_url IS 'URL da imagem do mapa do roteiro (upload no Supabase Storage)';


