-- CRITICAL SECURITY FIXES: Phase 1 - Database Security Hardening

-- 1. Fix nullable user_id constraints on RLS-protected tables
ALTER TABLE public.user_profiles 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.attendant_timesheet 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.passport_stamps 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Strengthen password reset system
CREATE OR REPLACE FUNCTION public.create_password_reset_token(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 3. Update password reset validation function
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(token_hash text, user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 4. Add enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(
  event_action text,
  event_user_id uuid DEFAULT NULL,
  event_success boolean DEFAULT true,
  event_error_message text DEFAULT NULL,
  event_metadata jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 5. Add function to check for suspicious activities
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(check_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 6. Ensure proper RLS on regions and cities tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Add public read policies for regions and cities
CREATE POLICY "Regions are publicly readable" 
ON public.regions 
FOR SELECT 
USING (true);

CREATE POLICY "Cities are publicly readable" 
ON public.cities 
FOR SELECT 
USING (true);

-- Only admins can manage regions and cities
CREATE POLICY "Admins can manage regions" 
ON public.regions 
FOR ALL 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage cities" 
ON public.cities 
FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- 7. Add comprehensive audit trigger for critical tables
CREATE OR REPLACE FUNCTION public.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.content_audit_log (
    table_name,
    action,
    record_id,
    user_id,
    user_name,
    old_values,
    new_values
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    COALESCE(
      (SELECT full_name FROM public.user_profiles WHERE user_id = auth.uid()),
      auth.email()
    ),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_institutional_content
  AFTER INSERT OR UPDATE OR DELETE ON public.institutional_content
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();