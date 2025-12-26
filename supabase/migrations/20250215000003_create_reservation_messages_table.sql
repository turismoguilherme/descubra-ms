-- Migration: Criar tabela de mensagens entre cliente e parceiro
-- Tabela: reservation_messages

CREATE TABLE IF NOT EXISTS public.reservation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.partner_reservations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('guest', 'partner', 'system')),
  sender_id UUID, -- user_id se for guest, partner_id se for partner
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb, -- URLs de arquivos anexados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.reservation_messages IS 'Mensagens de chat entre cliente e parceiro sobre uma reserva específica';
COMMENT ON COLUMN public.reservation_messages.sender_type IS 'Tipo de remetente: guest (cliente), partner (parceiro), system (sistema)';
COMMENT ON COLUMN public.reservation_messages.sender_id IS 'ID do remetente (user_id para guest, partner_id para partner)';
COMMENT ON COLUMN public.reservation_messages.attachments IS 'Array de URLs de arquivos anexados';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reservation_messages_reservation_id ON public.reservation_messages(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_messages_created_at ON public.reservation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_messages_read ON public.reservation_messages(reservation_id, read);

-- RLS (Row Level Security)
ALTER TABLE public.reservation_messages ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem ver mensagens de suas reservas
CREATE POLICY "Partners can view messages of their reservations"
ON public.reservation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Clientes podem ver mensagens de suas reservas
CREATE POLICY "Guests can view messages of their reservations"
ON public.reservation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND (pr.user_id = auth.uid() OR pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Política: Parceiros podem enviar mensagens em suas reservas
CREATE POLICY "Partners can send messages to their reservations"
ON public.reservation_messages
FOR INSERT
WITH CHECK (
  sender_type = 'partner'
  AND EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Clientes podem enviar mensagens em suas reservas
CREATE POLICY "Guests can send messages to their reservations"
ON public.reservation_messages
FOR INSERT
WITH CHECK (
  sender_type = 'guest'
  AND EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND (pr.user_id = auth.uid() OR pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Política: Parceiros podem marcar mensagens como lidas
CREATE POLICY "Partners can update messages of their reservations"
ON public.reservation_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Clientes podem marcar mensagens como lidas
CREATE POLICY "Guests can update messages of their reservations"
ON public.reservation_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND (pr.user_id = auth.uid() OR pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Política: Admins podem ver todas as mensagens
CREATE POLICY "Admins can view all messages"
ON public.reservation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
