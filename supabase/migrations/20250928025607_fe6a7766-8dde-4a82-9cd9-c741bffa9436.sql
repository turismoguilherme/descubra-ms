-- Criar tabela de parceiros comerciais
CREATE TABLE public.commercial_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  business_type TEXT NOT NULL CHECK (business_type IN ('hotel', 'pousada', 'resort', 'agencia_turismo', 'restaurante', 'atrativo_turistico', 'transporte', 'guia_turismo', 'artesanato', 'evento', 'outro')),
  company_size TEXT NOT NULL DEFAULT 'small' CHECK (company_size IN ('micro', 'small', 'medium', 'large')),
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  website_url TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  services_offered TEXT[],
  target_audience TEXT[],
  price_range TEXT CHECK (price_range IN ('budget', 'mid_range', 'luxury', 'ultra_luxury')),
  operating_hours JSONB,
  seasonal_info JSONB,
  subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('pending', 'active', 'suspended', 'cancelled')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  monthly_fee NUMERIC DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de planos de assinatura
CREATE TABLE public.commercial_subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  yearly_price NUMERIC,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de métricas de uso
CREATE TABLE public.commercial_partner_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.commercial_partners(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('page_view', 'click', 'contact', 'booking', 'conversion')),
  metric_value NUMERIC NOT NULL DEFAULT 1,
  source TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_commercial_partners_business_type ON public.commercial_partners(business_type);
CREATE INDEX idx_commercial_partners_city ON public.commercial_partners(city);
CREATE INDEX idx_commercial_partners_subscription_plan ON public.commercial_partners(subscription_plan);
CREATE INDEX idx_commercial_partners_status ON public.commercial_partners(status);
CREATE INDEX idx_commercial_partners_featured ON public.commercial_partners(featured);
CREATE INDEX idx_commercial_partner_metrics_partner_id ON public.commercial_partner_metrics(partner_id);
CREATE INDEX idx_commercial_partner_metrics_type ON public.commercial_partner_metrics(metric_type);
CREATE INDEX idx_commercial_partner_metrics_recorded_at ON public.commercial_partner_metrics(recorded_at);

-- Habilitar RLS
ALTER TABLE public.commercial_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_partner_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para commercial_partners
CREATE POLICY "Parceiros comerciais são visualizáveis por todos"
ON public.commercial_partners
FOR SELECT
USING (status = 'approved' AND subscription_status = 'active');

CREATE POLICY "Parceiros podem gerenciar seus próprios dados"
ON public.commercial_partners
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Admins podem gerenciar todos os parceiros comerciais"
ON public.commercial_partners
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- Políticas RLS para planos de assinatura
CREATE POLICY "Planos são visualizáveis por todos autenticados"
ON public.commercial_subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar planos"
ON public.commercial_subscription_plans
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- Políticas RLS para métricas
CREATE POLICY "Parceiros podem ver suas próprias métricas"
ON public.commercial_partner_metrics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.commercial_partners cp
  WHERE cp.id = partner_id 
  AND cp.created_by = auth.uid()
));

CREATE POLICY "Admins podem ver todas as métricas"
ON public.commercial_partner_metrics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

CREATE POLICY "Sistema pode criar métricas"
ON public.commercial_partner_metrics
FOR INSERT
WITH CHECK (true);

-- Inserir planos padrão
INSERT INTO public.commercial_subscription_plans (plan_name, plan_type, monthly_price, yearly_price, features, limits) VALUES 
('Plano Básico', 'basic', 49.90, 499.00, 
 '["Listagem básica", "até 5 fotos", "Informações de contato", "Analytics básico"]'::jsonb,
 '{"photos": 5, "featured_days": 0, "priority_support": false}'::jsonb),
('Plano Premium', 'premium', 99.90, 999.00,
 '["Listagem destacada", "até 20 fotos", "Galeria de imagens", "Analytics avançado", "Suporte prioritário", "Badge verificado"]'::jsonb,
 '{"photos": 20, "featured_days": 10, "priority_support": true}'::jsonb),
('Plano Enterprise', 'enterprise', 199.90, 1999.00,
 '["Listagem premium", "Fotos ilimitadas", "Vídeos promocionais", "Analytics completo", "Consultoria dedicada", "API access", "White-label"]'::jsonb,
 '{"photos": -1, "featured_days": 30, "priority_support": true, "api_access": true}'::jsonb);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_commercial_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commercial_partners_updated_at
  BEFORE UPDATE ON public.commercial_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_commercial_partners_updated_at();