-- =====================================================
-- EXECUTAR ESTE SQL NO SUPABASE PARA ADICIONAR
-- CAMPOS DO STRIPE CONNECT E CPF/CNPJ
-- =====================================================
-- Stripe Connect para Parceiros do Descubra MS
-- Data: 24/12/2024
-- =====================================================

-- 1. Adicionar coluna stripe_account_id para Stripe Connect
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- 2. Adicionar tipo de pessoa (PF ou PJ)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institutional_partners' AND column_name = 'person_type') THEN
    ALTER TABLE public.institutional_partners ADD COLUMN person_type TEXT DEFAULT 'pj';
  END IF;
END $$;

-- 3. Adicionar CPF (para pessoa física)
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- 4. Adicionar CNPJ (para pessoa jurídica)
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- 5. Adicionar status do Stripe Connect
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institutional_partners' AND column_name = 'stripe_connect_status') THEN
    ALTER TABLE public.institutional_partners ADD COLUMN stripe_connect_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 6. Adicionar data de conexão do Stripe
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP WITH TIME ZONE;

-- 7. Criar índices
CREATE INDEX IF NOT EXISTS idx_partners_stripe_account_id 
ON public.institutional_partners(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_partners_cnpj 
ON public.institutional_partners(cnpj);

CREATE INDEX IF NOT EXISTS idx_partners_cpf 
ON public.institutional_partners(cpf);

-- 8. Adicionar campos de pagamento na tabela de reservas (se ainda não existirem)
ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);

ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2);

ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS partner_earnings DECIMAL(10, 2);

ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE public.partner_reservations 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- 9. Verificar se foi criado corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'institutional_partners' 
AND column_name IN ('stripe_account_id', 'person_type', 'cpf', 'cnpj', 'stripe_connect_status', 'stripe_connected_at');

-- 10. Verificar campos de pagamento nas reservas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'partner_reservations' 
AND column_name IN ('payment_status', 'payment_amount', 'platform_fee', 'partner_earnings', 'stripe_payment_intent_id');

