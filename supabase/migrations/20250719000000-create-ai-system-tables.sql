-- Tabela para ações da IA
CREATE TABLE public.flowtrip_ai_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('support', 'system', 'client', 'security', 'analytics')),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  metadata JSONB DEFAULT '{}'
);

-- Tabela para relatórios gerados pela IA
CREATE TABLE public.flowtrip_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generated_by TEXT DEFAULT 'ai',
  client_id UUID REFERENCES public.flowtrip_clients(id),
  metadata JSONB DEFAULT '{}'
);

-- Tabela para configurações da IA
CREATE TABLE public.flowtrip_ai_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para logs de monitoramento do sistema
CREATE TABLE public.flowtrip_system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_type TEXT NOT NULL CHECK (log_type IN ('performance', 'security', 'error', 'warning', 'info')),
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela para métricas de performance
CREATE TABLE public.flowtrip_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  component TEXT,
  client_id UUID REFERENCES public.flowtrip_clients(id)
);

-- Habilitar RLS
ALTER TABLE public.flowtrip_ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowtrip_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admins
CREATE POLICY "Admins can manage all AI actions"
  ON public.flowtrip_ai_actions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "Admins can manage all reports"
  ON public.flowtrip_reports
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "Admins can manage AI config"
  ON public.flowtrip_ai_config
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "Admins can view system logs"
  ON public.flowtrip_system_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

CREATE POLICY "Admins can view performance metrics"
  ON public.flowtrip_performance_metrics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  ));

-- Políticas para clientes verem seus próprios relatórios
CREATE POLICY "Clients can view their reports"
  ON public.flowtrip_reports
  FOR SELECT
  USING (client_id IN (
    SELECT state_id FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('diretor_estadual', 'gestor_igr')
  ));

-- Triggers para updated_at
CREATE TRIGGER update_flowtrip_ai_config_updated_at
  BEFORE UPDATE ON public.flowtrip_ai_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão da IA
INSERT INTO public.flowtrip_ai_config (config_key, config_value, description) VALUES
('ai_personality', '{"personality": "professional", "responseStyle": "friendly", "autoRespond": true, "autoResolve": true, "escalationThreshold": 3}', 'Configurações de personalidade da IA'),
('ai_responses', '{"templates": {"high_priority": "Olá! Entendi que você está enfrentando uma situação urgente. Não se preocupe, estou aqui para ajudar!", "medium_priority": "Oi! Obrigado por entrar em contato conosco! Analisei sua solicitação e já estou trabalhando nela.", "low_priority": "Oi! Tudo bem? Vi sua mensagem e já estou cuidando disso para você!"}}', 'Templates de resposta da IA'),
('ai_monitoring', '{"enabled": true, "checkInterval": 300, "autoResolve": true, "alertThreshold": 0.8}', 'Configurações de monitoramento automático'),
('ai_analytics', '{"enabled": true, "reportGeneration": "monthly", "clientAnalysis": true, "performanceTracking": true}', 'Configurações de analytics da IA');

-- Criar índices para performance
CREATE INDEX idx_flowtrip_ai_actions_type ON public.flowtrip_ai_actions(type);
CREATE INDEX idx_flowtrip_ai_actions_status ON public.flowtrip_ai_actions(status);
CREATE INDEX idx_flowtrip_ai_actions_created_at ON public.flowtrip_ai_actions(created_at);
CREATE INDEX idx_flowtrip_reports_type ON public.flowtrip_reports(report_type);
CREATE INDEX idx_flowtrip_reports_generated_at ON public.flowtrip_reports(generated_at);
CREATE INDEX idx_flowtrip_system_logs_type ON public.flowtrip_system_logs(log_type);
CREATE INDEX idx_flowtrip_system_logs_severity ON public.flowtrip_system_logs(severity);
CREATE INDEX idx_flowtrip_performance_metrics_name ON public.flowtrip_performance_metrics(metric_name);
CREATE INDEX idx_flowtrip_performance_metrics_recorded_at ON public.flowtrip_performance_metrics(recorded_at);

-- Função para log automático de ações da IA
CREATE OR REPLACE FUNCTION log_ai_action(
  p_type TEXT,
  p_action TEXT,
  p_description TEXT,
  p_result JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO public.flowtrip_ai_actions (type, action, description, status, result)
  VALUES (p_type, p_action, p_description, 'completed', p_result)
  RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Função para log de sistema
CREATE OR REPLACE FUNCTION log_system_event(
  p_log_type TEXT,
  p_component TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.flowtrip_system_logs (log_type, component, message, severity, metadata)
  VALUES (p_log_type, p_component, p_message, p_severity, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Função para registrar métricas de performance
CREATE OR REPLACE FUNCTION record_performance_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_unit TEXT DEFAULT NULL,
  p_component TEXT DEFAULT NULL,
  p_client_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.flowtrip_performance_metrics (metric_name, metric_value, unit, component, client_id)
  VALUES (p_metric_name, p_metric_value, p_unit, p_component, p_client_id)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$; 