-- Security Enhancement: Admin User Seeding and Password Reset Support

-- Create function to safely create initial admin user
CREATE OR REPLACE FUNCTION public.create_initial_admin_user(
  admin_email text,
  admin_password text,
  admin_name text DEFAULT 'System Administrator'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  existing_admin_count int;
BEGIN
  -- Check if any admin users already exist
  SELECT COUNT(*) INTO existing_admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Only create if no admins exist
  IF existing_admin_count > 0 THEN
    RAISE NOTICE 'Admin users already exist. Skipping creation.';
    RETURN false;
  END IF;
  
  -- Create the user in auth.users (this would typically be done via Supabase Auth API)
  -- For now, we'll just create the profile and role entries
  
  -- Generate a UUID for the admin user
  new_user_id := gen_random_uuid();
  
  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    admin_name,
    admin_name,
    'administrator',
    now(),
    now()
  );
  
  -- Assign admin role
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    created_by
  ) VALUES (
    new_user_id,
    'admin',
    now(),
    new_user_id
  );
  
  -- Log the admin creation
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'initial_admin_user_created',
    new_user_id,
    true,
    now()
  );
  
  RAISE NOTICE 'Initial admin user profile created with ID: %', new_user_id;
  RETURN true;
END;
$$;

-- Create function to validate password reset tokens (for future implementation)
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(
  token_hash text,
  user_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder for password reset token validation
  -- In a real implementation, you would check against a password_reset_tokens table
  -- with expiration times and usage tracking
  
  -- Log password reset attempt
  INSERT INTO public.security_audit_log (
    action,
    success,
    error_message,
    created_at
  ) VALUES (
    'password_reset_token_validation',
    false,
    'Password reset system not yet implemented',
    now()
  );
  
  RETURN false;
END;
$$;

-- Create table for storing password reset tokens (for future implementation)
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT password_reset_tokens_expires_check 
    CHECK (expires_at > created_at)
);

-- Enable RLS on password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow the system to manage password reset tokens
CREATE POLICY "System can manage password reset tokens"
ON public.password_reset_tokens
FOR ALL
USING (false); -- No user access through RLS

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
ON public.password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash 
ON public.password_reset_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
ON public.password_reset_tokens(expires_at);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_initial_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_reset_token TO authenticated;