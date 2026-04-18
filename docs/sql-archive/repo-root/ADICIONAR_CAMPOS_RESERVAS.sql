-- =====================================================
-- ADICIONAR CAMPOS NECESSÁRIOS EM PARTNER_RESERVATIONS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Adicionar service_id (referência ao produto reservado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_reservations' 
    AND column_name = 'service_id'
  ) THEN
    ALTER TABLE public.partner_reservations
    ADD COLUMN service_id UUID REFERENCES public.partner_pricing(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_partner_reservations_service_id ON public.partner_reservations(service_id);
    
    RAISE NOTICE 'Campo service_id adicionado à tabela partner_reservations';
  ELSE
    RAISE NOTICE 'Campo service_id já existe';
  END IF;
END $$;

-- Adicionar stripe_payment_intent_id (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_reservations' 
    AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE public.partner_reservations
    ADD COLUMN stripe_payment_intent_id TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_partner_reservations_payment_intent ON public.partner_reservations(stripe_payment_intent_id);
    
    RAISE NOTICE 'Campo stripe_payment_intent_id adicionado';
  ELSE
    RAISE NOTICE 'Campo stripe_payment_intent_id já existe';
  END IF;
END $$;

-- Adicionar stripe_checkout_session_id (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_reservations' 
    AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE public.partner_reservations
    ADD COLUMN stripe_checkout_session_id TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_partner_reservations_checkout_session ON public.partner_reservations(stripe_checkout_session_id);
    
    RAISE NOTICE 'Campo stripe_checkout_session_id adicionado';
  ELSE
    RAISE NOTICE 'Campo stripe_checkout_session_id já existe';
  END IF;
END $$;

-- Adicionar campos de reembolso (se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_reservations' 
    AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE public.partner_reservations
    ADD COLUMN refund_amount NUMERIC(10,2),
    ADD COLUMN refund_percent NUMERIC(5,2),
    ADD COLUMN stripe_refund_id TEXT,
    ADD COLUMN refunded_at TIMESTAMPTZ;
    
    RAISE NOTICE 'Campos de reembolso adicionados';
  ELSE
    RAISE NOTICE 'Campos de reembolso já existem';
  END IF;
END $$;

-- Verificar estrutura final
SELECT 
  'Estrutura da tabela partner_reservations' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'partner_reservations'
  AND column_name IN ('service_id', 'stripe_payment_intent_id', 'stripe_checkout_session_id', 'refund_amount', 'refund_percent', 'stripe_refund_id', 'refunded_at')
ORDER BY column_name;


