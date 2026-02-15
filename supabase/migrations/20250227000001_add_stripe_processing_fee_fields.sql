-- =====================================================
-- ADICIONAR CAMPOS PARA TAXA DE PROCESSAMENTO DO STRIPE
-- Migration: 20250227000001
-- =====================================================

-- Adicionar campo para armazenar a taxa do Stripe na tabela de reservas
ALTER TABLE partner_reservations 
ADD COLUMN IF NOT EXISTS stripe_processing_fee DECIMAL(10,2);

COMMENT ON COLUMN partner_reservations.stripe_processing_fee IS 'Taxa de processamento do Stripe cobrada no pagamento original (em reais). Usado para descontar do reembolso.';

-- Adicionar campo para registrar a taxa descontada no reembolso
ALTER TABLE pending_refunds 
ADD COLUMN IF NOT EXISTS stripe_fee_deducted DECIMAL(10,2);

COMMENT ON COLUMN pending_refunds.stripe_fee_deducted IS 'Taxa do Stripe descontada do reembolso (em reais). Valor da taxa original do pagamento que foi descontado do valor reembolsado ao cliente.';

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_partner_reservations_stripe_fee 
ON partner_reservations(stripe_processing_fee) 
WHERE stripe_processing_fee IS NOT NULL;

