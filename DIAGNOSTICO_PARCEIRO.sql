-- Script de diagnóstico para verificar parceiro de teste
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o parceiro existe e está ativo
SELECT 
  id,
  name,
  contact_email,
  is_active,
  partner_type,
  created_at
FROM institutional_partners
WHERE contact_email = 'parceiro.teste@descubrams.com.br';

-- 2. Verificar se o usuário de autenticação existe
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'parceiro.teste@descubrams.com.br';

-- 3. Verificar políticas RLS da tabela institutional_partners
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'institutional_partners';

-- 4. Testar se um usuário autenticado consegue ver o parceiro
-- (Execute esta query enquanto estiver logado como o usuário de teste)
SELECT 
  id,
  name,
  contact_email,
  is_active
FROM institutional_partners
WHERE contact_email = 'parceiro.teste@descubrams.com.br';

-- 5. Verificar se há diferenças no email (espaços, case, etc)
SELECT 
  contact_email,
  LENGTH(contact_email) as email_length,
  LOWER(contact_email) as email_lower,
  TRIM(contact_email) as email_trimmed
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));




































