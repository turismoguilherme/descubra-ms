-- Fix infinite recursion in user_roles RLS policies

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a security definer function to check admin roles without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$$;

-- Create new RLS policy using the security definer function
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    public.is_admin_user(auth.uid())
  );