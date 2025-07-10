-- Ajusta a tabela `municipal_collaborators` para usar a referência de `city_id`

BEGIN;

-- 1. Adiciona a nova coluna `city_id` que fará referência à tabela `cities`
ALTER TABLE public.municipal_collaborators
ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.municipal_collaborators.city_id IS 'Referência direta para a cidade do colaborador.';

-- 2. (Opcional) Tenta popular a nova coluna com base nos dados da coluna antiga `municipality`
-- Esta operação pode falhar se os nomes em `municipality` não corresponderem exatamente aos nomes em `cities`.
-- É uma tentativa "best-effort" para preservar dados existentes.
UPDATE public.municipal_collaborators mc
SET city_id = (
    SELECT id
    FROM public.cities c
    WHERE c.name ILIKE mc.municipality -- Usamos ILIKE para ser case-insensitive
    LIMIT 1
)
WHERE mc.city_id IS NULL;

-- 3. Remove a coluna `municipality` antiga
-- Descomente a linha abaixo APÓS verificar que a migração dos dados funcionou como esperado.
-- Deixar comentada por padrão é uma medida de segurança para evitar perda de dados.
-- ALTER TABLE public.municipal_collaborators DROP COLUMN municipality;


-- 4. Cria um índice na nova coluna para otimizar as buscas
CREATE INDEX IF NOT EXISTS idx_municipal_collaborators_city_id ON public.municipal_collaborators(city_id);

COMMIT; 