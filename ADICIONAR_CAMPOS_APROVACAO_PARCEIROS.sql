-- =====================================================
-- ADICIONAR CAMPOS DE APROVAÇÃO PARA PARCEIROS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Adicionar coluna approved_at (data/hora da aprovação)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'institutional_partners' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.institutional_partners
    ADD COLUMN approved_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN public.institutional_partners.approved_at IS 'Data/hora da aprovação do parceiro';
    
    RAISE NOTICE '✅ Coluna approved_at adicionada';
  ELSE
    RAISE NOTICE '✅ Coluna approved_at já existe';
  END IF;
END $$;

-- Adicionar coluna approved_by (quem aprovou)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'institutional_partners' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.institutional_partners
    ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN public.institutional_partners.approved_by IS 'ID do usuário que aprovou o parceiro';
    
    RAISE NOTICE '✅ Coluna approved_by adicionada';
  ELSE
    RAISE NOTICE '✅ Coluna approved_by já existe';
  END IF;
END $$;

-- Verificar colunas criadas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'institutional_partners'
AND column_name IN ('approved_at', 'approved_by')
ORDER BY column_name;


