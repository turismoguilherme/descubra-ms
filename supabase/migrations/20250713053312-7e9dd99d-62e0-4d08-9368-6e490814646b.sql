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