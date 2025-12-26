-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO: ViaJARTur e Parceiros
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Configurações iniciais do ViaJARTur (valores dos planos)
-- Insere os valores padrão se não existirem

INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES 
  ('viajar', 'viajar_professional_price', '200.00', 'Valor mensal do Plano Empresários (R$)'),
  ('viajar', 'viajar_professional_name', 'Plano Empresários', 'Nome do Plano Empresários'),
  ('viajar', 'viajar_professional_description', 'Para hotéis, pousadas, agências e operadores de turismo', 'Descrição do Plano Empresários'),
  ('viajar', 'viajar_professional_payment_link', 'https://buy.stripe.com/test_7sY28t9gG5y5dsH2vxbfO00', 'Payment Link do Stripe para Plano Empresários'),
  ('viajar', 'viajar_government_price', '2000.00', 'Valor mensal do Plano Secretárias (R$)'),
  ('viajar', 'viajar_government_name', 'Plano Secretárias', 'Nome do Plano Secretárias'),
  ('viajar', 'viajar_government_description', 'Para secretarias de turismo e órgãos públicos', 'Descrição do Plano Secretárias'),
  ('viajar', 'viajar_government_payment_link', 'https://buy.stripe.com/test_fZu5kF50q7GdgET1rtbfO03', 'Payment Link do Stripe para Plano Secretárias')
ON CONFLICT (platform, setting_key) DO NOTHING;

-- 2. Configuração de valor mensal para parceiros Descubra MS
-- Atualiza para R$ 200 conforme solicitado

UPDATE site_settings 
SET setting_value = '200.00', 
    updated_at = NOW()
WHERE platform = 'ms' 
  AND setting_key = 'partner_monthly_fee';

-- Se não existir, cria
INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES ('ms', 'partner_monthly_fee', '200.00', 'Valor mensal da assinatura para parceiros do Descubra MS (em R$)')
ON CONFLICT (platform, setting_key) DO UPDATE SET setting_value = '200.00', updated_at = NOW();

-- 3. Criar tabela de recompensas de parceiros (se não existir)
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
  route_id UUID REFERENCES routes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_rewards_partner_id ON partner_rewards(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_status ON partner_rewards(status);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_valid_dates ON partner_rewards(valid_from, valid_until);

-- 4. RLS Policies para partner_rewards
ALTER TABLE partner_rewards ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Partners can view own rewards" ON partner_rewards;
DROP POLICY IF EXISTS "Partners can insert own rewards" ON partner_rewards;
DROP POLICY IF EXISTS "Partners can update own rewards" ON partner_rewards;
DROP POLICY IF EXISTS "Partners can delete own rewards" ON partner_rewards;
DROP POLICY IF EXISTS "Admins can manage all rewards" ON partner_rewards;

-- Parceiros podem ver suas próprias recompensas
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

-- Parceiros podem inserir suas próprias recompensas
CREATE POLICY "Partners can insert own rewards"
  ON partner_rewards FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

-- Parceiros e admins podem atualizar
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

-- Parceiros podem deletar suas próprias recompensas
CREATE POLICY "Partners can delete own rewards"
  ON partner_rewards FOR DELETE
  USING (
    partner_id IN (
      SELECT id FROM institutional_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

-- 5. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_partner_rewards_updated_at ON partner_rewards;
CREATE TRIGGER trigger_update_partner_rewards_updated_at
  BEFORE UPDATE ON partner_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rewards_updated_at();

-- 6. Verificar configurações
SELECT 
  platform,
  setting_key,
  setting_value,
  description
FROM site_settings 
WHERE platform IN ('viajar', 'ms')
ORDER BY platform, setting_key;

-- =====================================================
-- PRÓXIMOS PASSOS:
-- 
-- 1. No Dashboard do Stripe, configure a URL de retorno
--    dos Payment Links para:
--    - ViaJARTur: https://seudominio.com/viajar/onboarding?success=true
--    - Parceiros: https://seudominio.com/descubramatogrossodosul/seja-um-parceiro/success?partner_id={CHECKOUT_SESSION_ID}
--
-- 2. No Admin, acesse:
--    - ViaJARTur > Configuração de Planos (para alterar valores)
--    - Passaporte > Recompensas (para aprovar recompensas de parceiros)
-- =====================================================

