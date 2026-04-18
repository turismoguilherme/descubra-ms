-- =====================================================
-- DAR ACESSO DE ADMIN AO USUÁRIO DE TESTE DO PARCEIRO
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- IMPORTANTE: Este script dá permissão de ADMIN ao usuário de teste do parceiro
-- Use apenas para testes. Em produção, crie um usuário separado para admin.

DO $$
DECLARE
  test_user_id UUID;
  test_user_email TEXT := 'parceiro.teste@descubrams.com.br';
BEGIN
  -- 1. Encontrar o ID do usuário de teste
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(test_user_email));
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário não encontrado: %', test_user_email;
    RAISE NOTICE '   Crie o usuário primeiro no painel do Supabase Auth.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: % (ID: %)', test_user_email, test_user_id;
  
  -- 2. Verificar se já existe perfil
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = test_user_id) THEN
    RAISE NOTICE '📝 Criando perfil de usuário...';
    
    INSERT INTO public.user_profiles (
      user_id,
      full_name,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'Parceiro de Teste (Admin)',
      'partner',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Perfil criado.';
  ELSE
    RAISE NOTICE '✅ Perfil já existe.';
  END IF;
  
  -- 3. Verificar se já existe role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = test_user_id) THEN
    RAISE NOTICE '📝 Criando role de admin...';
    
    INSERT INTO public.user_roles (
      user_id,
      role,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'admin',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Role de admin criada.';
  ELSE
    RAISE NOTICE '📝 Atualizando role para admin...';
    
    UPDATE public.user_roles
    SET 
      role = 'admin',
      updated_at = NOW()
    WHERE user_id = test_user_id;
    
    RAISE NOTICE '✅ Role atualizada para admin.';
  END IF;
  
  -- 4. Atualizar metadata do usuário no auth.users
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'full_name', 'Parceiro de Teste (Admin)',
      'user_type', 'partner',
      'role', 'admin'
    ) || COALESCE(raw_user_meta_data, '{}'::jsonb)
  WHERE id = test_user_id;
  
  RAISE NOTICE '✅ Metadata atualizada.';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONCLUÍDO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'O usuário % agora tem acesso de ADMIN.', test_user_email;
  RAISE NOTICE '';
  RAISE NOTICE 'Rotas de admin disponíveis:';
  RAISE NOTICE '  - /viajar-admin (ViaJAR Admin Panel)';
  RAISE NOTICE '  - /admin (Admin Portal)';
  RAISE NOTICE '  - /technical-admin (Technical Admin)';
  RAISE NOTICE '';
  RAISE NOTICE 'ATENÇÃO: Este usuário também continua tendo acesso ao dashboard do parceiro em /partner/dashboard';
  
END $$;

-- Verificar resultado
SELECT 
  'Verificação final' as etapa,
  au.id as user_id,
  au.email,
  up.full_name,
  up.user_type,
  ur.role,
  au.raw_user_meta_data->>'role' as metadata_role
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE LOWER(TRIM(au.email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));


