
-- Tabela de controle de visibilidade das seções da landing page
CREATE TABLE public.viajar_section_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de métricas configuráveis
CREATE TABLE public.viajar_metrics_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  metric_key TEXT NOT NULL UNIQUE,
  display_value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_projected BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.viajar_section_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajar_metrics_config ENABLE ROW LEVEL SECURITY;

-- Public read access (landing page needs to read these)
CREATE POLICY "Anyone can read section controls"
  ON public.viajar_section_controls FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read metrics config"
  ON public.viajar_metrics_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage section controls"
  ON public.viajar_section_controls FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage metrics config"
  ON public.viajar_metrics_config FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_viajar_controls_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER update_viajar_section_controls_updated_at
  BEFORE UPDATE ON public.viajar_section_controls
  FOR EACH ROW EXECUTE FUNCTION public.update_viajar_controls_updated_at();

CREATE TRIGGER update_viajar_metrics_config_updated_at
  BEFORE UPDATE ON public.viajar_metrics_config
  FOR EACH ROW EXECUTE FUNCTION public.update_viajar_controls_updated_at();

-- Seed: seções padrão (todas desativadas por segurança)
INSERT INTO public.viajar_section_controls (section_key, section_title, is_active) VALUES
  ('hero_stats', 'Estatísticas do Hero', false),
  ('what_we_do', 'O que a ViajARTur Faz', true),
  ('platform_in_action', 'Plataforma em Ação', true),
  ('benefits', 'Benefícios', true),
  ('benefits_stats', 'Estatísticas de Benefícios (Resultados)', false),
  ('success_cases', 'Cases de Sucesso', true),
  ('video_section', 'Seção de Vídeo', false),
  ('cta_section', 'Seção CTA Final', true);

-- Seed: métricas do hero (desativadas)
INSERT INTO public.viajar_metrics_config (section_key, metric_key, display_value, label, is_active, is_projected, display_order) VALUES
  ('hero_stats', 'hero_users', '+100K', 'Usuários', false, true, 1),
  ('hero_stats', 'hero_satisfaction', '98%', 'Satisfação', false, true, 2),
  ('hero_stats', 'hero_ai', 'IA 24/7', 'Disponível', false, false, 3);

-- Seed: métricas dos benefícios (desativadas)
INSERT INTO public.viajar_metrics_config (section_key, metric_key, display_value, label, is_active, is_projected, display_order) VALUES
  ('benefits_stats', 'benefits_efficiency', '300%', 'Aumento na eficiência', false, true, 1),
  ('benefits_stats', 'benefits_cost', '85%', 'Redução de custos', false, true, 2),
  ('benefits_stats', 'benefits_ai', '24/7', 'Suporte IA', false, false, 3),
  ('benefits_stats', 'benefits_destinations', '50+', 'Destinos atendidos', false, true, 4);
