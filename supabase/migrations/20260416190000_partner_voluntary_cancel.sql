-- Cancelamento voluntário: metadatas de prazo de acesso e status "cancelled"
ALTER TABLE public.institutional_partners
  ADD COLUMN IF NOT EXISTS voluntary_cancel_at timestamptz,
  ADD COLUMN IF NOT EXISTS voluntary_cancel_access_until timestamptz,
  ADD COLUMN IF NOT EXISTS voluntary_cancel_reason text;

COMMENT ON COLUMN public.institutional_partners.voluntary_cancel_access_until IS 'Até quando o parceiro mantém acesso após pedir cancelamento (ex.: fim do período já pago no Stripe).';
COMMENT ON COLUMN public.institutional_partners.voluntary_cancel_at IS 'Momento em que o parceiro pediu o cancelamento voluntário.';

ALTER TABLE public.institutional_partners
  DROP CONSTRAINT IF EXISTS institutional_partners_status_check;

ALTER TABLE public.institutional_partners
  ADD CONSTRAINT institutional_partners_status_check CHECK (
    status IN (
      'pending',
      'approved',
      'rejected',
      'suspended',
      'revision_requested',
      'cancelled'
    )
  );
