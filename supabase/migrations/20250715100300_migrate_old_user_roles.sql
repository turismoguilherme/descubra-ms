-- Fase 5: Migração e Limpeza dos Papéis Antigos
-- Este script atualiza os papéis de usuário antigos para o novo sistema.

-- AVISO IMPORTANTE:
-- Este script apenas renomeia os papéis. A associação de um usuário a uma
-- cidade ou região específica DEVE SER FEITA MANUALMENTE após esta migração.
-- O sistema não tem como adivinhar a qual localidade um gestor antigo pertencia.

BEGIN;

-- 1. Mapeia os papéis antigos para os novos papéis correspondentes.
-- 'municipal_manager', 'gestor', e 'municipal' são todos mapeados para 'gestor_municipal'.
-- O papel 'atendente' mantém o nome, mas também precisará de uma associação manual.

UPDATE public.user_roles
SET role = 'gestor_municipal'
WHERE role IN ('municipal_manager', 'gestor', 'municipal');

-- O papel 'atendente' já tem o nome correto, então nenhuma atualização de nome é necessária.

-- 2. INSTRUÇÕES MANUAIS (EXECUTAR APÓS A MIGRAÇÃO)
-- Após aplicar esta migração, você DEVE associar cada gestor e atendente
-- a uma cidade ou região.

-- EXEMPLO: Para encontrar usuários que precisam de associação:
/*
SELECT u.email, ur.role, ur.user_id
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('gestor_municipal', 'atendente', 'gestor_igr')
  AND ur.city_id IS NULL
  AND ur.region_id IS NULL;
*/

-- EXEMPLO: Para associar um 'gestor_municipal' ou 'atendente' a uma cidade (ex: Bonito):
/*
UPDATE public.user_roles
SET city_id = (SELECT id FROM public.cities WHERE name = 'Bonito' LIMIT 1)
WHERE user_id = 'COPIAR_O_USER_ID_DA_CONSULTA_ACIMA';
*/


-- EXEMPLO: Para associar um 'gestor_igr' a uma região (ex: Bonito / Serra da Bodoquena):
/*
UPDATE public.user_roles
SET region_id = (SELECT id FROM public.regions WHERE name = 'Bonito / Serra da Bodoquena' LIMIT 1)
WHERE user_id = 'COPIAR_O_USER_ID_DA_CONSULTA_ACIMA';
*/

-- 3. Limpeza Final
-- A migração `20250715100000_restructure_roles_and_locations.sql` já removeu
-- a antiga constraint CHECK e adicionou uma nova com os papéis corretos.
-- Portanto, após a atualização dos dados e a associação manual,
-- os papéis antigos deixarão de existir no sistema.

COMMIT; 