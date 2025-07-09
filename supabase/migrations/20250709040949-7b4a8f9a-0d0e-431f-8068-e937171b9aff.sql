-- Create core tables for the tourism platform

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  user_type TEXT CHECK (user_type IN ('tourist', 'resident', 'collaborator', 'guide')),
  region TEXT,
  city TEXT,
  phone TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tech', 'municipal_manager', 'cat_attendant', 'collaborator', 'user')),
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Destinations table
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Destination details table
CREATE TABLE public.destination_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  promotional_text TEXT,
  video_url TEXT,
  video_type TEXT CHECK (video_type IN ('youtube', 'upload')),
  map_latitude DECIMAL,
  map_longitude DECIMAL,
  tourism_tags TEXT[],
  image_gallery TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  visibility_end_date TIMESTAMPTZ,
  is_visible BOOLEAN DEFAULT true,
  auto_hide BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Event details table
CREATE TABLE public.event_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  official_name TEXT,
  exact_location TEXT,
  cover_image_url TEXT,
  video_url TEXT,
  detailed_description TEXT,
  schedule_info TEXT,
  event_type TEXT,
  registration_link TEXT,
  extra_info TEXT,
  map_latitude DECIMAL,
  map_longitude DECIMAL,
  is_free BOOLEAN DEFAULT false,
  visibility_end_date TIMESTAMPTZ,
  auto_hide BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Security audit log table
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content audit log table
CREATE TABLE public.content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_duration INTERVAL,
  distance_km DECIMAL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Route checkpoints table
CREATE TABLE public.route_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  order_sequence INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital passport stamps table
CREATE TABLE public.passport_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  destination_id UUID REFERENCES destinations(id),
  route_id UUID REFERENCES routes(id),
  checkpoint_id UUID REFERENCES route_checkpoints(id),
  stamp_type TEXT CHECK (stamp_type IN ('destination', 'checkpoint', 'route_completion')),
  latitude DECIMAL,
  longitude DECIMAL,
  stamped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_stamps ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies

-- User profiles: users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Destinations: public read, admin write
CREATE POLICY "Destinations are publicly readable" ON public.destinations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Destination details: public read, admin write
CREATE POLICY "Destination details are publicly readable" ON public.destination_details
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destination details" ON public.destination_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Events: public read, admin write
CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Event details: public read, admin write
CREATE POLICY "Event details are publicly readable" ON public.event_details
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage event details" ON public.event_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Routes: public read, admin write
CREATE POLICY "Routes are publicly readable" ON public.routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Route checkpoints: public read, admin write
CREATE POLICY "Checkpoints are publicly readable" ON public.route_checkpoints
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage checkpoints" ON public.route_checkpoints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Passport stamps: users can only see and create their own stamps
CREATE POLICY "Users can view own stamps" ON public.passport_stamps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stamps" ON public.passport_stamps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs: only admins can view
CREATE POLICY "Admins can view security logs" ON public.security_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can view content logs" ON public.content_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- User roles: admins can manage
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles existing_roles
      WHERE existing_roles.user_id = auth.uid() 
      AND existing_roles.role IN ('admin', 'tech')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_destinations_region ON public.destinations(region);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_visibility ON public.events(is_visible, visibility_end_date);
CREATE INDEX idx_route_checkpoints_route_id ON public.route_checkpoints(route_id);
CREATE INDEX idx_passport_stamps_user_id ON public.passport_stamps(user_id);
CREATE INDEX idx_security_audit_created_at ON public.security_audit_log(created_at);
CREATE INDEX idx_content_audit_timestamp ON public.content_audit_log(timestamp);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destination_details_updated_at
  BEFORE UPDATE ON public.destination_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_details_updated_at
  BEFORE UPDATE ON public.event_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();