-- Criar função para gerenciar usuários e roles facilmente
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email text,
  p_full_name text,
  p_role text,
  p_city_id uuid DEFAULT NULL,
  p_region_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Gerar ID único para o usuário
  new_user_id := gen_random_uuid();
  
  -- Criar perfil do usuário
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    p_full_name,
    p_full_name,
    CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    now(),
    now()
  );
  
  -- Criar role do usuário (apenas se não for 'user')
  IF p_role != 'user' THEN
    INSERT INTO public.user_roles (
      user_id,
      role,
      city_id,
      region_id,
      created_at,
      created_by
    ) VALUES (
      new_user_id,
      p_role,
      p_city_id,
      p_region_id,
      now(),
      new_user_id
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
    new_user_id,
    true,
    now()
  );
  
  RETURN new_user_id;
END;
$$;

-- Criar usuários de teste para cada tipo de role
SELECT create_user_with_role('admin@ms.gov.br', 'Administrador Teste', 'admin');
SELECT create_user_with_role('diretor@ms.gov.br', 'Diretor Estadual Teste', 'diretor_estadual');
SELECT create_user_with_role('gestor-igr@ms.gov.br', 'Gestor IGR Teste', 'gestor_igr');
SELECT create_user_with_role('gestor-municipal@ms.gov.br', 'Gestor Municipal Teste', 'gestor_municipal');
SELECT create_user_with_role('atendente@ms.gov.br', 'Atendente CAT Teste', 'atendente');
SELECT create_user_with_role('usuario@ms.gov.br', 'Usuário Teste', 'user');

-- Corrigir usuários existentes sem perfil
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  display_name,
  user_type,
  created_at,
  updated_at
)
SELECT 
  u.user_id,
  'Usuário ' || u.user_id::text,
  'Usuário ' || u.user_id::text,
  'tourist',
  now(),
  now()
FROM public.user_roles u
LEFT JOIN public.user_profiles p ON u.user_id = p.user_id
WHERE p.user_id IS NULL;

-- Atualizar configuração completa do perfil para usuários existentes
UPDATE public.user_profiles 
SET 
  full_name = COALESCE(full_name, 'Usuário Teste'),
  display_name = COALESCE(display_name, 'Usuário Teste'),
  user_type = COALESCE(user_type, 'tourist'),
  updated_at = now()
WHERE full_name IS NULL OR display_name IS NULL OR user_type IS NULL;