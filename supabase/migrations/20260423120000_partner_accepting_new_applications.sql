-- Novos cadastros de parceiro institucional (página pública). Default: aceitando.
INSERT INTO public.site_settings (platform, setting_key, setting_value, description)
VALUES (
  'ms',
  'partner_accepting_new_applications',
  to_jsonb(true),
  'Quando false, novos cadastros na página Seja um Parceiro são bloqueados; quem retoma com ?partner_id=&step= continua.'
)
ON CONFLICT (platform, setting_key) DO NOTHING;
