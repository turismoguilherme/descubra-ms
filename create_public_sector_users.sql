-- Script para criar usuários do setor público
-- Execute este script no Supabase SQL Editor

-- Inserir usuários de teste do setor público
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Atendente CAT
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'atendente@ms.gov.br',
  crypt('atendente123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Gestor Municipal
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'gestor.municipal@ms.gov.br',
  crypt('gestor123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Gestor Regional
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'gestor.regional@ms.gov.br',
  crypt('regional123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Administrador
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@ms.gov.br',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Inserir perfis na tabela overflow_one_users
INSERT INTO overflow_one_users (
  user_id,
  company_name,
  contact_person,
  role,
  subscription_plan,
  subscription_status
) 
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'atendente@ms.gov.br' THEN 'CAT Mato Grosso do Sul'
    WHEN u.email = 'gestor.municipal@ms.gov.br' THEN 'Prefeitura Municipal'
    WHEN u.email = 'gestor.regional@ms.gov.br' THEN 'Governo Regional'
    WHEN u.email = 'admin@ms.gov.br' THEN 'Governo do Estado MS'
  END,
  CASE 
    WHEN u.email = 'atendente@ms.gov.br' THEN 'Atendente Teste'
    WHEN u.email = 'gestor.municipal@ms.gov.br' THEN 'Gestor Municipal Teste'
    WHEN u.email = 'gestor.regional@ms.gov.br' THEN 'Gestor Regional Teste'
    WHEN u.email = 'admin@ms.gov.br' THEN 'Administrador Teste'
  END,
  CASE 
    WHEN u.email = 'atendente@ms.gov.br' THEN 'atendente'
    WHEN u.email = 'gestor.municipal@ms.gov.br' THEN 'gestor_municipal'
    WHEN u.email = 'gestor.regional@ms.gov.br' THEN 'gestor_regional'
    WHEN u.email = 'admin@ms.gov.br' THEN 'admin'
  END,
  'basic',
  'active'
FROM auth.users u
WHERE u.email IN (
  'atendente@ms.gov.br',
  'gestor.municipal@ms.gov.br',
  'gestor.regional@ms.gov.br',
  'admin@ms.gov.br'
);

-- Verificar se os usuários foram criados
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role,
  p.company_name,
  p.contact_person
FROM auth.users u
LEFT JOIN overflow_one_users p ON u.id = p.user_id
WHERE u.email IN (
  'atendente@ms.gov.br',
  'gestor.municipal@ms.gov.br',
  'gestor.regional@ms.gov.br',
  'admin@ms.gov.br'
);
