-- Ajusta as tabelas de City Tour para usar a referência de city_id

BEGIN;

-- 1. Ajusta a tabela `city_tour_bookings`
-- Adiciona a nova coluna `city_id`
ALTER TABLE public.city_tour_bookings
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.city_tour_bookings.city_id IS 'Referência direta para a cidade do agendamento do city tour.';

-- Tenta popular a nova coluna `city_id` com base no campo de texto antigo
UPDATE public.city_tour_bookings b
SET city_id = (
    SELECT id
    FROM public.cities c
    WHERE c.name ILIKE b.city
    LIMIT 1
)
WHERE b.city_id IS NULL;

-- Remove a coluna `city` antiga (Deixar comentada por segurança)
-- ALTER TABLE public.city_tour_bookings DROP COLUMN city;

-- Cria um índice na nova coluna
CREATE INDEX IF NOT EXISTS idx_city_tour_bookings_city_id ON public.city_tour_bookings(city_id);


-- 2. Ajusta a tabela `city_tour_settings`
-- Adiciona a nova coluna `city_id`
ALTER TABLE public.city_tour_settings
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.city_tour_settings.city_id IS 'Referência direta para a cidade das configurações do city tour.';

-- Adiciona uma constraint de unicidade para o upsert funcionar corretamente
ALTER TABLE public.city_tour_settings
ADD CONSTRAINT city_tour_settings_city_id_unique UNIQUE (city_id);

-- Tenta popular a nova coluna `city_id` com base no campo de texto antigo
UPDATE public.city_tour_settings s
SET city_id = (
    SELECT id
    FROM public.cities c
    WHERE c.name ILIKE s.city
    LIMIT 1
)
WHERE s.city_id IS NULL;

-- Remove a coluna `city` antiga (Deixar comentada por segurança)
-- ALTER TABLE public.city_tour_settings DROP COLUMN city;

-- Cria um índice na nova coluna
CREATE INDEX IF NOT EXISTS idx_city_tour_settings_city_id ON public.city_tour_settings(city_id);

COMMIT; 