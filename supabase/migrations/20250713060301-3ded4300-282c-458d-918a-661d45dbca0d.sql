-- Criar usuários de teste para diferentes papéis (versão corrigida)

-- Função para criar usuários de teste
CREATE OR REPLACE FUNCTION public.create_test_users()
RETURNS TABLE(email text, password text, role text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id uuid;
  users_info text[][] := ARRAY[
    ARRAY['admin-teste@ms.gov.br', 'AdminTeste2024!', 'admin'],
    ARRAY['diretor-teste@ms.gov.br', 'DiretorTeste2024!', 'diretor_estadual'],
    ARRAY['gestor-igr-teste@ms.gov.br', 'GestorIgrTeste2024!', 'gestor_igr'],
    ARRAY['gestor-municipal-teste@ms.gov.br', 'GestorMunicipalTeste2024!', 'gestor_municipal'],
    ARRAY['atendente-teste@ms.gov.br', 'AtendenteTeste2024!', 'atendente'],
    ARRAY['usuario-teste@ms.gov.br', 'UsuarioTeste2024!', 'user']
  ];
  user_info text[];
  i int;
BEGIN
  -- Iterar sobre os usuários de teste
  FOR i IN 1..array_length(users_info, 1)
  LOOP
    user_info := users_info[i];
    
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
        WHEN user_info[3] = 'admin' THEN 'Administrador de Teste'
        WHEN user_info[3] = 'diretor_estadual' THEN 'Diretor Estadual de Teste'
        WHEN user_info[3] = 'gestor_igr' THEN 'Gestor IGR de Teste'
        WHEN user_info[3] = 'gestor_municipal' THEN 'Gestor Municipal de Teste'
        WHEN user_info[3] = 'atendente' THEN 'Atendente de Teste'
        ELSE 'Usuário de Teste'
      END,
      CASE 
        WHEN user_info[3] = 'admin' THEN 'Admin Teste'
        WHEN user_info[3] = 'diretor_estadual' THEN 'Diretor Teste'
        WHEN user_info[3] = 'gestor_igr' THEN 'Gestor IGR Teste'
        WHEN user_info[3] = 'gestor_municipal' THEN 'Gestor Municipal Teste'
        WHEN user_info[3] = 'atendente' THEN 'Atendente Teste'
        ELSE 'Usuário Teste'
      END,
      'test_user',
      now(),
      now()
    );
    
    -- Criar papel do usuário (apenas se não for 'user')
    IF user_info[3] != 'user' THEN
      INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        created_by
      ) VALUES (
        test_user_id,
        user_info[3],
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
      user_info[1]::text as email,
      user_info[2]::text as password,
      user_info[3]::text as role;
  END LOOP;
  
  RETURN;
END;
$$;