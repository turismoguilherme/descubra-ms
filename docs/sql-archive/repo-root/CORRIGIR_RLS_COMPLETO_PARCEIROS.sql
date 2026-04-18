-- =====================================================
-- CORRIGIR TODAS AS POLÍTICAS RLS PARA PARCEIROS (SELECT E UPDATE)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige tanto o problema de login (SELECT) quanto o problema de salvar dados (UPDATE)

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can view their own data by email" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can view approved or own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can update their own data" ON public.institutional_partners;

-- 2. Remover função is_partner_owner se existir (pode estar causando problemas)
DROP FUNCTION IF EXISTS public.is_partner_owner(UUID);

-- 3. Criar política RLS para SELECT
-- Permite que parceiros vejam seus próprios dados OU qualquer parceiro aprovado
CREATE POLICY "Partners can view approved or own data"
ON public.institutional_partners
FOR SELECT
USING (
  -- Qualquer pessoa pode ver parceiros aprovados (público)
  status = 'approved'
  OR
  -- Parceiro autenticado pode ver seus próprios dados
  (
    auth.uid() IS NOT NULL 
    AND contact_email IS NOT NULL
    AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 4. Criar política RLS para UPDATE
-- Permite que parceiros atualizem apenas seus próprios dados
CREATE POLICY "Partners can update their own data"
ON public.institutional_partners
FOR UPDATE
USING (
  -- Parceiro autenticado pode atualizar apenas seus próprios dados
  auth.uid() IS NOT NULL 
  AND contact_email IS NOT NULL
  AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
)
WITH CHECK (
  -- Garantir que só pode atualizar seus próprios dados
  auth.uid() IS NOT NULL 
  AND contact_email IS NOT NULL
  AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
);

-- 5. Verificar políticas criadas
SELECT 
  'Políticas RLS criadas' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'institutional_partners'
ORDER BY cmd, policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'institutional_partners';

-- 7. Teste de SELECT (execute enquanto estiver logado como parceiro de teste)
SELECT 
  'Teste SELECT' as tipo,
  id,
  name,
  contact_email,
  status,
  is_active,
  (auth.jwt() ->> 'email')::TEXT as current_user_email_from_jwt,
  auth.uid() as current_user_id,
  CASE 
    WHEN LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, ''))) THEN '✅ Email corresponde'
    ELSE '❌ Email não corresponde'
  END as email_match
FROM institutional_partners
WHERE status = 'approved'
   OR (
     auth.uid() IS NOT NULL 
     AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
   );

-- 8. Teste de UPDATE (execute enquanto estiver logado como parceiro de teste)
-- Este teste apenas verifica se a política permite o UPDATE, não faz o UPDATE de fato
SELECT 
  'Teste UPDATE (verificação de permissão)' as tipo,
  id,
  name,
  contact_email,
  CASE 
    WHEN auth.uid() IS NOT NULL 
     AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
    THEN '✅ Pode atualizar'
    ELSE '❌ Não pode atualizar'
  END as can_update
FROM institutional_partners
WHERE auth.uid() IS NOT NULL 
  AND LOWER(TRIM(contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')));

