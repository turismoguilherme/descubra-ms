-- Footer Viajar (marketing Guatá Labs): substituir copyright legado "Descubra Mato Grosso do Sul".

UPDATE public.site_settings
SET
  setting_value = jsonb_set(
    COALESCE(setting_value, '{}'::jsonb),
    '{copyright}',
    to_jsonb(
      '© ' || to_char(timezone('UTC', now()), 'YYYY') || ' Guatá Labs. Todos os direitos reservados.'
    ),
    true
  ),
  updated_at = timezone('UTC', now())
WHERE platform = 'viajar'
  AND setting_key = 'footer'
  AND COALESCE(setting_value->>'copyright', '') ILIKE '%descubra%mato%grosso%sul%';
