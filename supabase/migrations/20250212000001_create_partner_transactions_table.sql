-- Migration: Criar tabela de transações de parceiros
-- Tabela: partner_transactions
-- Histórico completo de todas as transações financeiras do parceiro

CREATE TABLE IF NOT EXISTS public.partner_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_payment', 'commission', 'refund', 'payout', 'adjustment')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  reservation_id UUID REFERENCES public.partner_reservations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  paid_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'BRL',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.partner_transactions IS 'Histórico completo de transações financeiras dos parceiros (assinaturas, comissões, repasses)';
COMMENT ON COLUMN public.partner_transactions.transaction_type IS 'Tipo: subscription_payment (assinatura), commission (comissão), refund (reembolso), payout (repasse), adjustment (ajuste)';
COMMENT ON COLUMN public.partner_transactions.amount IS 'Valor da transação (positivo para receita, negativo para despesa)';
COMMENT ON COLUMN public.partner_transactions.reservation_id IS 'ID da reserva relacionada (se aplicável)';
COMMENT ON COLUMN public.partner_transactions.metadata IS 'Dados adicionais em JSON (reservation_code, commission_rate, etc)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_transactions_partner_id ON public.partner_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_type ON public.partner_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_status ON public.partner_transactions(status);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_created_at ON public.partner_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_reservation_id ON public.partner_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_stripe_invoice ON public.partner_transactions(stripe_invoice_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_transactions_updated_at
BEFORE UPDATE ON public.partner_transactions
FOR EACH ROW
EXECUTE FUNCTION update_partner_transactions_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem ver suas próprias transações
CREATE POLICY "Partners can view their own transactions"
ON public.partner_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_transactions.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Admins podem ver todas as transações
CREATE POLICY "Admins can view all transactions"
ON public.partner_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Política: Sistema pode inserir transações (via service role)
CREATE POLICY "Service role can insert transactions"
ON public.partner_transactions
FOR INSERT
WITH CHECK (true); -- Service role bypassa RLS
