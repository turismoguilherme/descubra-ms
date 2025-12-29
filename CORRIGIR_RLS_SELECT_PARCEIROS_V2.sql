-- =====================================================
-- CORRIGIR POLÍTICA RLS DE SELECT PARA PARCEIROS (VERSÃO 2)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige especificamente o problema de 403 ao buscar parceiro após login
-- Versão que não precisa acessar auth.users diretamente

-- Criar ou substituir função is_partner_owner usando auth.jwt()
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
  -- Obter email do token JWT (não precisa acessar auth.users)
  current_user_email := (auth.jwt() ->> 'email')::TEXT;
  
  -- Se não há usuário autenticado ou não conseguiu obter email, retornar false
  IF current_user_email IS NULL OR auth.uid() IS NULL THEN
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

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;

-- Criar política simplificada para SELECT
-- Permite que parceiros vejam seus próprios dados OU qualquer parceiro aprovado
CREATE POLICY "Partners can view their own data"
ON public.institutional_partners
FOR SELECT
USING (
  -- Parceiro pode ver seus próprios dados
  public.is_partner_owner(id)
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

-- Testar a função diretamente (execute enquanto estiver logado como parceiro de teste)
SELECT 
  'Teste da função is_partner_owner' as info,
  ip.id as partner_id,
  ip.name as partner_name,
  ip.contact_email as partner_email,
  (auth.jwt() ->> 'email')::TEXT as current_user_email_from_jwt,
  public.is_partner_owner(ip.id) as is_owner_result
FROM institutional_partners ip
WHERE LOWER(TRIM(ip.contact_email)) = LOWER(TRIM((auth.jwt() ->> 'email')::TEXT));


