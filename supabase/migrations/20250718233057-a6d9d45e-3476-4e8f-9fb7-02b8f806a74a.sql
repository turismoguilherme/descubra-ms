
-- Tabela de clientes FlowTrip (estados contratantes)
CREATE TABLE public.flowtrip_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id UUID REFERENCES public.flowtrip_states(id),
  client_name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100),
  contact_email TEXT,
  contact_phone TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de planos e assinaturas
CREATE TABLE public.flowtrip_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  plan_type VARCHAR(20) DEFAULT 'basic',
  monthly_fee NUMERIC DEFAULT 0,
  max_users INTEGER DEFAULT 100,
  max_destinations INTEGER DEFAULT 50,
  features JSONB DEFAULT '{}',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  next_billing_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de faturas
CREATE TABLE public.flowtrip_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  subscription_id UUID REFERENCES public.flowtrip_subscriptions(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de métricas de uso
CREATE TABLE public.flowtrip_usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de tickets de suporte
CREATE TABLE public.flowtrip_support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de configurações white-label
CREATE TABLE public.flowtrip_white_label_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, config_key)
);

-- Tabela de steps de onboarding
CREATE TABLE public.flowtrip_onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.flowtrip_clients(id),
  step_name VARCHAR(100) NOT NULL,
  step_description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_sequence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.flowtrip_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para FlowTrip admins
CREATE POLICY "FlowTrip admins can manage all clients"
  ON public.flowtrip_clients
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can manage all subscriptions"
  ON public.flowtrip_subscriptions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can manage all invoices"
  ON public.flowtrip_invoices
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can view all metrics"
  ON public.flowtrip_usage_metrics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can manage support tickets"
  ON public.flowtrip_support_tickets
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can manage white-label configs"
  ON public.flowtrip_white_label_configs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "FlowTrip admins can manage onboarding steps"
  ON public.flowtrip_onboarding_steps
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

-- Políticas para clientes verem seus próprios dados
CREATE POLICY "State users can view their client data"
  ON public.flowtrip_clients
  FOR SELECT
  USING (state_id IN (
    SELECT state_id FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('diretor_estadual', 'gestor_igr')
  ));

-- Triggers para updated_at
CREATE TRIGGER update_flowtrip_clients_updated_at
  BEFORE UPDATE ON public.flowtrip_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flowtrip_subscriptions_updated_at
  BEFORE UPDATE ON public.flowtrip_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flowtrip_support_tickets_updated_at
  BEFORE UPDATE ON public.flowtrip_support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flowtrip_white_label_configs_updated_at
  BEFORE UPDATE ON public.flowtrip_white_label_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir cliente de exemplo (MS)
INSERT INTO public.flowtrip_clients (
  state_id,
  client_name,
  contact_name,
  contact_email,
  contact_phone,
  contract_start_date,
  contract_end_date,
  status
) VALUES (
  (SELECT id FROM public.flowtrip_states WHERE code = 'MS' LIMIT 1),
  'Estado de Mato Grosso do Sul',
  'Secretaria de Turismo MS',
  'turismo@ms.gov.br',
  '(67) 3318-7600',
  '2024-01-01',
  '2024-12-31',
  'active'
);

-- Inserir assinatura de exemplo (MS)
INSERT INTO public.flowtrip_subscriptions (
  client_id,
  plan_type,
  monthly_fee,
  max_users,
  max_destinations,
  features,
  billing_cycle,
  next_billing_date,
  status
) VALUES (
  (SELECT id FROM public.flowtrip_clients WHERE client_name = 'Estado de Mato Grosso do Sul' LIMIT 1),
  'premium',
  15000.00,
  1000,
  200,
  '{"ai_assistant": true, "passport_system": true, "cat_management": true, "analytics": true, "white_label": true}',
  'monthly',
  '2024-02-01',
  'active'
);
