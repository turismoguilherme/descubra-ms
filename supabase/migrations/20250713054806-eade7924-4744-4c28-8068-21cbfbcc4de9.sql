-- 3. Update RLS policies on user_roles table
DROP POLICY IF EXISTS "Allow first user to become admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- New secure policies that prevent direct manipulation
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles  
FOR SELECT
USING (public.is_admin_user(auth.uid()));

-- Prevent direct role manipulation - force use of secure functions
CREATE POLICY "Block direct role insertion"
ON public.user_roles
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct role updates"
ON public.user_roles
FOR UPDATE
USING (false);

CREATE POLICY "Block direct role deletion"
ON public.user_roles
FOR DELETE
USING (false);