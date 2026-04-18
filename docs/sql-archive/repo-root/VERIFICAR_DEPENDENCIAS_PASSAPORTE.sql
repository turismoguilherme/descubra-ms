-- ============================================
-- VERIFICAÇÃO DE DEPENDÊNCIAS: Passaporte Digital
-- Execute este script ANTES da migration
-- ============================================

-- 1. Verificar se routes existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
    RAISE EXCEPTION '❌ ERRO: Tabela "routes" não existe. Execute a migration 20250721200842_remote_schema.sql primeiro.';
  ELSE
    RAISE NOTICE '✅ Tabela "routes" existe';
  END IF;
END $$;

-- 2. Verificar se route_checkpoints existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'route_checkpoints') THEN
    RAISE EXCEPTION '❌ ERRO: Tabela "route_checkpoints" não existe. Execute a migration 20250721200842_remote_schema.sql primeiro.';
  ELSE
    RAISE NOTICE '✅ Tabela "route_checkpoints" existe';
  END IF;
END $$;

-- 3. Verificar se user_roles existe (necessário para RLS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    RAISE WARNING '⚠️ ATENÇÃO: Tabela "user_roles" não existe. As políticas RLS de admin podem não funcionar.';
    RAISE NOTICE '💡 DICA: Crie a tabela user_roles ou ajuste as políticas RLS na migration.';
  ELSE
    RAISE NOTICE '✅ Tabela "user_roles" existe';
  END IF;
END $$;

-- 4. Verificar se passport_stamps existe (usada pelas funções)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'passport_stamps') THEN
    RAISE WARNING '⚠️ ATENÇÃO: Tabela "passport_stamps" não existe. As funções check_checkin_rate_limit e unlock_rewards podem não funcionar.';
    RAISE NOTICE '💡 DICA: A tabela passport_stamps deve existir (criada em 20250721200842_remote_schema.sql)';
  ELSE
    RAISE NOTICE '✅ Tabela "passport_stamps" existe';
  END IF;
END $$;

-- 5. Verificar se auth.users existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    RAISE EXCEPTION '❌ ERRO: Tabela "auth.users" não existe. Isso é crítico!';
  ELSE
    RAISE NOTICE '✅ Tabela "auth.users" existe';
  END IF;
END $$;

-- Resumo
SELECT 
  '✅ Todas as dependências verificadas!' as status,
  'Execute a migration 20250207000000_create_passport_digital_tables.sql agora' as proximo_passo;

