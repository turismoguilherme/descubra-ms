
-- Criar tabela de eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de detalhes dos eventos
CREATE TABLE public.event_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  official_name TEXT,
  exact_location TEXT,
  cover_image_url TEXT,
  video_url TEXT,
  detailed_description TEXT,
  schedule_info TEXT,
  event_type TEXT,
  registration_link TEXT,
  extra_info TEXT,
  map_latitude NUMERIC,
  map_longitude NUMERIC,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID,
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_details ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para events
CREATE POLICY "Everyone can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage events" 
  ON public.events 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

-- Políticas RLS para event_details
CREATE POLICY "Everyone can view event details" 
  ON public.event_details 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage event details" 
  ON public.event_details 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));

-- Índices para performance
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_event_details_event_id ON public.event_details(event_id);
