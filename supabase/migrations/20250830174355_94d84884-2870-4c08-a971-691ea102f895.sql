-- Fix remaining database functions without proper search_path
CREATE OR REPLACE FUNCTION public.secure_ai_consultant_operation(p_operation_type text, p_config_id uuid DEFAULT NULL::uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  has_access boolean := false;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Admin and tech have full access
  IF user_role IN ('admin', 'tech') THEN
    has_access := true;
  -- Regional managers have limited access
  ELSIF user_role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal') THEN
    -- Check if they have access to this specific config
    SELECT EXISTS (
      SELECT 1 FROM public.ai_consultant_config ac
      INNER JOIN public.user_roles ur ON ur.user_id = p_user_id
      WHERE ac.id = p_config_id
      AND (
        ac.region_id = ur.region_id OR
        ac.city_id = ur.city_id OR
        (ac.region_id IS NULL AND ac.city_id IS NULL)
      )
    ) INTO has_access;
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message
  ) VALUES (
    'ai_consultant_config_access_' || p_operation_type,
    p_user_id,
    has_access,
    CASE WHEN NOT has_access THEN 'Access denied to AI consultant config' ELSE NULL END
  );
  
  RETURN has_access;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_state_role(check_user_id uuid, required_role text, check_state_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id 
    AND role = required_role
    AND (state_id = check_state_id OR role IN ('admin', 'tech'))
  );
$$;

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(check_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  failed_logins int;
  multiple_ips int;
  result jsonb;
BEGIN
  -- Count failed login attempts in last hour
  SELECT COUNT(*) INTO failed_logins
  FROM public.security_audit_log
  WHERE user_id = check_user_id
  AND action = 'login_attempt'
  AND success = false
  AND created_at > now() - interval '1 hour';
  
  -- Count distinct IP addresses in last 24 hours
  SELECT COUNT(DISTINCT ip_address) INTO multiple_ips
  FROM public.security_audit_log
  WHERE user_id = check_user_id
  AND created_at > now() - interval '24 hours'
  AND ip_address IS NOT NULL;
  
  result := jsonb_build_object(
    'failed_logins_last_hour', failed_logins,
    'distinct_ips_last_24h', multiple_ips,
    'suspicious', (failed_logins > 5 OR multiple_ips > 3)
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_action text, event_user_id uuid DEFAULT NULL::uuid, event_success boolean DEFAULT true, event_error_message text DEFAULT NULL::text, event_ip_address text DEFAULT NULL::text, event_user_agent text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    event_ip_address::inet,
    event_user_agent
  );
  
  SELECT TRUE;
$$;