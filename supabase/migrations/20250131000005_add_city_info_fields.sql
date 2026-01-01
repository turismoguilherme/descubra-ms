-- Migration: Adicionar campos best_time_to_visit e how_to_get_there na tabela region_cities
-- Descrição: Permite que cada cidade tenha informações específicas sobre melhor época e como chegar

ALTER TABLE public.region_cities
ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT,
ADD COLUMN IF NOT EXISTS how_to_get_there TEXT;

-- Comentários
COMMENT ON COLUMN public.region_cities.best_time_to_visit IS 'Informações sobre a melhor época para visitar a cidade';
COMMENT ON COLUMN public.region_cities.how_to_get_there IS 'Informações sobre como chegar à cidade';

