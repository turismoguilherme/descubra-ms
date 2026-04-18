-- =====================================================
-- ADICIONAR CAMPO DE VÍDEO (YOUTUBE_URL) EM PARTNER_PRICING
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Adicionar campo youtube_url (URL do vídeo do produto)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_pricing' 
    AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE public.partner_pricing
    ADD COLUMN youtube_url TEXT;
    
    COMMENT ON COLUMN public.partner_pricing.youtube_url IS 'URL do vídeo promocional do YouTube para este produto/serviço';
    
    RAISE NOTICE 'Campo youtube_url adicionado à tabela partner_pricing';
  ELSE
    RAISE NOTICE 'Campo youtube_url já existe';
  END IF;
END $$;

-- Verificar estrutura
SELECT 
  'Estrutura da tabela partner_pricing' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'partner_pricing'
  AND column_name IN ('youtube_url', 'gallery_images')
ORDER BY column_name;

