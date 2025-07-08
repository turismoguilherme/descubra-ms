
-- This function checks if there are any existing admin or tech users.
-- It's a SECURITY DEFINER function, so it can bypass RLS to get an accurate count.
CREATE OR REPLACE FUNCTION public.is_first_admin_creation_allowed()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'tech'));
$$;

-- Enable Row Level Security on the user_roles table.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user to become first admin" ON public.user_roles;

-- Policy: Users can view their own role details.
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING ( auth.uid() = user_id );

-- Policy: Admins and Techs can manage all user roles, using a helper function to avoid recursion.
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING ( public.get_user_role(auth.uid()) IN ('admin', 'tech') )
WITH CHECK ( public.get_user_role(auth.uid()) IN ('admin', 'tech') );

-- Policy: Any authenticated user can insert a role for themselves IF AND ONLY IF no admin/tech user exists yet.
-- This enables the "first user becomes admin" logic.
CREATE POLICY "Allow user to become first admin"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND public.is_first_admin_creation_allowed()
);
