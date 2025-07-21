-- PHASE 1: CRITICAL SECURITY FIXES

-- 1. Fix flowtrip_states RLS (CRITICAL - currently exposed)
ALTER TABLE public.flowtrip_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FlowTrip admins can manage all states" 
ON public.flowtrip_states 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  )
);

CREATE POLICY "State users can view their state" 
ON public.flowtrip_states 
FOR SELECT 
USING (
  id IN (
    SELECT state_id FROM public.user_roles 
    WHERE user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  )
);

-- 2. Fix password_reset_tokens RLS (currently overly restrictive)
DROP POLICY IF EXISTS "System can manage password reset tokens" ON public.password_reset_tokens;

CREATE POLICY "System can insert password reset tokens" 
ON public.password_reset_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can select own tokens" 
ON public.password_reset_tokens 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can update own tokens" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (user_id = auth.uid());

-- 3. Strengthen database function security by adding search_path protection
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
SET search_path = 'public'
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
SET search_path = 'public'
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

-- 4. Add security constraints to prevent unauthorized access
CREATE OR REPLACE FUNCTION public.secure_update_user_role(
  target_user_id uuid,
  new_role text,
  requesting_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requester_role TEXT;
  target_current_role TEXT;
BEGIN
  -- Ensure requesting user is authenticated
  IF requesting_user_id IS NULL THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'unauthorized_role_change_attempt', 
      requesting_user_id, 
      false, 
      'Unauthenticated user attempted to change roles'
    );
    RETURN FALSE;
  END IF;

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

  -- Prevent self-elevation
  IF requesting_user_id = target_user_id AND 
     target_current_role NOT IN ('admin', 'tech') AND 
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