-- =====================================================
-- DIAGNÓSTICO COMPLETO DO PARCEIRO DE TESTE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se o parceiro existe na tabela institutional_partners
SELECT 
  '1. Parceiro na tabela institutional_partners' as etapa,
  id,
  name,
  contact_email,
  is_active,
  status,
  created_at
FROM institutional_partners
WHERE contact_email = 'parceiro.teste@descubrams.com.br';

-- 2. Verificar se o usuário existe na tabela auth.users
SELECT 
  '2. Usuário na tabela auth.users' as etapa,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'parceiro.teste@descubrams.com.br';

-- 3. Verificar correspondência entre email do usuário e contact_email do parceiro
SELECT 
  '3. Correspondência entre usuário e parceiro' as etapa,
  ip.id as partner_id,
  ip.name as partner_name,
  ip.contact_email as partner_email,
  ip.is_active as partner_is_active,
  ip.status as partner_status,
  au.id as user_id,
  au.email as user_email,
  au.email_confirmed_at,
  CASE 
    WHEN LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(au.email)) THEN '✅ Emails correspondem'
    ELSE '❌ Emails NÃO correspondem'
  END as email_match
FROM institutional_partners ip
LEFT JOIN auth.users au ON LOWER(TRIM(au.email)) = LOWER(TRIM(ip.contact_email))
WHERE ip.contact_email = 'parceiro.teste@descubrams.com.br'
   OR au.email = 'parceiro.teste@descubrams.com.br';

-- 4. Testar a função is_partner_owner manualmente
-- (Execute enquanto estiver logado como o usuário de teste)
SELECT 
  '4. Teste da função is_partner_owner' as etapa,
  ip.id as partner_id,
  ip.contact_email as partner_email,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  public.is_partner_owner(ip.id) as is_owner_result
FROM institutional_partners ip
WHERE ip.contact_email = 'parceiro.teste@descubrams.com.br';

-- 5. Verificar políticas RLS ativas na tabela institutional_partners
SELECT 
  '5. Políticas RLS ativas' as etapa,
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

-- 6. Verificar se RLS está habilitado
SELECT 
  '6. Status do RLS' as etapa,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'institutional_partners';

-- 7. Testar SELECT direto (simula o que o código faz)
-- (Execute enquanto estiver logado como o usuário de teste)
SELECT 
  '7. Teste de SELECT direto' as etapa,
  id,
  name,
  contact_email,
  is_active,
  status
FROM institutional_partners
WHERE contact_email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- 8. Verificar se há diferenças de case ou espaços no email
SELECT 
  '8. Análise de email' as etapa,
  contact_email,
  LENGTH(contact_email) as email_length,
  LOWER(TRIM(contact_email)) as email_normalized,
  CHAR_LENGTH(contact_email) as char_length,
  OCTET_LENGTH(contact_email) as byte_length
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));


