-- ============================================================
-- SCRIPT DE VERIFICAÇÃO: Plano Diretor Migrations
-- ============================================================
-- Execute este script no Supabase SQL Editor para verificar
-- se todas as tabelas, funções e políticas foram criadas
-- ============================================================

-- 1. Verificar Tabelas Criadas
SELECT 
    table_name,
    'Tabela criada ✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'plano_diretor%'
ORDER BY table_name;

-- 2. Verificar Funções Criadas
SELECT 
    routine_name as function_name,
    'Função criada ✅' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%plano_diretor%'
ORDER BY routine_name;

-- 3. Verificar Políticas RLS Criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    'Política RLS criada ✅' as status
FROM pg_policies
WHERE tablename LIKE 'plano_diretor%'
ORDER BY tablename, policyname;

-- 4. Verificar Triggers Criados
SELECT 
    trigger_name,
    event_object_table as table_name,
    'Trigger criado ✅' as status
FROM information_schema.triggers
WHERE trigger_name LIKE '%plano_diretor%'
ORDER BY event_object_table, trigger_name;

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- 9 tabelas
-- 5 funções principais
-- ~30 políticas RLS
-- ~10 triggers
-- ============================================================















