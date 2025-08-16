-- Fix ai_consultant_config RLS policies
-- Enable RLS on ai_consultant_config table
ALTER TABLE public.ai_consultant_config ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage AI consultant config" ON public.ai_consultant_config;
DROP POLICY IF EXISTS "Regional managers can view AI config for their region" ON public.ai_consultant_config;
DROP POLICY IF EXISTS "System can manage AI consultant config" ON public.ai_consultant_config;

-- Create comprehensive RLS policies for ai_consultant_config
CREATE POLICY "Admins can manage AI consultant config"
ON public.ai_consultant_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech')
  )
);

CREATE POLICY "Regional managers can view AI config for their region"
ON public.ai_consultant_config
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal')
    AND (
      region_id IS NULL OR
      region_id = ai_consultant_config.region_id OR
      city_id = ai_consultant_config.city_id
    )
  )
);

CREATE POLICY "System can manage AI consultant config"
ON public.ai_consultant_config
FOR ALL
USING (true)
WITH CHECK (true);

-- Add security audit logging trigger for ai_consultant_config
CREATE TRIGGER ai_consultant_config_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ai_consultant_config
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

-- Add function to secure AI consultant operations
CREATE OR REPLACE FUNCTION public.secure_ai_consultant_operation(
  p_operation_type text,
  p_config_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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