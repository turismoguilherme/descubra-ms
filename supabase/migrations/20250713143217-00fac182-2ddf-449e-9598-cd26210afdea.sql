-- Corrigir criação de usuários de teste com user_types válidos
DO $$
DECLARE
  test_user_id_1 uuid := '11111111-1111-1111-1111-111111111111';
  test_user_id_2 uuid := '22222222-2222-2222-2222-222222222222';
  test_user_id_3 uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Criar perfis para usuários de teste
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES 
    (test_user_id_1, 'Usuário Teste Admin', 'Admin Teste', 'colaborador', now(), now()),
    (test_user_id_2, 'Usuário Teste Gestor', 'Gestor Teste', 'colaborador', now(), now()),
    (test_user_id_3, 'Usuário Teste Comum', 'User Teste', 'turista', now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Criar roles para usuários de teste (exceto para o usuário comum)
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    created_by
  ) VALUES 
    (test_user_id_1, 'admin', now(), test_user_id_1),
    (test_user_id_2, 'gestor', now(), test_user_id_1)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log da criação
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES 
    ('test_user_profiles_setup', test_user_id_1, true, now()),
    ('test_user_profiles_setup', test_user_id_2, true, now()),
    ('test_user_profiles_setup', test_user_id_3, true, now());

  RAISE NOTICE 'Perfis de teste criados com sucesso';
END $$;