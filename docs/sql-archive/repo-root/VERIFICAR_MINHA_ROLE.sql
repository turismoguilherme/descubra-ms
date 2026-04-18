-- Script para verificar suas roles atuais
-- Execute este script primeiro para ver qual é seu user_id e suas roles

-- 1. Ver seu user_id e email atual
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- 2. Ver todas as suas roles
SELECT 
  ur.user_id,
  ur.role,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- 3. Verificar se você tem permissão para gerenciar rotas
SELECT 
  u.email,
  ur.role,
  CASE 
    WHEN ur.role IN ('admin', 'tech', 'municipal_manager') THEN '✅ TEM PERMISSÃO'
    ELSE '❌ SEM PERMISSÃO'
  END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role IN ('admin', 'tech', 'municipal_manager')
WHERE u.email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

