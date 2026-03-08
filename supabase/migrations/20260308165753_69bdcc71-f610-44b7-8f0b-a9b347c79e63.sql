
-- ============================================================
-- SECURITY FIX: Remove dangerous RLS policies that allow privilege escalation
-- ============================================================

-- 1. FIX user_roles: Remove overly permissive "Service role" policy that allows ANY user to manage ALL roles
DROP POLICY IF EXISTS "Service role gerencia roles" ON public.user_roles;

-- Add proper admin-only management policies using security definer function
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

-- 2. FIX events: Remove overly permissive SELECT policy that exposes ALL events (including rejected + contact data)
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;

-- Update the existing visible policy to also require approved status
DROP POLICY IF EXISTS "Eventos visiveis para todos" ON public.events;
CREATE POLICY "Public can view approved visible events"
ON public.events
FOR SELECT
USING (
  (is_visible = true AND approval_status = 'approved')
  OR (auth.uid() = created_by)
  OR (public.is_admin_user(auth.uid()))
);

-- 3. FIX user_profiles: Remove policy that exposes ALL profiles to any authenticated user
DROP POLICY IF EXISTS "Authenticated users can read user profiles" ON public.user_profiles;

-- Remove duplicate/redundant SELECT policies (keep only owner + admin)
DROP POLICY IF EXISTS "Enable read access for own profile and for admins" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for users on their own profile and for admin" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuarios podem ver seu perfil" ON public.user_profiles;

-- Create single clean owner + admin SELECT policy
CREATE POLICY "Users can view own profile or admins can view all"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR (auth.uid() = id)
  OR (public.is_admin_user(auth.uid()))
);
