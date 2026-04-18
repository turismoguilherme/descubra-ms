-- =====================================================
-- CRIAR TABELA E CORRIGIR POLÍTICAS RLS PARA PARTNER_PRICING
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script:
-- 1. Cria a tabela partner_pricing se ela não existir
-- 2. Corrige as políticas RLS para permitir que parceiros salvem e visualizem seus preços
-- 3. Usa auth.jwt() ->> 'email' em vez de consultar auth.users diretamente

-- =====================================================
-- 1. CRIAR TABELA (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('hotel', 'restaurant', 'tour', 'transport', 'attraction', 'other')),
  service_name TEXT NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('fixed', 'per_person', 'per_night', 'package')),
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_person NUMERIC(10,2),
  price_per_night NUMERIC(10,2),
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.partner_pricing IS 'Preços dos serviços oferecidos pelos parceiros';
COMMENT ON COLUMN public.partner_pricing.pricing_type IS 'Tipo de preço: fixed (fixo), per_person (por pessoa), per_night (por noite), package (pacote)';
COMMENT ON COLUMN public.partner_pricing.base_price IS 'Preço base (para fixed) ou preço inicial (para outros tipos)';
COMMENT ON COLUMN public.partner_pricing.price_per_person IS 'Preço por pessoa (quando pricing_type = per_person)';
COMMENT ON COLUMN public.partner_pricing.price_per_night IS 'Preço por noite (quando pricing_type = per_night)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_partner_pricing_partner_id ON public.partner_pricing(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_pricing_service_type ON public.partner_pricing(service_type);
CREATE INDEX IF NOT EXISTS idx_partner_pricing_is_active ON public.partner_pricing(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partner_pricing_updated_at ON public.partner_pricing;
CREATE TRIGGER trigger_update_partner_pricing_updated_at
BEFORE UPDATE ON public.partner_pricing
FOR EACH ROW
EXECUTE FUNCTION update_partner_pricing_updated_at();

-- =====================================================
-- 2. CORRIGIR POLÍTICAS RLS
-- =====================================================

-- 2. Habilitar RLS
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
DROP POLICY IF EXISTS "Partners can manage their own pricing" ON public.partner_pricing;
DROP POLICY IF EXISTS "Authenticated users can view active pricing" ON public.partner_pricing;
DROP POLICY IF EXISTS "Admins can view all pricing" ON public.partner_pricing;

-- 4. Criar política RLS para SELECT
-- Permite que:
-- - Parceiros vejam seus próprios preços
-- - Usuários autenticados vejam preços ativos
-- - Admins vejam todos os preços
CREATE POLICY "Partners can view their own pricing"
ON public.partner_pricing
FOR SELECT
USING (
  -- Parceiro pode ver seus próprios preços
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
  OR
  -- Usuários autenticados podem ver preços ativos
  (
    is_active = true
    AND auth.role() = 'authenticated'
  )
  OR
  -- Admins podem ver todos os preços
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- 5. Criar política RLS para INSERT
-- Permite que parceiros criem preços apenas para seus próprios parceiros
CREATE POLICY "Partners can insert their own pricing"
ON public.partner_pricing
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 6. Criar política RLS para UPDATE
-- Permite que parceiros atualizem apenas seus próprios preços
CREATE POLICY "Partners can update their own pricing"
ON public.partner_pricing
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 7. Criar política RLS para DELETE
-- Permite que parceiros excluam apenas seus próprios preços
CREATE POLICY "Partners can delete their own pricing"
ON public.partner_pricing
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 8. Verificar políticas criadas
SELECT 
  'Políticas RLS criadas' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'partner_pricing'
ORDER BY cmd, policyname;

-- 9. Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'partner_pricing';

-- 10. Teste de SELECT (execute enquanto estiver logado como parceiro de teste)
SELECT 
  'Teste SELECT' as tipo,
  pp.id,
  pp.service_name,
  pp.base_price,
  ip.name as partner_name,
  ip.contact_email,
  (auth.jwt() ->> 'email')::TEXT as current_user_email_from_jwt,
  auth.uid() as current_user_id,
  CASE 
    WHEN LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, ''))) THEN '✅ Email corresponde'
    ELSE '❌ Email não corresponde'
  END as email_match
FROM partner_pricing pp
JOIN institutional_partners ip ON ip.id = pp.partner_id
WHERE EXISTS (
    SELECT 1 FROM public.institutional_partners ip2
    WHERE ip2.id = pp.partner_id
    AND ip2.contact_email IS NOT NULL
    AND LOWER(TRIM(ip2.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
  OR (pp.is_active = true AND auth.role() = 'authenticated')
LIMIT 10;

