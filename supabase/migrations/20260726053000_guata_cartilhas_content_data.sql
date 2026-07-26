-- Editable cartilha content (mascot, QR, texts) persisted in the cloud
ALTER TABLE public.guata_cartilhas
  ADD COLUMN IF NOT EXISTS content_data JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.guata_cartilhas.content_data IS
  'Editable snapshot for Guata Capacita HTML (mascots, QR URLs, texts, partners).';
