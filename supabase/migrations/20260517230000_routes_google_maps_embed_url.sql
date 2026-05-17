-- Google My Maps embed URL for passport route interactive map
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT;

COMMENT ON COLUMN public.routes.google_maps_embed_url IS
  'URL de incorporação do Google My Maps (maps/d/embed?mid=...) exibida no passaporte digital';
