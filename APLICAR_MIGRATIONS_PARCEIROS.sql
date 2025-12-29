-- =====================================================
-- MIGRATIONS PARA SISTEMA DE PARCEIROS
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Tabela de Reservas de Parceiros
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_type TEXT NOT NULL DEFAULT 'other' CHECK (reservation_type IN ('hotel', 'restaurant', 'tour', 'transport', 'attraction', 'other')),
  service_name TEXT NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  reservation_date DATE NOT NULL,
  reservation_time TIME,
  guests INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  reservation_code TEXT UNIQUE NOT NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  special_requests TEXT,
  partner_notes TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Índices para partner_reservations
CREATE INDEX IF NOT EXISTS idx_partner_reservations_partner_id ON public.partner_reservations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_user_id ON public.partner_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_status ON public.partner_reservations(status);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_reservation_code ON public.partner_reservations(reservation_code);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_reservation_date ON public.partner_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_created_at ON public.partner_reservations(created_at DESC);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_reservations_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Trigger para partner_reservations
DROP TRIGGER IF EXISTS trigger_update_partner_reservations_updated_at ON public.partner_reservations;
CREATE TRIGGER trigger_update_partner_reservations_updated_at
BEFORE UPDATE ON public.partner_reservations
FOR EACH ROW
EXECUTE FUNCTION update_partner_reservations_updated_at();

-- RLS para partner_reservations
ALTER TABLE public.partner_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para partner_reservations
DROP POLICY IF EXISTS "Partners can view their own reservations" ON public.partner_reservations;
CREATE POLICY "Partners can view their own reservations"
ON public.partner_reservations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Partners can update their own reservations" ON public.partner_reservations;
CREATE POLICY "Partners can update their own reservations"
ON public.partner_reservations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.partner_reservations;
CREATE POLICY "Authenticated users can create reservations"
ON public.partner_reservations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can view all reservations" ON public.partner_reservations;
CREATE POLICY "Admins can view all reservations"
ON public.partner_reservations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 2. Tabela de Transações de Parceiros
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_payment', 'commission', 'refund', 'payout', 'adjustment')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  reservation_id UUID REFERENCES public.partner_reservations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  paid_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'BRL',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para partner_transactions
CREATE INDEX IF NOT EXISTS idx_partner_transactions_partner_id ON public.partner_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_type ON public.partner_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_status ON public.partner_transactions(status);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_created_at ON public.partner_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_reservation_id ON public.partner_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_stripe_invoice ON public.partner_transactions(stripe_invoice_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_transactions_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Trigger para partner_transactions
DROP TRIGGER IF EXISTS trigger_update_partner_transactions_updated_at ON public.partner_transactions;
CREATE TRIGGER trigger_update_partner_transactions_updated_at
BEFORE UPDATE ON public.partner_transactions
FOR EACH ROW
EXECUTE FUNCTION update_partner_transactions_updated_at();

-- RLS para partner_transactions
ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para partner_transactions
DROP POLICY IF EXISTS "Partners can view their own transactions" ON public.partner_transactions;
CREATE POLICY "Partners can view their own transactions"
ON public.partner_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_transactions.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.partner_transactions;
CREATE POLICY "Admins can view all transactions"
ON public.partner_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

DROP POLICY IF EXISTS "Service role can insert transactions" ON public.partner_transactions;
CREATE POLICY "Service role can insert transactions"
ON public.partner_transactions FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 3. Tabela de Notificações de Parceiros
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_reservation', 'reservation_confirmed', 'reservation_cancelled', 'commission_paid', 'subscription_payment', 'subscription_expiring', 'payout_completed', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reservation_id UUID REFERENCES public.partner_reservations(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.partner_transactions(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para partner_notifications
CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner_id ON public.partner_notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_read ON public.partner_notifications(partner_id, read);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_created_at ON public.partner_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_type ON public.partner_notifications(type);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_reservation_id ON public.partner_notifications(reservation_id);

-- RLS para partner_notifications
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para partner_notifications
DROP POLICY IF EXISTS "Partners can view their own notifications" ON public.partner_notifications;
CREATE POLICY "Partners can view their own notifications"
ON public.partner_notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_notifications.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Partners can update their own notifications" ON public.partner_notifications;
CREATE POLICY "Partners can update their own notifications"
ON public.partner_notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_notifications.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.partner_notifications;
CREATE POLICY "Service role can insert notifications"
ON public.partner_notifications FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.partner_notifications;
CREATE POLICY "Admins can view all notifications"
ON public.partner_notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 4. Tabela de Mensagens de Reservas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reservation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.partner_reservations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('guest', 'partner', 'system')),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para reservation_messages
CREATE INDEX IF NOT EXISTS idx_reservation_messages_reservation_id ON public.reservation_messages(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_messages_created_at ON public.reservation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_messages_read ON public.reservation_messages(reservation_id, read);

-- RLS para reservation_messages
ALTER TABLE public.reservation_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reservation_messages
DROP POLICY IF EXISTS "Partners can view messages of their reservations" ON public.reservation_messages;
CREATE POLICY "Partners can view messages of their reservations"
ON public.reservation_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Partners can send messages to their reservations" ON public.reservation_messages;
CREATE POLICY "Partners can send messages to their reservations"
ON public.reservation_messages FOR INSERT
WITH CHECK (
  sender_type = 'partner' AND
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    JOIN public.institutional_partners ip ON ip.id = pr.partner_id
    WHERE pr.id = reservation_messages.reservation_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Guests can view and send messages to their reservations" ON public.reservation_messages;
CREATE POLICY "Guests can view and send messages to their reservations"
ON public.reservation_messages FOR ALL
USING (
  (sender_type = 'guest' AND sender_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
    AND pr.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Service role can insert messages" ON public.reservation_messages;
CREATE POLICY "Service role can insert messages"
ON public.reservation_messages FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.reservation_messages;
CREATE POLICY "Admins can view all messages"
ON public.reservation_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- 5. Habilitar Realtime para as tabelas
-- =====================================================
-- Habilitar Realtime para partner_reservations
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_reservations') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_reservations;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar se já estiver habilitado
      NULL;
    END;
  END IF;
END $$;

-- Habilitar Realtime para partner_notifications
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_notifications') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_notifications;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar se já estiver habilitado
      NULL;
    END;
  END IF;
END $$;

-- Habilitar Realtime para reservation_messages
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reservation_messages') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.reservation_messages;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar se já estiver habilitado
      NULL;
    END;
  END IF;
END $$;

-- =====================================================
-- FIM DAS MIGRATIONS
-- =====================================================
-- Verificar se todas as tabelas foram criadas:
SELECT 
  tablename,
  '✅ Criada' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'partner_reservations', 
  'partner_transactions', 
  'partner_notifications', 
  'reservation_messages'
)
ORDER BY tablename;
















