-- Limpa textos embaralhados do Guatá Capacita (mantém logos, mascote e QR).
-- Rode no SQL Editor do Supabase (PRODUCTION).

UPDATE public.guata_cartilhas
SET
  content_data = jsonb_set(
    COALESCE(content_data, '{}'::jsonb),
    '{texts}',
    '{}'::jsonb
  ),
  updated_at = now()
WHERE slug = 'guata-capacita';

-- Conferência:
-- select slug, content_data->'texts' as texts, content_data->'mascots' as mascots,
--        jsonb_array_length(COALESCE(content_data->'partners', '[]'::jsonb)) as partners,
--        content_data->'qr' as qr
-- from guata_cartilhas where slug = 'guata-capacita';
