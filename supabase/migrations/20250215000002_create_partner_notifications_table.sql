-- Migration: Criar tabela de notificações para parceiros
-- Tabela: partner_notifications

CREATE TABLE IF NOT EXISTS public.partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_reservation', 'reservation_cancelled', 'payment_confirmed', 'commission_paid', 'subscription_expiring', 'subscription_renewed', 'payout_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reservation_id UUID REFERENCES public.partner_reservations(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.partner_transactions(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.partner_notifications IS 'Notificações específicas para parceiros sobre reservas, pagamentos e assinaturas';
COMMENT ON COLUMN public.partner_notifications.type IS 'Tipo de notificação: new_reservation, reservation_cancelled, payment_confirmed, commission_paid, subscription_expiring, subscription_renewed, payout_completed';
COMMENT ON COLUMN public.partner_notifications.email_sent IS 'Indica se email de notificação foi enviado';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner_id ON public.partner_notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_read ON public.partner_notifications(partner_id, read);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_created_at ON public.partner_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_type ON public.partner_notifications(type);

-- RLS (Row Level Security)
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem ver suas próprias notificações
CREATE POLICY "Partners can view their own notifications"
ON public.partner_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_notifications.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Parceiros podem marcar notificações como lidas
CREATE POLICY "Partners can update their own notifications"
ON public.partner_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_notifications.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Sistema pode inserir notificações (via service role)
CREATE POLICY "Service role can insert notifications"
ON public.partner_notifications
FOR INSERT
WITH CHECK (true);
