-- ================================================================
-- VERIFICAÇÃO DAS MIGRAÇÕES - EXECUTE APÓS AS MIGRATIONS
-- ================================================================

-- 1. Verificar se as tabelas existem
SELECT
  table_name,
  CASE
    WHEN table_name IN (
      'tourism_inventory',
      'inventory_categories',
      'dynamic_menus',
      'viajar_products',
      'attendant_checkins',
      'attendant_allowed_locations',
      'attendant_location_assignments'
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'tourism_inventory',
    'inventory_categories',
    'dynamic_menus',
    'viajar_products',
    'attendant_checkins',
    'attendant_allowed_locations',
    'attendant_location_assignments'
  )
ORDER BY table_name;

-- 2. Verificar categorias criadas
SELECT
  name,
  description,
  sort_order,
  '✅ Categoria criada' as status
FROM inventory_categories
ORDER BY sort_order;

-- 3. Verificar RLS habilitado
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS Ativo'
    ELSE '❌ RLS Desabilitado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tourism_inventory',
    'inventory_categories',
    'dynamic_menus',
    'viajar_products',
    'attendant_checkins'
  )
ORDER BY tablename;

-- 4. Contar registros em cada tabela
SELECT
  'inventory_categories' as tabela,
  COUNT(*) as total_registros
FROM inventory_categories
UNION ALL
SELECT
  'tourism_inventory' as tabela,
  COUNT(*) as total_registros
FROM tourism_inventory
UNION ALL
SELECT
  'dynamic_menus' as tabela,
  COUNT(*) as total_registros
FROM dynamic_menus
UNION ALL
SELECT
  'viajar_products' as tabela,
  COUNT(*) as total_registros
FROM viajar_products
ORDER BY tabela;

-- ================================================================
-- RESULTADO ESPERADO:
-- ✅ 7 tabelas com status "Existe"
-- ✅ Pelo menos 8 categorias criadas
-- ✅ RLS ativo em todas as tabelas
-- ✅ Algumas tabelas terão 0 registros (normal)
-- ================================================================
