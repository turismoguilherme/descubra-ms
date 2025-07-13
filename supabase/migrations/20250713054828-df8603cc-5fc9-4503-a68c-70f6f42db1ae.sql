-- Create function to safely create initial admin (only if no admins exist)
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_error', 
      admin_user_id, 
      false, 
      SQLERRM
    );
    RETURN FALSE;
END;
$$;