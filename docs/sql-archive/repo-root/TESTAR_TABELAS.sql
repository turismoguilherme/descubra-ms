-- Script para testar se as tabelas foram criadas e estão funcionando
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'master_financial_records',
      'expenses', 
      'employee_salaries',
      'content_versions',
      'flowtrip_clients',
      'flowtrip_subscriptions',
      'site_settings'
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'master_financial_records',
    'expenses', 
    'employee_salaries',
    'content_versions',
    'flowtrip_clients',
    'flowtrip_subscriptions',
    'site_settings'
  )
ORDER BY table_name;

-- 2. Verificar colunas das tabelas principais
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('master_financial_records', 'expenses', 'content_versions', 'flowtrip_clients', 'flowtrip_subscriptions')
ORDER BY table_name, ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Habilitado'
    ELSE '❌ Desabilitado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'master_financial_records',
    'expenses', 
    'employee_salaries',
    'content_versions',
    'flowtrip_clients',
    'flowtrip_subscriptions',
    'site_settings'
  )
ORDER BY tablename;

