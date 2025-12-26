-- Migration: Popular tabela partner_transactions com dados existentes
-- Migra dados de master_financial_records e cria registros de assinaturas

-- 1. Migrar comissões de master_financial_records
INSERT INTO public.partner_transactions (
  partner_id,
  transaction_type,
  amount,
  description,
  stripe_invoice_id,
  reservation_id,
  status,
  paid_date,
  metadata,
  created_at
)
SELECT 
  (metadata->>'partner_id')::uuid as partner_id,
  'commission' as transaction_type,
  amount,
  description,
  stripe_invoice_id,
  (metadata->>'reservation_id')::uuid as reservation_id,
  status,
  paid_date::timestamptz as paid_date,
  metadata,
  created_at
FROM master_financial_records
WHERE 
  record_type = 'revenue' 
  AND source = 'commission'
  AND metadata->>'partner_id' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM partner_transactions pt
    WHERE pt.stripe_invoice_id = master_financial_records.stripe_invoice_id
    AND pt.transaction_type = 'commission'
  );

-- 2. Criar transações de assinatura a partir de institutional_partners
-- (apenas para parceiros com assinatura ativa e stripe_subscription_id)
INSERT INTO public.partner_transactions (
  partner_id,
  transaction_type,
  amount,
  description,
  stripe_subscription_id,
  status,
  paid_date,
  metadata,
  created_at
)
SELECT 
  ip.id as partner_id,
  'subscription_payment' as transaction_type,
  -ip.monthly_fee as amount, -- Negativo (despesa)
  'Pagamento de assinatura mensal - ' || ip.name as description,
  ip.stripe_subscription_id,
  CASE 
    WHEN ip.subscription_status = 'active' THEN 'paid'
    WHEN ip.subscription_status = 'past_due' THEN 'failed'
    ELSE 'pending'
  END as status,
  ip.subscription_start_date as paid_date,
  jsonb_build_object(
    'subscription_status', ip.subscription_status,
    'monthly_fee', ip.monthly_fee
  ) as metadata,
  COALESCE(ip.subscription_start_date, ip.created_at) as created_at
FROM institutional_partners ip
WHERE 
  ip.stripe_subscription_id IS NOT NULL
  AND ip.monthly_fee > 0
  AND NOT EXISTS (
    SELECT 1 FROM partner_transactions pt
    WHERE pt.partner_id = ip.id
    AND pt.transaction_type = 'subscription_payment'
    AND pt.stripe_subscription_id = ip.stripe_subscription_id
  );

-- Comentário
COMMENT ON TABLE public.partner_transactions IS 'Histórico completo de transações financeiras dos parceiros (assinaturas, comissões, repasses)';
