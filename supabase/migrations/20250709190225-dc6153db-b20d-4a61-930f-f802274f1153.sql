-- Primeiro, vamos verificar se já existe algum registro duplicado
SELECT user_id, COUNT(*) as count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Adicionar constraint única na coluna user_id
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Agora elevar o usuário para admin
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Buscar o user_id pelo email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'guilhermearevalo27@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado com email: guilhermearevalo27@gmail.com';
    END IF;
    
    -- Inserir ou atualizar role admin para o usuário
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (target_user_id, 'admin', target_user_id)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin', created_at = now();
    
    -- Log da operação
    INSERT INTO security_audit_log (action, user_id, success)
    VALUES ('manual_admin_elevation', target_user_id, true);
    
    RAISE NOTICE 'Usuário guilhermearevalo27@gmail.com elevado para admin com sucesso!';
END $$;

-- Verificar se o usuário foi elevado corretamente
SELECT 
    u.email,
    ur.role,
    ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'guilhermearevalo27@gmail.com';