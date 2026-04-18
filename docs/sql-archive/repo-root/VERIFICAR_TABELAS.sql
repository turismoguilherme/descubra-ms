-- Script para verificar se as tabelas necessárias existem
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar tabelas
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'master_financial_records',
      'expenses', 
      'employee_salaries',
      'content_versions',
      'flowtrip_clients',
      'flowtrip_subscriptions'
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
    'flowtrip_subscriptions'
  )
ORDER BY table_name;

