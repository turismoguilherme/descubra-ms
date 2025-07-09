-- Create missing tables and functions for the application

-- Create missing CAT checkins table
CREATE TABLE public.cat_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  latitude NUMERIC,
  longitude NUMERIC,
  distance_from_cat NUMERIC,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create city tour bookings table
CREATE TABLE public.city_tour_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  tour_date DATE NOT NULL,
  tour_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 10,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  meeting_point TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create city tour settings table
CREATE TABLE public.city_tour_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to tourism_intelligence_documents table
ALTER TABLE public.tourism_intelligence_documents 
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral',
ADD COLUMN IF NOT EXISTS uploader_name TEXT;

-- Enable RLS on new tables
ALTER TABLE public.cat_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_tour_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cat_checkins
CREATE POLICY "CAT checkins are viewable by managers" ON public.cat_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager', 'atendente')
    )
  );

CREATE POLICY "Attendants can create checkins" ON public.cat_checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'atendente')
    )
  );

-- Create RLS policies for city_tour_bookings
CREATE POLICY "City tour bookings are viewable by municipal managers" ON public.city_tour_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Municipal managers can manage city tour bookings" ON public.city_tour_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Create RLS policies for city_tour_settings
CREATE POLICY "City tour settings are viewable by municipal users" ON public.city_tour_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal', 'municipal_manager')
    )
  );

CREATE POLICY "Municipal managers can manage city tour settings" ON public.city_tour_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Create update triggers for updated_at columns
CREATE TRIGGER update_city_tour_bookings_updated_at
  BEFORE UPDATE ON public.city_tour_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_city_tour_settings_updated_at
  BEFORE UPDATE ON public.city_tour_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create the get_users_with_details function that TechnicalUserManager needs
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  user_type TEXT,
  role TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email,
    up.full_name,
    up.user_type,
    ur.role,
    ur.region,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
$$;