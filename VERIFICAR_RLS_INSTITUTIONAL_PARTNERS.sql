-- =====================================================
-- VERIFICAR POLÍTICAS RLS PARA institutional_partners
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se RLS está habilitado
SELECT 
  'Status do RLS' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'institutional_partners';

-- 2. Verificar políticas RLS existentes
SELECT 
  'Políticas RLS' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'institutional_partners'
ORDER BY policyname;

-- 3. Verificar se função is_partner_owner existe
SELECT 
  'Função is_partner_owner' as info,
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'is_partner_owner'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Testar a função is_partner_owner manualmente
-- (Execute enquanto estiver logado como o usuário de teste)
SELECT 
  'Teste da função is_partner_owner' as info,
  ip.id as partner_id,
  ip.name as partner_name,
  ip.contact_email as partner_email,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  public.is_partner_owner(ip.id) as is_owner_result
FROM institutional_partners ip
WHERE LOWER(TRIM(ip.contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));

-- 5. Verificar se o parceiro existe e qual é o email
SELECT 
  'Parceiro de teste' as info,
  id,
  name,
  contact_email,
  status,
  is_active,
  LOWER(TRIM(contact_email)) as email_normalized
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));

-- 6. Verificar usuário de autenticação
SELECT 
  'Usuário de autenticação' as info,
  id,
  email,
  LOWER(TRIM(email)) as email_normalized,
  email_confirmed_at
FROM auth.users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));

-- 7. Testar SELECT direto (simula o que o código faz)
-- (Execute enquanto estiver logado como o usuário de teste)
SELECT 
  'Teste SELECT direto' as info,
  id,
  name,
  contact_email,
  status,
  is_active
FROM institutional_partners
WHERE contact_email = (SELECT email FROM auth.users WHERE id = auth.uid());


