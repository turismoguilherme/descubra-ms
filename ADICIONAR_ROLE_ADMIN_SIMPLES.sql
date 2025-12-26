-- Script SIMPLES para adicionar role de admin
-- Execute este script no Supabase SQL Editor

-- PASSO 1: Ver qual usuário está logado
SELECT 
  auth.uid() as meu_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as meu_email;

-- PASSO 2: Verificar se já tem role
SELECT 
  user_id,
  role
FROM user_roles
WHERE user_id = auth.uid();

-- PASSO 3: Remover role existente (se houver)
DELETE FROM user_roles
WHERE user_id = auth.uid();

-- PASSO 4: Inserir role de admin
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin');

-- PASSO 5: Verificar se funcionou
SELECT 
  ur.user_id,
  ur.role,
  (SELECT email FROM auth.users WHERE id = ur.user_id) as email,
  '✅ Role "admin" adicionada!' as status
FROM user_roles ur
WHERE ur.user_id = auth.uid();

-- PASSO 6: Verificar permissão para rotas
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech', 'municipal_manager')
    ) THEN '✅ Você PODE criar rotas!'
    ELSE '❌ Você NÃO PODE criar rotas'
  END as resultado;
