-- Adicionar campo stripe_payment_link_url na tabela events
-- Permite configurar links de pagamento do Stripe para eventos em destaque

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS stripe_payment_link_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN events.stripe_payment_link_url IS 'URL do Payment Link do Stripe para pagamento de destaque do evento. Formato: https://buy.stripe.com/...';

