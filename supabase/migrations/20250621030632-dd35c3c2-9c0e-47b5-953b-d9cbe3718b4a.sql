
-- Criar tabela para agendamentos de city tours
CREATE TABLE public.city_tour_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  tour_date DATE NOT NULL,
  tour_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 30,
  current_bookings INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  meeting_point TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  manager_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para configurações de city tours
CREATE TABLE public.city_tour_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  manager_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.city_tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_tour_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para city_tour_bookings
CREATE POLICY "Admins can manage city tour bookings" 
  ON public.city_tour_bookings 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Public can view active city tour bookings" 
  ON public.city_tour_bookings 
  FOR SELECT 
  USING (is_active = true);

-- Políticas RLS para city_tour_settings
CREATE POLICY "Admins can manage city tour settings" 
  ON public.city_tour_settings 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Public can view public settings" 
  ON public.city_tour_settings 
  FOR SELECT 
  USING (is_public = true);
