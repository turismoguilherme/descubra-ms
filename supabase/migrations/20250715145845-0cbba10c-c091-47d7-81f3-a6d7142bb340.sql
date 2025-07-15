-- Fix security paths in all SECURITY DEFINER functions to prevent schema-based attacks

-- 1. Update create_password_reset_token function
CREATE OR REPLACE FUNCTION public.create_password_reset_token(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  target_user_id uuid;
  reset_token uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Generate reset token
  reset_token := gen_random_uuid();
  
  -- Store token with 1 hour expiration
  INSERT INTO public.password_reset_tokens (
    user_id,
    token_hash,
    expires_at
  ) VALUES (
    target_user_id,
    encode(digest(reset_token::text, 'sha256'), 'hex'),
    now() + interval '1 hour'
  );
  
  -- Log security event
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success
  ) VALUES (
    'password_reset_token_created',
    target_user_id,
    true
  );
  
  RETURN reset_token;
END;
$function$;

-- 2. Update log_enhanced_security_event function
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
SET search_path = ''
AS $function$
BEGIN
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
    COALESCE((event_metadata->>'ip_address')::inet, '127.0.0.1'::inet),
    event_metadata->>'user_agent'
  );
  
  RETURN true;
END;
$function$;

-- 3. Update detect_suspicious_activity function
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(check_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- 4. Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Se o usuário não estiver logado, ele é um 'anônimo'.
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;

  -- Busca o papel (role) na tabela user_roles.
  -- Se não encontrar, retorna 'user' como padrão.
  RETURN COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
END;
$function$;

-- 5. Update is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$function$;

-- 6. Update is_manager function
CREATE OR REPLACE FUNCTION public.is_manager(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor', 'municipal')
  );
$function$;

-- 7. Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$function$;

-- 8. Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_action text, 
  event_user_id uuid DEFAULT NULL::uuid, 
  event_success boolean DEFAULT true, 
  event_error_message text DEFAULT NULL::text, 
  event_ip_address text DEFAULT NULL::text, 
  event_user_agent text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- 9. Update validate_password_reset_token function
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(token_hash text, user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  target_user_id uuid;
  token_valid boolean := false;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if token exists and is not expired
  SELECT EXISTS(
    SELECT 1 FROM public.password_reset_tokens 
    WHERE user_id = target_user_id 
    AND token_hash = validate_password_reset_token.token_hash
    AND expires_at > now()
    AND used_at IS NULL
  ) INTO token_valid;
  
  -- Log validation attempt
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success
  ) VALUES (
    'password_reset_token_validation',
    target_user_id,
    token_valid
  );
  
  RETURN token_valid;
END;
$function$;