-- Script AUTOMÁTICO para adicionar role de admin
-- Este script usa o usuário LOGADO ATUALMENTE no Supabase
-- Execute este script enquanto estiver logado no Supabase SQL Editor

-- 1. Verificar qual usuário está logado
SELECT 
  auth.uid() as meu_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as meu_email;

-- 2. Verificar roles atuais
SELECT 
  ur.role,
  ur.user_id
FROM user_roles ur
WHERE ur.user_id = auth.uid();

-- 3. Adicionar role de admin ao usuário logado
-- Primeiro verificar se já existe uma role para este usuário
DO $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing_role TEXT;
BEGIN
  -- Verificar se já existe uma role
  SELECT role INTO v_existing_role
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  IF v_existing_role IS NULL THEN
    -- Não existe role, inserir nova
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    RAISE NOTICE 'Role "admin" adicionada ao usuário (ID: %)', v_user_id;
  ELSIF v_existing_role != 'admin' THEN
    -- Existe role diferente, atualizar para admin
    UPDATE user_roles
    SET role = 'admin'
    WHERE user_id = v_user_id;
    RAISE NOTICE 'Role atualizada de "%" para "admin" (ID: %)', v_existing_role, v_user_id;
  ELSE
    -- Já é admin
    RAISE NOTICE 'Usuário já possui role "admin" (ID: %)', v_user_id;
  END IF;
END $$;

-- 4. Verificar se foi adicionado
SELECT 
  ur.user_id,
  ur.role,
  (SELECT email FROM auth.users WHERE id = ur.user_id) as email,
  '✅ Role adicionada com sucesso!' as status
FROM user_roles ur
WHERE ur.user_id = auth.uid()
  AND ur.role = 'admin';

-- 5. Verificar permissão para gerenciar rotas
SELECT 
  auth.uid() as user_id,
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'municipal_manager')
  ) as tem_permissao_rotas,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech', 'municipal_manager')
    ) THEN '✅ Você PODE criar rotas!'
    ELSE '❌ Você NÃO PODE criar rotas. Execute este script novamente.'
  END as mensagem;

