-- Primeiro, vamos dropar a função existente que está com problemas
DROP FUNCTION IF EXISTS public.create_test_users();

-- Criar uma versão simples que apenas insere perfis de usuários de teste
-- (os usuários precisam ser criados manualmente no Supabase Auth)
CREATE OR REPLACE FUNCTION public.create_test_user_profiles()
RETURNS TABLE(user_id_created uuid, email_ref text, role_assigned text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  users_info text[][] := ARRAY[
    ARRAY['admin-teste@ms.gov.br', 'admin', 'Administrador de Teste', 'Admin Teste', 'collaborator'],
    ARRAY['diretor-teste@ms.gov.br', 'diretor_estadual', 'Diretor Estadual de Teste', 'Diretor Teste', 'collaborator'],
    ARRAY['gestor-igr-teste@ms.gov.br', 'gestor_igr', 'Gestor IGR de Teste', 'Gestor IGR Teste', 'collaborator'],
    ARRAY['gestor-municipal-teste@ms.gov.br', 'gestor_municipal', 'Gestor Municipal de Teste', 'Gestor Municipal Teste', 'collaborator'],
    ARRAY['atendente-teste@ms.gov.br', 'atendente', 'Atendente de Teste', 'Atendente Teste', 'collaborator'],
    ARRAY['usuario-teste@ms.gov.br', 'user', 'Usuário de Teste', 'Usuário Teste', 'tourist']
  ];
  user_info text[];
  test_user_id uuid;
  i int;
BEGIN
  -- Iterar sobre os usuários de teste
  FOR i IN 1..array_length(users_info, 1)
  LOOP
    user_info := users_info[i];
    test_user_id := gen_random_uuid();
    
    -- Inserir perfil do usuário
    INSERT INTO public.user_profiles (
      user_id,
      full_name,
      display_name,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      user_info[3], -- full_name
      user_info[4], -- display_name
      user_info[5], -- user_type
      now(),
      now()
    );
    
    -- Criar papel do usuário apenas se não for 'user'
    IF user_info[2] != 'user' THEN
      INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        created_by
      ) VALUES (
        test_user_id,
        user_info[2], -- role
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
      'test_user_profile_created',
      test_user_id,
      true,
      now()
    );
    
    -- Retornar informações do perfil criado
    RETURN QUERY SELECT 
      test_user_id as user_id_created,
      user_info[1] as email_ref,
      user_info[2] as role_assigned;
  END LOOP;
  
  RETURN;
END;
$function$;