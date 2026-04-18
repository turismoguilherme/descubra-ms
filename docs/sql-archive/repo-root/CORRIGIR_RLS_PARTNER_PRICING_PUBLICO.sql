-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PERMITIR ACESSO PÚBLICO A PREÇOS ATIVOS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script adiciona uma política RLS que permite que usuários anônimos (público)
-- também possam ver preços ativos de parceiros aprovados, necessário para a página de reserva

-- 1. Verificar se a tabela existe
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

-- 2. Habilitar RLS se ainda não estiver habilitado
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

-- 3. Remover política antiga que só permitia usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can view active pricing" ON public.partner_pricing;

-- 4. Criar nova política que permite acesso público a preços ativos de parceiros aprovados
-- Esta política permite que:
-- - Usuários anônimos (público) vejam preços ativos de parceiros aprovados
-- - Usuários autenticados vejam preços ativos
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

-- 5. Manter política para parceiros verem seus próprios preços (mesmo inativos)
DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
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

-- 6. Manter política para admins verem todos os preços
DROP POLICY IF EXISTS "Admins can view all pricing" ON public.partner_pricing;
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

-- 7. Verificar políticas criadas
SELECT 
  'Políticas RLS para partner_pricing' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'partner_pricing'
AND cmd = 'SELECT'
ORDER BY policyname;

-- 8. Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'partner_pricing';
