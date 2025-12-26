-- Tabela para recompensas cadastradas pelos parceiros
-- Permite que parceiros cadastrem benefícios para o Passaporte Digital

CREATE TABLE IF NOT EXISTS partner_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES institutional_partners(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('desconto', 'brinde', 'experiencia', 'outros')),
  reward_description TEXT NOT NULL,
  discount_percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  route_id UUID REFERENCES routes(id), -- Vinculada a uma rota após aprovação
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_rewards_partner_id ON partner_rewards(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_status ON partner_rewards(status);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_valid_dates ON partner_rewards(valid_from, valid_until);

-- RLS Policies
ALTER TABLE partner_rewards ENABLE ROW LEVEL SECURITY;

-- Parceiros podem ver e gerenciar suas próprias recompensas
CREATE POLICY "Partners can view own rewards"
  ON partner_rewards FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Partners can insert own rewards"
  ON partner_rewards FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Partners can update own rewards"
  ON partner_rewards FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Partners can delete own rewards"
  ON partner_rewards FOR DELETE
  USING (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

-- Admins podem aprovar/rejeitar recompensas
CREATE POLICY "Admins can manage all rewards"
  ON partner_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_rewards_updated_at
  BEFORE UPDATE ON partner_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rewards_updated_at();

-- Comentários
COMMENT ON TABLE partner_rewards IS 'Recompensas cadastradas por parceiros para o Passaporte Digital';
COMMENT ON COLUMN partner_rewards.status IS 'pending = aguardando aprovação, approved = ativo no passaporte, rejected = recusado';
COMMENT ON COLUMN partner_rewards.route_id IS 'Rota vinculada após aprovação pelo admin';

