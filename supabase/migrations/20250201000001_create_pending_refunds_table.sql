-- Criar tabela para armazenar reembolsos pendentes (processamento manual)
CREATE TABLE IF NOT EXISTS pending_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES partner_reservations(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES institutional_partners(id) ON DELETE CASCADE,
  
  -- Informações do reembolso
  refund_amount DECIMAL(10, 2) NOT NULL,
  refund_percent INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Informações do pagamento Stripe
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, processed, cancelled, failed
  reason TEXT, -- Motivo do cancelamento
  
  -- Metadados
  days_until_reservation INTEGER, -- Dias até a reserva quando foi cancelada
  reservation_code TEXT,
  
  -- Controle de processamento
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  stripe_refund_id TEXT, -- ID do reembolso no Stripe após processamento
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Notas do admin
  admin_notes TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_refunds_reservation_id ON pending_refunds(reservation_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_partner_id ON pending_refunds(partner_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_status ON pending_refunds(status);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_created_at ON pending_refunds(created_at DESC);

-- RLS Policies
ALTER TABLE pending_refunds ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os reembolsos
-- CORRIGIDO: Usar user_roles em vez de user_profiles.role
CREATE POLICY "Admins can view all pending refunds"
  ON pending_refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Admins podem inserir reembolsos pendentes
-- CORRIGIDO: Usar user_roles em vez de user_profiles.role
CREATE POLICY "Admins can insert pending refunds"
  ON pending_refunds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Admins podem atualizar reembolsos pendentes
-- CORRIGIDO: Usar user_roles em vez de user_profiles.role
CREATE POLICY "Admins can update pending refunds"
  ON pending_refunds
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Parceiros podem ver seus próprios reembolsos pendentes
-- CORRIGIDO: Usar contact_email em vez de contact_user_id (que não existe)
CREATE POLICY "Partners can view their own pending refunds"
  ON pending_refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM institutional_partners ip
      WHERE ip.id = pending_refunds.partner_id
      AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Comentários
COMMENT ON TABLE pending_refunds IS 'Armazena reembolsos pendentes que precisam ser processados manualmente pelo admin';
COMMENT ON COLUMN pending_refunds.status IS 'Status: pending (aguardando), processing (em processamento), processed (processado), cancelled (cancelado), failed (falhou)';
COMMENT ON COLUMN pending_refunds.refund_percent IS 'Percentual de reembolso conforme política de cancelamento';

