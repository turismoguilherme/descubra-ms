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
  test_profiles record;
  profiles_info record[] := ARRAY[
    ROW(gen_random_uuid(), 'admin-teste@ms.gov.br', 'admin', 'Administrador de Teste', 'Admin Teste', 'collaborator'),
    ROW(gen_random_uuid(), 'diretor-teste@ms.gov.br', 'diretor_estadual', 'Diretor Estadual de Teste', 'Diretor Teste', 'collaborator'),
    ROW(gen_random_uuid(), 'gestor-igr-teste@ms.gov.br', 'gestor_igr', 'Gestor IGR de Teste', 'Gestor IGR Teste', 'collaborator'),
    ROW(gen_random_uuid(), 'gestor-municipal-teste@ms.gov.br', 'gestor_municipal', 'Gestor Municipal de Teste', 'Gestor Municipal Teste', 'collaborator'),
    ROW(gen_random_uuid(), 'atendente-teste@ms.gov.br', 'atendente', 'Atendente de Teste', 'Atendente Teste', 'collaborator'),
    ROW(gen_random_uuid(), 'usuario-teste@ms.gov.br', 'user', 'Usuário de Teste', 'Usuário Teste', 'tourist')
  ]::record[];
BEGIN
  -- Iterar sobre os perfis de teste
  FOR test_profiles IN SELECT * FROM unnest(profiles_info) AS p(test_user_id uuid, test_email text, test_role text, test_full_name text, test_display_name text, test_user_type text)
  LOOP
    -- Inserir perfil do usuário apenas se não existir
    INSERT INTO public.user_profiles (
      user_id,
      full_name,
      display_name,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      test_profiles.test_user_id,
      test_profiles.test_full_name,
      test_profiles.test_display_name,
      test_profiles.test_user_type,
      now(),
      now()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Criar papel do usuário apenas se não for 'user' e não existir
    IF test_profiles.test_role != 'user' THEN
      INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        created_by
      ) VALUES (
        test_profiles.test_user_id,
        test_profiles.test_role,
        now(),
        test_profiles.test_user_id
      ) ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    -- Log da criação
    INSERT INTO public.security_audit_log (
      action,
      user_id,
      success,
      created_at
    ) VALUES (
      'test_user_profile_created',
      test_profiles.test_user_id,
      true,
      now()
    );
    
    -- Retornar informações do perfil criado
    RETURN QUERY SELECT 
      test_profiles.test_user_id as user_id_created,
      test_profiles.test_email as email_ref,
      test_profiles.test_role as role_assigned;
  END LOOP;
  
  RETURN;
END;
$function$;