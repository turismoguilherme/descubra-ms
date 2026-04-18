-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PERMITIR ACESSO PÚBLICO
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige as políticas RLS para permitir que usuários anônimos (público)
-- possam ver parceiros aprovados e preços ativos, necessário para a página de reserva
-- funcionar mesmo quando o JWT está expirado ou ausente

-- =====================================================
-- 1. CORRIGIR POLÍTICAS RLS DE institutional_partners
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Partners can view approved or own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;

-- Criar política que permite acesso público a parceiros aprovados
-- Esta política funciona mesmo quando o JWT está expirado ou ausente
CREATE POLICY "Public can view approved partners"
ON public.institutional_partners
FOR SELECT
USING (
  -- Qualquer pessoa (público) pode ver parceiros aprovados
  status = 'approved'
  OR
  -- Parceiro autenticado pode ver seus próprios dados (mesmo não aprovados)
  (
    auth.uid() IS NOT NULL 
    AND contact_email IS NOT NULL
    AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
  OR
  -- Admins podem ver todos os parceiros
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- =====================================================
-- 2. CORRIGIR POLÍTICAS RLS DE partner_pricing
-- =====================================================

-- Verificar se a tabela existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_pricing'
  ) THEN
    RAISE EXCEPTION 'Tabela partner_pricing não existe. Execute primeiro a migration de criação da tabela.';
  END IF;
END $$;

-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
DROP POLICY IF EXISTS "Authenticated users can view active pricing" ON public.partner_pricing;
DROP POLICY IF EXISTS "Public can view active pricing of approved partners" ON public.partner_pricing;
DROP POLICY IF EXISTS "Admins can view all pricing" ON public.partner_pricing;

-- Criar política que permite acesso público a preços ativos de parceiros aprovados
-- Esta política funciona mesmo quando o JWT está expirado ou ausente
CREATE POLICY "Public can view active pricing of approved partners"
ON public.partner_pricing
FOR SELECT
USING (
  -- Preço deve estar ativo
  is_active = true
  AND
  -- Parceiro deve estar aprovado
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.status = 'approved'
  )
);

-- Política para parceiros verem seus próprios preços (mesmo inativos)
CREATE POLICY "Partners can view their own pricing"
ON public.partner_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- Política para admins verem todos os preços
CREATE POLICY "Admins can view all pricing"
ON public.partner_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- =====================================================
-- 3. VERIFICAÇÕES
-- =====================================================

-- Verificar políticas de institutional_partners
SELECT 
  'Políticas RLS para institutional_partners' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'institutional_partners'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Verificar políticas de partner_pricing
SELECT 
  'Políticas RLS para partner_pricing' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'partner_pricing'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('institutional_partners', 'partner_pricing')
ORDER BY tablename;

