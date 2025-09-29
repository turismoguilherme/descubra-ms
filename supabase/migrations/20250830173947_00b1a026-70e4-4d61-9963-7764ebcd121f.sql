-- Critical Security Fix 1: Enable RLS on guata_feedback table
ALTER TABLE public.guata_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for guata_feedback table
CREATE POLICY "Users can view their own feedback" 
ON public.guata_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
ON public.guata_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" 
ON public.guata_feedback 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- Critical Security Fix 2: Update database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$$;

-- Critical Security Fix 3: Review and optimize conflicting RLS policies
-- Remove redundant admin policies and consolidate
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create consolidated admin policies
CREATE POLICY "Admins can manage all user profiles" 
ON public.user_profiles 
FOR ALL
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL
USING (public.is_admin_user(auth.uid()));

-- Security audit logging enhancement
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
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    COALESCE((event_metadata->>'ip_address')::inet, '127.0.0.1'::inet),
    event_metadata->>'user_agent',
    event_metadata
  );
  
  RETURN true;
END;
$$;