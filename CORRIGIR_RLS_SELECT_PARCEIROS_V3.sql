-- =====================================================
-- CORRIGIR POLÍTICA RLS DE SELECT PARA PARCEIROS (VERSÃO 3)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige especificamente o problema de 403 ao buscar parceiro após login
-- Versão que NÃO usa função auxiliar, compara diretamente na política RLS

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
DROP POLICY IF EXISTS "Partners can view their own data by email" ON public.institutional_partners;

-- Criar política RLS que compara diretamente o email do JWT com contact_email
-- Não precisa de função auxiliar, evita problemas de permissão
CREATE POLICY "Partners can view their own data by email"
ON public.institutional_partners
FOR SELECT
USING (
  -- Parceiro pode ver seus próprios dados (comparando email do JWT diretamente)
  (
    auth.uid() IS NOT NULL 
    AND LOWER(TRIM(contact_email)) = LOWER(TRIM((auth.jwt() ->> 'email')::TEXT))
  )
  OR 
  -- Qualquer pessoa pode ver parceiros aprovados (público)
  status = 'approved'
);

-- Verificar políticas criadas
SELECT 
  'Políticas RLS para SELECT' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'institutional_partners'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Testar a política diretamente (execute enquanto estiver logado como parceiro de teste)
SELECT 
  'Teste de acesso direto' as info,
  id,
  name,
  contact_email,
  status,
  is_active,
  (auth.jwt() ->> 'email')::TEXT as current_user_email_from_jwt,
  auth.uid() as current_user_id
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM((auth.jwt() ->> 'email')::TEXT))
   OR status = 'approved';


