-- ============================================
-- DIAGNÓSTICO: Sistema de Passaporte Digital
-- ============================================

-- 1. Verificar se as tabelas base existem
SELECT 
  'Tabelas Base' as categoria,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('routes', 'route_checkpoints')
ORDER BY table_name;

-- 2. Verificar se as novas tabelas do passaporte foram criadas
SELECT 
  'Tabelas Passaporte' as categoria,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins',
  'user_passports'
)
ORDER BY table_name;

-- 3. Verificar se as colunas foram adicionadas em routes
SELECT 
  'Colunas em routes' as categoria,
  column_name,
  CASE WHEN column_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'routes'
AND column_name IN ('video_url', 'passport_number_prefix')
ORDER BY column_name;

-- 4. Verificar se as colunas foram adicionadas em route_checkpoints
SELECT 
  'Colunas em route_checkpoints' as categoria,
  column_name,
  CASE WHEN column_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'route_checkpoints'
AND column_name IN ('stamp_fragment_number', 'geofence_radius', 'requires_photo')
ORDER BY column_name;

-- 5. Verificar se as funções foram criadas
SELECT 
  'Funções SQL' as categoria,
  routine_name,
  CASE WHEN routine_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_passport_number',
  'calculate_distance',
  'check_geofence',
  'check_checkin_rate_limit',
  'unlock_rewards'
)
ORDER BY routine_name;

-- 6. Verificar se as políticas RLS foram criadas
SELECT 
  'Políticas RLS' as categoria,
  schemaname || '.' || tablename as tabela,
  policyname,
  CASE WHEN policyname IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins',
  'user_passports'
)
ORDER BY tablename, policyname;

-- 7. Verificar se a tabela user_roles existe (necessária para RLS)
SELECT 
  'Tabela user_roles' as categoria,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_roles';

-- 8. Verificar se a tabela passport_stamps existe (usada pelas funções)
SELECT 
  'Tabela passport_stamps' as categoria,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Existe' ELSE '❌ Não existe' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'passport_stamps';

-- 9. Verificar erros de foreign key (tabelas que referenciam routes)
SELECT 
  'Foreign Keys' as categoria,
  tc.table_name as tabela_filha,
  kcu.column_name as coluna_fk,
  ccu.table_name as tabela_pai,
  CASE WHEN ccu.table_name IS NOT NULL THEN '✅ OK' ELSE '❌ Tabela pai não existe' END as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND ccu.table_name = 'routes'
AND tc.table_name IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins'
)
ORDER BY tc.table_name;

