-- Função para facilitar criação de usuários com roles (para ser usada com usuários reais do Supabase Auth)
CREATE OR REPLACE FUNCTION assign_user_role(
  p_user_id uuid,
  p_role text,
  p_city_id uuid DEFAULT NULL,
  p_region_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir ou atualizar role do usuário
  INSERT INTO public.user_roles (
    user_id,
    role,
    city_id,
    region_id,
    created_at,
    created_by
  ) VALUES (
    p_user_id,
    p_role,
    p_city_id,
    p_region_id,
    now(),
    p_user_id
  )
  ON CONFLICT (user_id, role) DO UPDATE SET
    city_id = EXCLUDED.city_id,
    region_id = EXCLUDED.region_id,
    created_at = EXCLUDED.created_at;
  
  -- Log da criação
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'user_role_assigned',
    p_user_id,
    true,
    now()
  );
  
  RETURN true;
END;
$$;

-- Corrigir usuários existentes sem perfil completo
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

-- Criar função para promover usuários existentes para diferentes roles
CREATE OR REPLACE FUNCTION promote_user_to_role(
  p_email text,
  p_role text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar usuário por email na tabela auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = p_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', p_email;
  END IF;
  
  -- Criar perfil se não existir
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'Usuário ' || p_email,
    'Usuário ' || p_email,
    CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    now(),
    now()
  ) ON CONFLICT (user_id) DO UPDATE SET
    user_type = CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    updated_at = now();
  
  -- Assinar role se não for user
  IF p_role != 'user' THEN
    INSERT INTO public.user_roles (
      user_id,
      role,
      created_at,
      created_by
    ) VALUES (
      target_user_id,
      p_role,
      now(),
      target_user_id
    ) ON CONFLICT (user_id, role) DO UPDATE SET
      created_at = now();
  END IF;
  
  RETURN true;
END;
$$;