
-- Phase 1: Critical RLS Policy Implementation (Fixed)

-- Fix tourist_routes table policies
DROP POLICY IF EXISTS "Public read access for tourist_routes" ON public.tourist_routes;
DROP POLICY IF EXISTS "Authenticated users can modify tourist_routes" ON public.tourist_routes;
DROP POLICY IF EXISTS "Anyone can view active tourist routes" ON public.tourist_routes;
DROP POLICY IF EXISTS "Authenticated users can create tourist routes" ON public.tourist_routes;
DROP POLICY IF EXISTS "Route creators can update their routes" ON public.tourist_routes;
DROP POLICY IF EXISTS "Route creators can delete their routes" ON public.tourist_routes;

CREATE POLICY "Anyone can view active tourist routes" ON public.tourist_routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create tourist routes" ON public.tourist_routes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Route creators can update their routes" ON public.tourist_routes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Route creators can delete their routes" ON public.tourist_routes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Fix route_checkpoints table policies
DROP POLICY IF EXISTS "Anyone can view route checkpoints" ON public.route_checkpoints;
DROP POLICY IF EXISTS "Authenticated users can create checkpoints" ON public.route_checkpoints;
DROP POLICY IF EXISTS "Route owners can update checkpoints" ON public.route_checkpoints;
DROP POLICY IF EXISTS "Route owners can delete checkpoints" ON public.route_checkpoints;

CREATE POLICY "Anyone can view route checkpoints" ON public.route_checkpoints
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create checkpoints" ON public.route_checkpoints
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.tourist_routes 
      WHERE id = route_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Route owners can update checkpoints" ON public.route_checkpoints
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.tourist_routes 
      WHERE id = route_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Route owners can delete checkpoints" ON public.route_checkpoints
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.tourist_routes 
      WHERE id = route_id AND created_by = auth.uid()
    )
  );

-- Fix user_passport_stats table policies
DROP POLICY IF EXISTS "Users can view their own passport stats" ON public.user_passport_stats;
DROP POLICY IF EXISTS "Users can insert their own passport stats" ON public.user_passport_stats;
DROP POLICY IF EXISTS "Users can update their own passport stats" ON public.user_passport_stats;

CREATE POLICY "Users can view their own passport stats" ON public.user_passport_stats
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passport stats" ON public.user_passport_stats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passport stats" ON public.user_passport_stats
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix collaborators table policies
DROP POLICY IF EXISTS "Authenticated users can view collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Authenticated users can manage collaborators" ON public.collaborators;

CREATE POLICY "Authenticated users can view collaborators" ON public.collaborators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage collaborators" ON public.collaborators
  FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- Fix secretary_files table policies
DROP POLICY IF EXISTS "Authenticated users can view secretary files" ON public.secretary_files;
DROP POLICY IF EXISTS "File owners can manage their files" ON public.secretary_files;

CREATE POLICY "Authenticated users can view secretary files" ON public.secretary_files
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "File owners can manage their files" ON public.secretary_files
  FOR ALL TO authenticated USING (auth.uid() = uploaded_by);

-- Fix city_tour_bookings table policies
DROP POLICY IF EXISTS "Anyone can view active city tour bookings" ON public.city_tour_bookings;
DROP POLICY IF EXISTS "Managers can manage city tour bookings" ON public.city_tour_bookings;

CREATE POLICY "Anyone can view active city tour bookings" ON public.city_tour_bookings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Managers can manage city tour bookings" ON public.city_tour_bookings
  FOR ALL TO authenticated USING (auth.uid() = manager_id);

-- Create user roles system for proper admin authentication (only if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE public.user_role_type AS ENUM ('admin', 'municipal', 'tech', 'atendente', 'gestor', 'user');
  END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role_type NOT NULL DEFAULT 'user',
  region TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS user_role_type
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = check_user_id LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, required_role user_role_type)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = required_role
  );
$$;

-- RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, success, error_message, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_success, p_error_message, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
