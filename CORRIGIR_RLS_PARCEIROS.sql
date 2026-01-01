-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PARCEIROS
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Corrigir RLS de partner_reservations
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Partners can view their own reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Partners can update their own reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.partner_reservations;

-- Criar políticas corretas
CREATE POLICY "Partners can view their own reservations"
ON public.partner_reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Partners can update their own reservations"
ON public.partner_reservations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Authenticated users can create reservations"
ON public.partner_reservations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all reservations"
ON public.partner_reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 2. Corrigir RLS de partner_notifications
-- =====================================================

DROP POLICY IF EXISTS "Partners can view their own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Partners can update their own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.partner_notifications;

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

CREATE POLICY "Admins can view all notifications"
ON public.partner_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 3. Corrigir RLS de partner_transactions
-- =====================================================

DROP POLICY IF EXISTS "Partners can view their own transactions" ON public.partner_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.partner_transactions;

CREATE POLICY "Partners can view their own transactions"
ON public.partner_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_transactions.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins can view all transactions"
ON public.partner_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 4. Corrigir RLS de reservation_messages
-- =====================================================

DROP POLICY IF EXISTS "Partners can view messages of their reservations" ON public.reservation_messages;
DROP POLICY IF EXISTS "Guests can view messages of their reservations" ON public.reservation_messages;
DROP POLICY IF EXISTS "Partners can send messages" ON public.reservation_messages;
DROP POLICY IF EXISTS "Guests can send messages" ON public.reservation_messages;
DROP POLICY IF EXISTS "Partners can update messages" ON public.reservation_messages;
DROP POLICY IF EXISTS "Guests can update messages" ON public.reservation_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.reservation_messages;

-- Parceiros podem ver mensagens de suas reservas
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

-- Clientes podem ver mensagens de suas reservas
CREATE POLICY "Guests can view messages of their reservations"
ON public.reservation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Parceiros podem enviar mensagens
CREATE POLICY "Partners can send messages"
ON public.reservation_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND reservation_messages.sender_type = 'partner'
  )
);

-- Clientes podem enviar mensagens
CREATE POLICY "Guests can send messages"
ON public.reservation_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND reservation_messages.sender_type = 'guest'
  )
);

-- Parceiros podem atualizar mensagens (marcar como lida)
CREATE POLICY "Partners can update messages"
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

-- Clientes podem atualizar mensagens (marcar como lida)
CREATE POLICY "Guests can update messages"
ON public.reservation_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND pr.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Admins podem ver todas as mensagens
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

-- =====================================================
-- FIM DAS CORREÇÕES
-- =====================================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('partner_reservations', 'partner_notifications', 'partner_transactions', 'reservation_messages')
ORDER BY tablename, policyname;



























