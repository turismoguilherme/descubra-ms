-- Ajusta a tabela `institutional_surveys` para usar a referência de city_id

BEGIN;

-- 1. Adiciona a nova coluna `city_id`
ALTER TABLE public.institutional_surveys
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.institutional_surveys.city_id IS 'Referência direta para a cidade à qual a pesquisa pertence.';

-- 2. Tenta popular a nova coluna com base nos dados da coluna antiga `city`
UPDATE public.institutional_surveys s
SET city_id = (
    SELECT id
    FROM public.cities c
    WHERE c.name ILIKE s.city
    LIMIT 1
)
WHERE s.city_id IS NULL;

-- 3. Remove a coluna `city` antiga (Deixar comentada por segurança)
-- ALTER TABLE public.institutional_surveys DROP COLUMN city;

-- 4. Cria um índice na nova coluna
CREATE INDEX IF NOT EXISTS idx_institutional_surveys_city_id ON public.institutional_surveys(city_id);

COMMIT; 