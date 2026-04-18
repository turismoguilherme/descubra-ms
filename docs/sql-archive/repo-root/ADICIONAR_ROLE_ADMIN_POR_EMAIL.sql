'-- Script para adicionar role de admin usando EMAIL
-- ⚠️ IMPORTANTE: Substitua 'seu-email@exemplo.com' pelo seu email real

-- PASSO 1: Verificar se o usuário existe
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- PASSO 2: Verificar role atual (se houver)
SELECT 
  ur.user_id,
  ur.role,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- PASSO 3: Remover role existente (se houver)
DELETE FROM user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com' -- ⚠️ ALTERE AQUI: Coloque seu email
);

-- PASSO 4: Inserir role de admin
INSERT INTO user_roles (user_id, role)
SELECT 
  id as user_id,
  'admin' as role
FROM auth.users
WHERE email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- PASSO 5: Verificar se funcionou
SELECT 
  ur.user_id,
  ur.role,
  u.email,
  '✅ Role "admin" adicionada!' as status
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email

-- PASSO 6: Verificar permissão para rotas
SELECT 
  u.email,
  ur.role,
  CASE 
    WHEN ur.role IN ('admin', 'tech', 'municipal_manager') THEN '✅ Você PODE criar rotas!'
    ELSE '❌ Você NÃO PODE criar rotas'
  END as resultado
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email
'