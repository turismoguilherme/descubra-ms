-- Migration: Adicionar campos de links oficiais e redes sociais para destinos
-- Tabela: destination_details

-- Site oficial da cidade/prefeitura
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS official_website TEXT;

-- Redes sociais (JSON para flexibilidade)
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Informações de contato do turismo local
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Melhorar descrição com campos separados
ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS highlights TEXT[]; -- Principais atrações

ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT; -- Melhor época para visitar

ALTER TABLE public.destination_details
ADD COLUMN IF NOT EXISTS how_to_get_there TEXT; -- Como chegar

-- Comentários
COMMENT ON COLUMN public.destination_details.official_website IS 'Site oficial da cidade ou prefeitura';
COMMENT ON COLUMN public.destination_details.social_links IS 'JSON com redes sociais: {"instagram": "url", "facebook": "url", "youtube": "url"}';
COMMENT ON COLUMN public.destination_details.contact_phone IS 'Telefone do turismo local';
COMMENT ON COLUMN public.destination_details.contact_email IS 'Email do turismo local';
COMMENT ON COLUMN public.destination_details.highlights IS 'Lista das principais atrações';
COMMENT ON COLUMN public.destination_details.best_time_to_visit IS 'Melhor época para visitar';
COMMENT ON COLUMN public.destination_details.how_to_get_there IS 'Informações de como chegar';

