-- =====================================================
-- CORRIGIR POLÍTICA RLS DE SELECT PARA PARCEIROS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige especificamente o problema de 403 ao buscar parceiro após login

-- Criar ou substituir função is_partner_owner
-- Usa auth.jwt() para obter email sem acessar auth.users diretamente
CREATE OR REPLACE FUNCTION public.is_partner_owner(partner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  current_user_email TEXT;
  current_user_id UUID;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obter email do token JWT (mais seguro que acessar auth.users)
  current_user_email := (auth.jwt() ->> 'email')::TEXT;
  
  -- Se não conseguiu obter email do JWT, tentar obter de outra forma
  IF current_user_email IS NULL THEN
    -- Usar uma função auxiliar que tem permissão para acessar auth.users
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = current_user_id;
  END IF;
  
  -- Se ainda não tem email, retornar false
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

-- Garantir que a função tenha permissão para acessar auth.users se necessário
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Partners can view their own data" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;

-- Criar política mais permissiva para SELECT
-- Permite que parceiros vejam seus próprios dados OU qualquer parceiro aprovado
CREATE POLICY "Partners can view their own data"
ON public.institutional_partners
FOR SELECT
USING (
  -- Parceiro pode ver seus próprios dados (usando função que não precisa acessar auth.users)
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

-- Testar a política (execute enquanto estiver logado como parceiro de teste)
SELECT 
  'Teste de acesso' as info,
  id,
  name,
  contact_email,
  status,
  is_active
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM((SELECT email FROM auth.users WHERE id = auth.uid())));

