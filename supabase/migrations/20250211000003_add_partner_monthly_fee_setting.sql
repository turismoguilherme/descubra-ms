-- Migration: Adicionar configuração de valor mensal para parceiros
-- Tabela: site_settings

-- Inserir configuração padrão de valor mensal para parceiros
INSERT INTO public.site_settings (platform, setting_key, setting_value, description)
VALUES (
  'ms',
  'partner_monthly_fee',
  '299.00'::jsonb,
  'Valor mensal da assinatura para parceiros do Descubra MS (em R$)'
)
ON CONFLICT (platform, setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

COMMENT ON TABLE public.site_settings IS 'Configurações do site por plataforma. Use partner_monthly_fee para configurar valor mensal dos parceiros.';

