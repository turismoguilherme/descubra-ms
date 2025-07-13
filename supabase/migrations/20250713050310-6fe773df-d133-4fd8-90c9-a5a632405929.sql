-- FASE 1: CORREÇÃO CRÍTICA DA BASE DE DADOS
-- Corrigir problemas de recursão infinita nas políticas RLS

-- 1. Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow first user to become admin" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for own role and for admins" ON public.user_roles;

-- 2. Criar função segura para verificar se usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$$;

-- 3. Criar função segura para verificar role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
$$;

-- 4. Criar políticas RLS simples e seguras (sem recursão)
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Allow first user to become admin" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'tech'))
  );

-- 5. Atualizar usuário para admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'guilhermearevalo27@gmail.com'
) AND role != 'admin';

-- 6. Se o usuário não tem role, criar uma
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'guilhermearevalo27@gmail.com'
AND id NOT IN (SELECT user_id FROM public.user_roles);

-- 7. Log da correção
INSERT INTO public.security_audit_log (
  action,
  user_id,
  success,
  error_message
) VALUES (
  'fix_rls_recursion_and_admin_setup',
  (SELECT id FROM auth.users WHERE email = 'guilhermearevalo27@gmail.com'),
  true,
  'Fixed infinite recursion in RLS policies and set user as admin'
);