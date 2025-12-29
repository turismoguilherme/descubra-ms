-- =====================================================
-- CORRIGIR TODAS AS POLÍTICAS RLS PARA PARCEIROS
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Criar funções auxiliares para verificar se usuário é parceiro
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

-- Função para verificar se usuário atual é parceiro (para institutional_partners)
CREATE OR REPLACE FUNCTION public.is_partner_owner(partner_id UUID)
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
    WHERE ip.id = partner_id
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(current_user_email))
  );
END;
$$;

-- Função para verificar se usuário atual é parceiro de um preço
CREATE OR REPLACE FUNCTION public.is_partner_of_pricing(pricing_partner_id UUID)
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
    WHERE ip.id = pricing_partner_id
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(current_user_email))
  );
END;
$$;

-- =====================================================
-- 2. Corrigir RLS de institutional_partners
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'institutional_partners'
  ) THEN
    -- Habilitar RLS se ainda não estiver habilitado
    ALTER TABLE public.institutional_partners ENABLE ROW LEVEL SECURITY;

    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
    DROP POLICY IF EXISTS "Partners can update their own data" ON public.institutional_partners;
    DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
    DROP POLICY IF EXISTS "Admins can manage all partners" ON public.institutional_partners;

    -- Política: Parceiros podem ver seus próprios dados
    CREATE POLICY "Partners can view their own data"
    ON public.institutional_partners
    FOR SELECT
    USING (
      public.is_partner_owner(id)
      OR status = 'approved' -- Público pode ver parceiros aprovados
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
      )
    );

    -- Política: Parceiros podem atualizar seus próprios dados (exceto campos sensíveis)
    CREATE POLICY "Partners can update their own data"
    ON public.institutional_partners
    FOR UPDATE
    USING (
      public.is_partner_owner(id)
    )
    WITH CHECK (
      public.is_partner_owner(id)
      -- Não permitir alterar campos sensíveis via RLS (será validado no código)
    );

    -- Política: Admins podem gerenciar todos os parceiros
    CREATE POLICY "Admins can manage all partners"
    ON public.institutional_partners
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
      )
    );
    
    RAISE NOTICE 'Políticas RLS aplicadas na tabela institutional_partners';
  ELSE
    RAISE NOTICE 'Tabela institutional_partners não existe. Pulando políticas RLS para esta tabela.';
  END IF;
END $$;

-- =====================================================
-- 3. Corrigir RLS de partner_reservations
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_reservations'
  ) THEN
    ALTER TABLE public.partner_reservations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Partners can view their own reservations" ON public.partner_reservations;
    DROP POLICY IF EXISTS "Partners can update their own reservations" ON public.partner_reservations;
    DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.partner_reservations;
    DROP POLICY IF EXISTS "Admins can view all reservations" ON public.partner_reservations;

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
    
    RAISE NOTICE 'Políticas RLS aplicadas na tabela partner_reservations';
  ELSE
    RAISE NOTICE 'Tabela partner_reservations não existe. Pulando políticas RLS para esta tabela.';
  END IF;
END $$;

-- =====================================================
-- 4. Corrigir RLS de partner_notifications
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_notifications'
  ) THEN
    ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

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
    
    RAISE NOTICE 'Políticas RLS aplicadas na tabela partner_notifications';
  ELSE
    RAISE NOTICE 'Tabela partner_notifications não existe. Pulando políticas RLS para esta tabela.';
  END IF;
END $$;

-- =====================================================
-- 5. Corrigir RLS de partner_pricing (se a tabela existir)
-- =====================================================

DO $$
BEGIN
  -- Verificar se a tabela existe antes de aplicar RLS
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_pricing'
  ) THEN
    ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
    DROP POLICY IF EXISTS "Partners can manage their own pricing" ON public.partner_pricing;
    DROP POLICY IF EXISTS "Authenticated users can view active pricing" ON public.partner_pricing;
    DROP POLICY IF EXISTS "Admins can view all pricing" ON public.partner_pricing;

    CREATE POLICY "Partners can view their own pricing"
    ON public.partner_pricing
    FOR SELECT
    USING (
      public.is_partner_of_pricing(partner_id)
      OR (
        is_active = true
        AND auth.role() = 'authenticated'
      )
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
      )
    );

    CREATE POLICY "Partners can manage their own pricing"
    ON public.partner_pricing
    FOR ALL
    USING (
      public.is_partner_of_pricing(partner_id)
    )
    WITH CHECK (
      public.is_partner_of_pricing(partner_id)
    );

    CREATE POLICY "Admins can view all pricing"
    ON public.partner_pricing
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'master_admin')
      )
    );
    
    RAISE NOTICE 'Políticas RLS aplicadas na tabela partner_pricing';
  ELSE
    RAISE NOTICE 'Tabela partner_pricing não existe. Pulando políticas RLS para esta tabela.';
  END IF;
END $$;

-- =====================================================
-- 6. Verificar políticas criadas
-- =====================================================

-- Verificar políticas criadas (apenas para tabelas que existem)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'institutional_partners',
  'partner_reservations', 
  'partner_notifications',
  'partner_pricing'
)
ORDER BY tablename, policyname;

-- Verificar quais tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('institutional_partners', 'partner_reservations', 'partner_notifications', 'partner_pricing') 
    THEN '✓ Tabela existe'
    ELSE '✗ Tabela não existe'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('institutional_partners', 'partner_reservations', 'partner_notifications', 'partner_pricing')
ORDER BY table_name;

