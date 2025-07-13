-- 3. Update RLS policies on user_roles table
DROP POLICY IF EXISTS "Allow first user to become admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- New secure policies that prevent direct manipulation
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles  
FOR SELECT
USING (public.is_admin_user(auth.uid()));

-- Prevent direct role manipulation - force use of secure functions
CREATE POLICY "Block direct role insertion"
ON public.user_roles
FOR INSERT
USING (false);

CREATE POLICY "Block direct role updates"
ON public.user_roles
FOR UPDATE
USING (false);

CREATE POLICY "Block direct role deletion"
ON public.user_roles
FOR DELETE
USING (false);

-- 4. Create function to safely create initial admin (only if no admins exist)
CREATE OR REPLACE FUNCTION public.create_initial_admin_if_needed(
  admin_email TEXT,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');

  -- Only allow if no admins exist
  IF admin_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_blocked', 
      admin_user_id, 
      false, 
      'Attempted to create initial admin when admins already exist'
    );
    RETURN FALSE;
  END IF;

  -- Create the admin role directly (bypassing RLS for initial setup)
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (admin_user_id, 'admin', admin_user_id);

  -- Log the creation
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'initial_admin_created', 
    admin_user_id, 
    true, 
    format('Initial admin created for user: %s', admin_email)
  );

  RETURN TRUE;
END;
$$;