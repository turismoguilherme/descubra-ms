-- Trilho de auditoria para reembolsos de eventos patrocinados.
-- Permite comprovar status, valor, referência Stripe e motivo de falha.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS refund_status text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS stripe_refund_id text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS refund_requested_at timestamptz;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS refund_error_message text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_refund_status_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_refund_status_check
      CHECK (
        refund_status IS NULL
        OR refund_status IN ('processing', 'pending', 'succeeded', 'failed', 'canceled')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_refund_status
  ON public.events(refund_status);

COMMENT ON COLUMN public.events.refund_status IS 'Status do reembolso no Stripe: processing, pending, succeeded, failed, canceled.';
COMMENT ON COLUMN public.events.stripe_refund_id IS 'ID do reembolso no Stripe (re_...).';
COMMENT ON COLUMN public.events.refund_amount IS 'Valor efetivamente reembolsado em BRL.';
COMMENT ON COLUMN public.events.refund_requested_at IS 'Timestamp de solicitação do reembolso.';
COMMENT ON COLUMN public.events.refunded_at IS 'Timestamp de conclusão do reembolso.';
COMMENT ON COLUMN public.events.refund_error_message IS 'Erro retornado no último processamento de reembolso.';
