-- Ajusta a tabela `secretary_files` para usar a referência de city_id

BEGIN;

-- 1. Adiciona a nova coluna `city_id`
ALTER TABLE public.secretary_files
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.secretary_files.city_id IS 'Referência direta para a cidade à qual o arquivo pertence.';

-- 2. Tenta popular a nova coluna com base nos dados da coluna antiga `city`
UPDATE public.secretary_files sf
SET city_id = (
    SELECT id
    FROM public.cities c
    WHERE c.name ILIKE sf.city
    LIMIT 1
)
WHERE sf.city_id IS NULL;

-- 3. Remove a coluna `city` antiga (Deixar comentada por segurança)
-- ALTER TABLE public.secretary_files DROP COLUMN city;

-- 4. Cria um índice na nova coluna
CREATE INDEX IF NOT EXISTS idx_secretary_files_city_id ON public.secretary_files(city_id);

COMMIT; 