INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('guata_navbar_logo_url', '', 'image', 'Guatá Labs — URL da logo no header (vazio = logo padrão do app)', true)
ON CONFLICT (content_key) DO UPDATE SET
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  is_active = EXCLUDED.is_active,
  updated_at = now();
