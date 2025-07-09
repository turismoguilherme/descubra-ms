-- Criar funções que estão faltando no banco de dados

-- Função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_action TEXT,
  event_user_id UUID DEFAULT NULL,
  event_success BOOLEAN DEFAULT true,
  event_error_message TEXT DEFAULT NULL,
  event_ip_address TEXT DEFAULT NULL,
  event_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    event_ip_address::inet,
    event_user_agent
  );
  
  SELECT TRUE;
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$$;

-- Criar tabela cat_locations que está faltando
CREATE TABLE public.cat_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  region TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_phone TEXT,
  contact_email TEXT,
  working_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cat_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policy para cat_locations
CREATE POLICY "CAT locations are publicly readable" ON public.cat_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Managers can manage CAT locations" ON public.cat_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_cat_locations_updated_at
  BEFORE UPDATE ON public.cat_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_cat_locations_city ON public.cat_locations(city);
CREATE INDEX idx_cat_locations_region ON public.cat_locations(region);