-- SECURITY FIX: Restrict user_profiles access to own profile only
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create secure policies that only allow access to own profile
CREATE POLICY "Users can view own profile only" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile only" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile only" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SECURITY FIX: Add additional safeguards to role assignment functions
CREATE OR REPLACE FUNCTION public.secure_update_user_role(target_user_id uuid, new_role text, requesting_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- SECURITY: Prevent self-elevation (users cannot elevate their own privileges)
  IF requesting_user_id = target_user_id AND 
     COALESCE(target_current_role, 'user') NOT IN ('admin', 'tech') AND 
     new_role IN ('admin', 'tech') THEN
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

  -- SECURITY: Rate limiting - prevent rapid role changes
  IF EXISTS (
    SELECT 1 FROM public.security_audit_log 
    WHERE user_id = requesting_user_id 
    AND action LIKE '%role_change%' 
    AND created_at > NOW() - INTERVAL '1 minute'
    LIMIT 3
  ) THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'role_change_rate_limit_exceeded', 
      requesting_user_id, 
      false, 
      'Too many role change attempts in short period'
    );
    RETURN FALSE;
  END IF;

  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role, created_by, created_at)
  VALUES (target_user_id, new_role, requesting_user_id, now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET created_at = now(), created_by = requesting_user_id;

  -- Log successful role change
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'role_change_success', 
    requesting_user_id, 
    true, 
    format('Changed user %s role from %s to %s', target_user_id, COALESCE(target_current_role, 'user'), new_role)
  );

  RETURN TRUE;
END;
$function$;

-- SECURITY FIX: Enhance security audit logging
CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(
  event_action text, 
  event_user_id uuid DEFAULT NULL::uuid, 
  event_success boolean DEFAULT true, 
  event_error_message text DEFAULT NULL::text, 
  event_metadata jsonb DEFAULT NULL::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    COALESCE((event_metadata->>'ip_address')::inet, '127.0.0.1'::inet),
    event_metadata->>'user_agent',
    event_metadata,
    now()
  );
  
  RETURN true;
END;
$function$;