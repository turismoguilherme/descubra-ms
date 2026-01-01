-- Migration: Adicionar campos de vídeo na tabela region_cities
-- Descrição: Permite que cada cidade tenha seu próprio vídeo promocional

ALTER TABLE public.region_cities
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('youtube', 'upload') OR video_type IS NULL);

-- Comentários
COMMENT ON COLUMN public.region_cities.video_url IS 'URL do vídeo promocional da cidade (YouTube ou upload)';
COMMENT ON COLUMN public.region_cities.video_type IS 'Tipo do vídeo: youtube ou upload';

