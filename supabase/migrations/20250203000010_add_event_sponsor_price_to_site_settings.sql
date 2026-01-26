-- Adicionar campo para preço configurável de eventos em destaque
-- Este campo permite configurar o valor exibido na plataforma sem precisar alterar no Stripe

INSERT INTO public.site_settings (platform, setting_key, setting_value, description, updated_at)
VALUES (
  'ms',
  'event_sponsor_price',
  '499.90',
  'Preço exibido para eventos em destaque (em reais, formato: 499.90)',
  NOW()
)
ON CONFLICT (platform, setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

