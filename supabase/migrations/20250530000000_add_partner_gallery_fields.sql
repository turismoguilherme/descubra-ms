-- Migration: Adicionar campos de galeria, vídeo e desconto para parceiros
-- Tabela: institutional_partners

-- Adicionar campo para galeria de imagens (array de URLs)
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Adicionar campo para URL do vídeo do YouTube
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Adicionar campo para oferta de desconto (preenchido pelo admin)
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS discount_offer TEXT;

-- Adicionar campo para endereço completo
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS address TEXT;

-- Adicionar campo para telefone
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.institutional_partners.gallery_images IS 'Array de URLs das fotos do parceiro (máximo 5)';
COMMENT ON COLUMN public.institutional_partners.youtube_url IS 'URL do vídeo promocional do YouTube';
COMMENT ON COLUMN public.institutional_partners.discount_offer IS 'Descrição da oferta/desconto para o Passaporte Digital (preenchido pelo admin)';
COMMENT ON COLUMN public.institutional_partners.address IS 'Endereço completo do estabelecimento';
COMMENT ON COLUMN public.institutional_partners.contact_phone IS 'Telefone de contato';

-- Criar bucket de storage para imagens dos parceiros (se não existir)
-- Nota: Isso deve ser executado no Supabase Dashboard ou via API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('partner-images', 'partner-images', true)
-- ON CONFLICT (id) DO NOTHING;

