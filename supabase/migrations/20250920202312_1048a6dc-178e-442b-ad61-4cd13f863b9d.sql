-- CRITICAL SECURITY FIXES FOR RLS POLICIES

-- Remove overly permissive user_profiles policy that allows ANY authenticated user to see ALL profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Create secure user_profiles policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Secure user_interactions table - restrict to admins and profile owners only
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage user interactions"
ON public.user_interactions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

CREATE POLICY "Users can view own interactions"
ON public.user_interactions FOR SELECT
USING (auth.uid() = user_id);

-- Secure municipal_collaborators table
ALTER TABLE public.municipal_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Municipal managers can manage collaborators"
ON public.municipal_collaborators FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech', 'gestor_municipal')
));

-- Secure survey_responses table  
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Survey creators can view responses"
ON public.survey_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech', 'gestor_municipal', 'gestor_igr', 'diretor_estadual')
));

CREATE POLICY "Users can create survey responses"
ON public.survey_responses FOR INSERT
WITH CHECK (true);

-- Fix function security - ensure proper search paths
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;

  RETURN COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
END;
$$;

-- Update all functions to have secure search paths
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

-- Log security policy updates
INSERT INTO public.security_audit_log (
  action,
  user_id,
  success,
  error_message
) VALUES (
  'security_policies_updated',
  auth.uid(),
  true,
  'Critical RLS policies updated: user_profiles, user_interactions, municipal_collaborators, survey_responses secured'
);