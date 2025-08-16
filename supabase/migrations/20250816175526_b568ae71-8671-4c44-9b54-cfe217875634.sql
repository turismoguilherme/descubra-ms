-- Fix search path security issues for critical database functions
-- This addresses the Function Search Path Mutable warnings

-- Fix update_user_points function
CREATE OR REPLACE FUNCTION public.update_user_points(p_user_id uuid, p_state_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_total INTEGER := 0;
  new_level TEXT;
  new_level_number INTEGER;
BEGIN
  -- Buscar pontos atuais
  SELECT total_points INTO current_total 
  FROM public.user_levels 
  WHERE user_id = p_user_id AND state_id = p_state_id;
  
  -- Se não existe registro, criar
  IF current_total IS NULL THEN
    current_total := 0;
    INSERT INTO public.user_levels (user_id, state_id, total_points)
    VALUES (p_user_id, p_state_id, p_points);
  ELSE
    -- Atualizar pontos
    current_total := current_total + p_points;
    
    -- Determinar novo nível
    CASE 
      WHEN current_total >= 2000 THEN 
        new_level := 'Mestre';
        new_level_number := 5;
      WHEN current_total >= 1001 THEN 
        new_level := 'Aventureiro';
        new_level_number := 4;
      WHEN current_total >= 501 THEN 
        new_level := 'Viajante';
        new_level_number := 3;
      WHEN current_total >= 101 THEN 
        new_level := 'Explorador';
        new_level_number := 2;
      ELSE 
        new_level := 'Iniciante';
        new_level_number := 1;
    END CASE;
    
    UPDATE public.user_levels 
    SET 
      total_points = current_total,
      current_level = new_level,
      level_number = new_level_number,
      updated_at = now()
    WHERE user_id = p_user_id AND state_id = p_state_id;
  END IF;
END;
$$;

-- Fix has_state_role function
CREATE OR REPLACE FUNCTION public.has_state_role(check_user_id uuid, required_role text, check_state_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id 
    AND role = required_role
    AND (state_id = check_state_id OR role IN ('admin', 'tech'))
  );
$$;

-- Fix audit_table_changes function
CREATE OR REPLACE FUNCTION public.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix get_user_states function
CREATE OR REPLACE FUNCTION public.get_user_states(check_user_id uuid)
RETURNS TABLE(state_id uuid, state_code text, state_name text, user_role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(ur.state_id, fs.id) as state_id,
    fs.code as state_code,
    fs.name as state_name,
    ur.role as user_role
  FROM user_roles ur
  LEFT JOIN flowtrip_states fs ON ur.state_id = fs.id OR ur.role IN ('admin', 'tech')
  WHERE ur.user_id = check_user_id
  AND fs.is_active = true;
$$;

-- Fix detect_suspicious_activity function
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(check_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix is_admin_user function  
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$$;

-- Fix secure_update_user_role function
CREATE OR REPLACE FUNCTION public.secure_update_user_role(target_user_id uuid, new_role text, requesting_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix elevate_to_admin function
CREATE OR REPLACE FUNCTION public.elevate_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  requesting_user_id uuid := auth.uid();
  requester_role text;
  success_result boolean;
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
    RAISE EXCEPTION 'Unauthorized: Only admins can elevate users to admin role';
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
    RAISE EXCEPTION 'Usuário com o e-mail % não encontrado', user_email;
  END IF;

  -- Use the secure role update function
  SELECT public.secure_update_user_role(target_user_id, 'admin', requesting_user_id) INTO success_result;
  
  IF NOT success_result THEN
    RAISE EXCEPTION 'Failed to elevate user to admin role';
  END IF;
END;
$$;