-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PARCEIROS (VERSÃO MELHORADA)
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Criar função auxiliar para verificar se usuário é parceiro
-- =====================================================

-- Função para verificar se usuário atual é parceiro de uma reserva
CREATE OR REPLACE FUNCTION public.is_partner_of_reservation(reservation_partner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Obter email do usuário atual
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o email corresponde ao contact_email do parceiro
  RETURN EXISTS (
    SELECT 1 
    FROM public.institutional_partners ip
    WHERE ip.id = reservation_partner_id
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(current_user_email))
  );
END;
$$;

-- Função para verificar se usuário atual é parceiro de uma notificação
CREATE OR REPLACE FUNCTION public.is_partner_of_notification(notification_partner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Obter email do usuário atual
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o email corresponde ao contact_email do parceiro
  RETURN EXISTS (
    SELECT 1 
    FROM public.institutional_partners ip
    WHERE ip.id = notification_partner_id
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(current_user_email))
  );
END;
$$;

-- =====================================================
-- 2. Corrigir RLS de partner_reservations
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Partners can view their own reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Partners can update their own reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.partner_reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.partner_reservations;

-- Criar políticas corretas usando função auxiliar
CREATE POLICY "Partners can view their own reservations"
ON public.partner_reservations
FOR SELECT
USING (
  public.is_partner_of_reservation(partner_id)
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
  )
);

CREATE POLICY "Partners can update their own reservations"
ON public.partner_reservations
FOR UPDATE
USING (
  public.is_partner_of_reservation(partner_id)
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
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
  )
);

-- =====================================================
-- 3. Corrigir RLS de partner_notifications
-- =====================================================

DROP POLICY IF EXISTS "Partners can view their own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Partners can update their own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.partner_notifications;

CREATE POLICY "Partners can view their own notifications"
ON public.partner_notifications
FOR SELECT
USING (
  public.is_partner_of_notification(partner_id)
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
  )
);

CREATE POLICY "Partners can update their own notifications"
ON public.partner_notifications
FOR UPDATE
USING (
  public.is_partner_of_notification(partner_id)
);

CREATE POLICY "Service role can insert notifications"
ON public.partner_notifications
FOR INSERT
WITH CHECK (true); -- Service role bypassa RLS

CREATE POLICY "Admins can view all notifications"
ON public.partner_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
  )
);

-- =====================================================
-- 4. Verificar se RLS está habilitado
-- =====================================================

ALTER TABLE public.partner_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Verificar políticas criadas
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('partner_reservations', 'partner_notifications')
ORDER BY tablename, policyname;

