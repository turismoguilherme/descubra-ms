-- Migration: Adicionar tourist_region_id na tabela destination_details
-- Descrição: Permite reutilizar destination_details para regiões turísticas
-- A tabela agora pode ser usada tanto para destinos (destination_id) quanto para regiões (tourist_region_id)

-- Adicionar coluna tourist_region_id
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS tourist_region_id UUID;

-- Adicionar foreign key para tourist_regions
ALTER TABLE public.destination_details
ADD CONSTRAINT destination_details_tourist_region_id_fkey 
FOREIGN KEY (tourist_region_id) 
REFERENCES public.tourist_regions(id) 
ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_destination_details_tourist_region_id 
ON public.destination_details(tourist_region_id) 
WHERE tourist_region_id IS NOT NULL;

-- Adicionar constraint para garantir que apenas um dos dois campos seja preenchido
-- (destination_id OU tourist_region_id, mas não ambos)
ALTER TABLE public.destination_details
ADD CONSTRAINT destination_details_destination_or_region_check 
CHECK (
  (destination_id IS NOT NULL AND tourist_region_id IS NULL) OR
  (destination_id IS NULL AND tourist_region_id IS NOT NULL) OR
  (destination_id IS NULL AND tourist_region_id IS NULL)
);

-- Comentários
COMMENT ON COLUMN public.destination_details.tourist_region_id IS 'ID da região turística (quando destination_details se refere a uma região ao invés de um destino)';
COMMENT ON CONSTRAINT destination_details_destination_or_region_check ON public.destination_details IS 'Garante que destination_details se refere apenas a um destino OU uma região, não ambos';

