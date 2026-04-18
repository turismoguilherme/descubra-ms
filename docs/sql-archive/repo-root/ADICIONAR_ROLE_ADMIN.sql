-- Script para adicionar role de admin a um usuário
-- Substitua 'seu-email@exemplo.com' pelo seu email real

-- Opção 1: Adicionar role usando EMAIL (mais fácil)
-- Substitua o email abaixo pelo seu email de login
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'seu-email@exemplo.com'; -- ⚠️ ALTERE AQUI: Coloque seu email
  v_existing_role TEXT;
BEGIN
  -- Buscar user_id pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', v_email;
  END IF;
  
  -- Verificar se já existe uma role
  SELECT role INTO v_existing_role
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  IF v_existing_role IS NULL THEN
    -- Não existe role, inserir nova
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    RAISE NOTICE 'Role "admin" adicionada ao usuário % (ID: %)', v_email, v_user_id;
  ELSIF v_existing_role != 'admin' THEN
    -- Existe role diferente, atualizar para admin
    UPDATE user_roles
    SET role = 'admin'
    WHERE user_id = v_user_id;
    RAISE NOTICE 'Role atualizada de "%" para "admin" para o usuário % (ID: %)', v_existing_role, v_email, v_user_id;
  ELSE
    -- Já é admin
    RAISE NOTICE 'Usuário % já possui role "admin" (ID: %)', v_email, v_user_id;
  END IF;
END $$;

-- Verificar se foi adicionado
SELECT 
  u.email,
  ur.role,
  ur.user_id
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY u.email;

