-- Adicionar campos para Stripe Connect e documentos do parceiro
-- Migração: 20251224000001_add_stripe_connect_partner_fields.sql

-- 1. Adicionar coluna stripe_account_id para Stripe Connect
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- 2. Adicionar tipo de pessoa (PF ou PJ)
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'pj' CHECK (person_type IN ('pf', 'pj'));

-- 3. Adicionar CPF (para pessoa física)
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- 4. Adicionar CNPJ (para pessoa jurídica)
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- 5. Adicionar status do Stripe Connect
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'pending' 
CHECK (stripe_connect_status IN ('pending', 'connected', 'restricted', 'disabled'));

-- 6. Adicionar data de conexão do Stripe
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP WITH TIME ZONE;

-- 7. Criar índice para busca por stripe_account_id
CREATE INDEX IF NOT EXISTS idx_partners_stripe_account_id 
ON public.institutional_partners(stripe_account_id);

-- 8. Criar índice para busca por CNPJ
CREATE INDEX IF NOT EXISTS idx_partners_cnpj 
ON public.institutional_partners(cnpj);

-- 9. Criar índice para busca por CPF
CREATE INDEX IF NOT EXISTS idx_partners_cpf 
ON public.institutional_partners(cpf);

-- Comentários descritivos
COMMENT ON COLUMN public.institutional_partners.stripe_account_id IS 'ID da conta Stripe Connect do parceiro';
COMMENT ON COLUMN public.institutional_partners.person_type IS 'Tipo de pessoa: pf (física) ou pj (jurídica)';
COMMENT ON COLUMN public.institutional_partners.cpf IS 'CPF do parceiro (se pessoa física)';
COMMENT ON COLUMN public.institutional_partners.cnpj IS 'CNPJ do parceiro (se pessoa jurídica)';
COMMENT ON COLUMN public.institutional_partners.stripe_connect_status IS 'Status da conta Stripe Connect: pending, connected, restricted, disabled';
COMMENT ON COLUMN public.institutional_partners.stripe_connected_at IS 'Data/hora em que o parceiro conectou sua conta Stripe';

