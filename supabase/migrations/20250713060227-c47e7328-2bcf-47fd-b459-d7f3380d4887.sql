-- Criar usuários de teste para diferentes papéis

-- Função para criar usuários de teste
CREATE OR REPLACE FUNCTION public.create_test_users()
RETURNS TABLE(email text, password text, role text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_users record;
  user_data record[] := ARRAY[
    ROW('admin-teste@ms.gov.br', 'AdminTeste2024!', 'admin'),
    ROW('diretor-teste@ms.gov.br', 'DiretorTeste2024!', 'diretor_estadual'),
    ROW('gestor-igr-teste@ms.gov.br', 'GestorIgrTeste2024!', 'gestor_igr'),
    ROW('gestor-municipal-teste@ms.gov.br', 'GestorMunicipalTeste2024!', 'gestor_municipal'),
    ROW('atendente-teste@ms.gov.br', 'AtendenteTeste2024!', 'atendente'),
    ROW('usuario-teste@ms.gov.br', 'UsuarioTeste2024!', 'user')
  ]::record[];
  test_user_id uuid;
BEGIN
  -- Iterar sobre os usuários de teste
  FOR test_users IN SELECT unnest(user_data) AS user_info
  LOOP
    -- Gerar UUID para o usuário
    test_user_id := gen_random_uuid();
    
    -- Criar perfil do usuário
    INSERT INTO public.user_profiles (
      user_id,
      full_name,
      display_name,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      CASE 
        WHEN (test_users.user_info).f3 = 'admin' THEN 'Administrador de Teste'
        WHEN (test_users.user_info).f3 = 'diretor_estadual' THEN 'Diretor Estadual de Teste'
        WHEN (test_users.user_info).f3 = 'gestor_igr' THEN 'Gestor IGR de Teste'
        WHEN (test_users.user_info).f3 = 'gestor_municipal' THEN 'Gestor Municipal de Teste'
        WHEN (test_users.user_info).f3 = 'atendente' THEN 'Atendente de Teste'
        ELSE 'Usuário de Teste'
      END,
      CASE 
        WHEN (test_users.user_info).f3 = 'admin' THEN 'Admin Teste'
        WHEN (test_users.user_info).f3 = 'diretor_estadual' THEN 'Diretor Teste'
        WHEN (test_users.user_info).f3 = 'gestor_igr' THEN 'Gestor IGR Teste'
        WHEN (test_users.user_info).f3 = 'gestor_municipal' THEN 'Gestor Municipal Teste'
        WHEN (test_users.user_info).f3 = 'atendente' THEN 'Atendente Teste'
        ELSE 'Usuário Teste'
      END,
      'test_user',
      now(),
      now()
    );
    
    -- Criar papel do usuário (apenas se não for 'user')
    IF (test_users.user_info).f3 != 'user' THEN
      INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        created_by
      ) VALUES (
        test_user_id,
        (test_users.user_info).f3,
        now(),
        test_user_id
      );
    END IF;
    
    -- Log da criação
    INSERT INTO public.security_audit_log (
      action,
      user_id,
      success,
      created_at
    ) VALUES (
      'test_user_created',
      test_user_id,
      true,
      now()
    );
    
    -- Retornar informações do usuário criado
    RETURN QUERY SELECT 
      (test_users.user_info).f1::text as email,
      (test_users.user_info).f2::text as password,
      (test_users.user_info).f3::text as role;
  END LOOP;
  
  RETURN;
END;
$$;