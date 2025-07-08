
-- Esta migração cria uma função PostgreSQL chamada get_users_with_details.
-- A função busca e retorna uma lista de usuários com seus detalhes (nome, email, função, região e status)
-- combinando informações das tabelas auth.users, public.user_profiles e public.user_roles.
-- A função é definida com SECURITY DEFINER para permitir o acesso seguro aos e-mails na tabela auth.users,
-- e inclui uma verificação para garantir que apenas usuários com perfil de gestor ('manager') possam executá-la.

DROP FUNCTION IF EXISTS public.get_users_with_details();

CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  role public.user_role_type,
  region text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public,auth
AS $$
BEGIN
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access user data.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as name,
    u.email,
    ur.role,
    ur.region,
    CASE WHEN u.banned_until IS NULL AND u.deleted_at IS NULL THEN 'active' ELSE 'inactive' END AS status
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$;
