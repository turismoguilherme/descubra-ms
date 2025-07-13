-- Fix critical privilege escalation vulnerabilities

-- 1. Create secure role update function that prevents unauthorized privilege escalation
CREATE OR REPLACE FUNCTION public.secure_update_user_role(
  target_user_id UUID,
  new_role TEXT,
  requesting_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requester_role TEXT;
  target_current_role TEXT;
BEGIN
  -- Get requester's role
  SELECT role INTO requester_role 
  FROM public.user_roles 
  WHERE user_id = requesting_user_id;

  -- Get target user's current role
  SELECT role INTO target_current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;

  -- Only admins and tech can modify roles
  IF requester_role NOT IN ('admin', 'tech') THEN
    -- Log unauthorized attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'unauthorized_role_change_attempt', 
      requesting_user_id, 
      false, 
      'User without admin privileges attempted to change roles'
    );
    RETURN FALSE;
  END IF;

  -- Prevent self-elevation (users cannot elevate their own privileges)
  IF requesting_user_id = target_user_id AND 
     target_current_role NOT IN ('admin', 'tech') AND 
     new_role IN ('admin', 'tech') THEN
    -- Log self-elevation attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'self_elevation_attempt', 
      requesting_user_id, 
      false, 
      'User attempted to elevate their own privileges'
    );
    RETURN FALSE;
  END IF;

  -- Update the role
  UPDATE public.user_roles 
  SET role = new_role 
  WHERE user_id = target_user_id;

  -- Log successful role change
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'role_change_success', 
    requesting_user_id, 
    true, 
    format('Changed user %s role from %s to %s', target_user_id, target_current_role, new_role)
  );

  RETURN TRUE;
END;
$$;

-- 2. Enhanced elevate_to_admin function with security checks
CREATE OR REPLACE FUNCTION public.elevate_to_admin(user_email text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  requesting_user_id uuid := auth.uid();
  requester_role text;
BEGIN
  -- Get requester's role
  SELECT role INTO requester_role 
  FROM public.user_roles 
  WHERE user_id = requesting_user_id;

  -- Only existing admins can elevate other users
  IF requester_role NOT IN ('admin', 'tech') THEN
    -- Log unauthorized elevation attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'unauthorized_admin_elevation_attempt', 
      requesting_user_id, 
      false, 
      format('Non-admin user attempted to elevate %s', user_email)
    );
    RETURN FALSE;
  END IF;

  -- Find target user
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;

  IF target_user_id IS NULL THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'admin_elevation_failed', 
      requesting_user_id, 
      false, 
      format('User with email %s not found', user_email)
    );
    RETURN FALSE;
  END IF;

  -- Use the secure role update function
  RETURN public.secure_update_user_role(target_user_id, 'admin', requesting_user_id);
END;
$$;

-- 3. Strengthen RLS policies on user_roles table
DROP POLICY IF EXISTS "Allow first user to become admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- New secure policies
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles  
FOR SELECT
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Prevent direct role manipulation"
ON public.user_roles
FOR INSERT, UPDATE, DELETE
USING (false); -- No direct manipulation allowed

-- 4. Create function to safely create initial admin (only if no admins exist)
CREATE OR REPLACE FUNCTION public.create_initial_admin_if_needed(
  admin_email TEXT,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');

  -- Only allow if no admins exist
  IF admin_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_blocked', 
      admin_user_id, 
      false, 
      'Attempted to create initial admin when admins already exist'
    );
    RETURN FALSE;
  END IF;

  -- Create the admin role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (admin_user_id, 'admin', admin_user_id);

  -- Log the creation
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'initial_admin_created', 
    admin_user_id, 
    true, 
    format('Initial admin created for user: %s', admin_email)
  );

  RETURN TRUE;
END;
$$;