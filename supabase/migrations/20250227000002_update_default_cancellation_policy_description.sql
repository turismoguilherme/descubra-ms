-- =====================================================
-- ATUALIZAR DESCRIÇÃO DA POLÍTICA PADRÃO DE CANCELAMENTO
-- Migration: 20250227000002
-- =====================================================

-- Atualizar descrição da política padrão para incluir informação sobre taxa do Stripe
UPDATE partner_cancellation_policies
SET 
  description = 'Política padrão de cancelamento da plataforma. Os percentuais de reembolso são calculados sobre o valor pago, porém a taxa de processamento do Stripe (aproximadamente 3,99% + R$ 0,30 por transação) será descontada automaticamente do valor final reembolsado ao cliente. Isso garante transparência e que a plataforma não tenha prejuízo com taxas de processamento.',
  updated_at = NOW()
WHERE 
  partner_id IS NULL 
  AND is_default = true 
  AND is_active = true;

-- Comentário
COMMENT ON COLUMN partner_cancellation_policies.description IS 'Descrição da política de cancelamento. Deve incluir informação sobre desconto da taxa do Stripe nos reembolsos.';

