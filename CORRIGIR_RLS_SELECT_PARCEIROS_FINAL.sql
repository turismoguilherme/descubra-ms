-- =====================================================
-- CORRIGIR POLÍTICA RLS DE SELECT PARA PARCEIROS (VERSÃO FINAL)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script remove TODAS as políticas e funções antigas e cria uma política simples
-- que não precisa acessar auth.users

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can view their own data by email" ON public.institutional_partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can update their own data" ON public.institutional_partners;

-- 2. Remover função is_partner_owner se existir (pode estar causando problemas)
DROP FUNCTION IF EXISTS public.is_partner_owner(UUID);

-- 3. Criar política RLS SIMPLES que compara email do JWT diretamente
-- Esta política não usa função alguma, evitando problemas de permissão
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

-- 4. Verificar políticas criadas
SELECT 
  'Políticas RLS para SELECT' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'institutional_partners'
AND cmd = 'SELECT'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'institutional_partners';

-- 6. Teste manual (execute enquanto estiver logado como parceiro de teste)
-- Este teste deve funcionar agora
SELECT 
  'Teste de acesso' as info,
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


