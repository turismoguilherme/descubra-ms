-- Melhorar função get_users_with_details para incluir mais informações
DROP FUNCTION IF EXISTS public.get_users_with_details();

CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  user_type text,
  role text,
  region text,
  status text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  phone text,
  city text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public,auth
AS $$
BEGIN
  -- Verificar se o usuário tem permissão de gerente
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access user data.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as full_name,
    COALESCE(p.user_type, 'user') as user_type,
    COALESCE(ur.role::text, 'user') as role,
    ur.region,
    CASE 
      WHEN u.banned_until IS NULL AND u.deleted_at IS NULL 
      THEN 'active' 
      ELSE 'inactive' 
    END AS status,
    u.created_at,
    u.last_sign_in_at,
    p.phone,
    p.city
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$;

-- Criar função para verificar se usuário é gerente (incluindo municipal_manager)
CREATE OR REPLACE FUNCTION public.is_manager(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor', 'municipal')
  );
$$;

-- Criar função para obter estatísticas de usuários por role
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE(
  role_name text,
  user_count bigint,
  active_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissões
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access statistics.';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(ur.role::text, 'user') as role_name,
    COUNT(*) as user_count,
    COUNT(CASE WHEN u.banned_until IS NULL AND u.deleted_at IS NULL THEN 1 END) as active_count
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY ur.role
  ORDER BY user_count DESC;
END;
$$;

-- Criar função para listar usuários por role específica
CREATE OR REPLACE FUNCTION public.get_users_by_role(target_role text)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  region text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissões
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access user data.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as full_name,
    ur.region,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE ur.role::text = target_role OR (target_role = 'user' AND ur.role IS NULL)
  ORDER BY u.created_at DESC;
END;
$$;

-- Atualizar função para criar usuário administrativo inicial se necessário
CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count int;
BEGIN
  -- Verificar se existe pelo menos um admin
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Se não existir admin, retornar false para indicar que é necessário criar
  IF admin_count = 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;