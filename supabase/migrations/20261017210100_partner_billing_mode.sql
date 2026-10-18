-- Modo de cobrança do parceiro: assinatura com trial (padrão) ou isento de mensalidade.

ALTER TABLE public.institutional_partners
ADD COLUMN IF NOT EXISTS billing_mode TEXT NOT NULL DEFAULT 'trial_monthly'
CHECK (billing_mode IN ('trial_monthly', 'exempt'));

COMMENT ON COLUMN public.institutional_partners.billing_mode IS
  'trial_monthly: mensalidade via Stripe (trial no link/preço); exempt: sem cobrança de mensalidade.';
