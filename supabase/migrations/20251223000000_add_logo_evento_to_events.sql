-- Migration para adicionar coluna logo_evento na tabela events
-- Data: 2025-12-23

-- Adicionar coluna logo_evento para armazenar URL da imagem do logotipo
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS logo_evento TEXT;

-- Comentário na coluna
COMMENT ON COLUMN events.logo_evento IS 'URL da imagem do logotipo do evento (armazenado no Supabase Storage)';

