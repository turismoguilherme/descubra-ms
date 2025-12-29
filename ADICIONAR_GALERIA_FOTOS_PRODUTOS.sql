-- =====================================================
-- ADICIONAR CAMPO DE GALERIA DE FOTOS EM PARTNER_PRICING
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Adicionar campo gallery_images (array de URLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_pricing' 
    AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE public.partner_pricing
    ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
    
    COMMENT ON COLUMN public.partner_pricing.gallery_images IS 'Array de URLs das fotos do produto/serviço (máximo 5 fotos). Primeira foto é a foto principal.';
    
    RAISE NOTICE 'Campo gallery_images adicionado à tabela partner_pricing';
  ELSE
    RAISE NOTICE 'Campo gallery_images já existe';
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
  AND column_name = 'gallery_images';

