
-- Create user roles table with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'tech', 'municipal', 'atendente', 'gestor', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create security audit log table
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create content audit log table
CREATE TABLE public.content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create destination details table
CREATE TABLE public.destination_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  promotional_text TEXT,
  video_url TEXT,
  video_type TEXT CHECK (video_type IN ('youtube', 'upload')),
  map_latitude DECIMAL,
  map_longitude DECIMAL,
  tourism_tags TEXT[],
  image_gallery TEXT[],
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(destination_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_details ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::TEXT FROM public.user_roles WHERE user_id = check_user_id LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to check if user is admin/tech
CREATE OR REPLACE FUNCTION public.is_admin_or_tech(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'tech')
  );
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin_or_tech(auth.uid()));

-- Create RLS policies for audit logs (admin/tech only)
CREATE POLICY "Admins can view security logs" ON public.security_audit_log
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "System can insert security logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view content logs" ON public.content_audit_log
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "System can insert content logs" ON public.content_audit_log
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for destinations (public read, admin write)
CREATE POLICY "Public can view destinations" ON public.destinations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- Create RLS policies for destination details (public read, admin write)
CREATE POLICY "Public can view destination details" ON public.destination_details
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destination details" ON public.destination_details
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    success,
    error_message,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_success,
    p_error_message,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
