-- Migration: Adicionar campos de assinatura Stripe para parceiros institucionais
-- Tabela: institutional_partners

-- Adicionar campos de assinatura Stripe
ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'trialing', 'past_due', 'canceled', 'unpaid')),
ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_accepted_version INTEGER DEFAULT 1;

-- Comentários
COMMENT ON COLUMN public.institutional_partners.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN public.institutional_partners.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN public.institutional_partners.subscription_status IS 'Status da assinatura: pending, active, trialing, past_due, canceled, unpaid';
COMMENT ON COLUMN public.institutional_partners.monthly_fee IS 'Valor mensal da assinatura em R$';
COMMENT ON COLUMN public.institutional_partners.commission_rate IS 'Percentual de comissão sobre reservas (0-100)';
COMMENT ON COLUMN public.institutional_partners.terms_accepted_at IS 'Data/hora de aceite do termo de parceria';
COMMENT ON COLUMN public.institutional_partners.terms_accepted_version IS 'Versão do termo aceito';

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_institutional_partners_stripe_subscription ON public.institutional_partners(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_institutional_partners_subscription_status ON public.institutional_partners(subscription_status);


















