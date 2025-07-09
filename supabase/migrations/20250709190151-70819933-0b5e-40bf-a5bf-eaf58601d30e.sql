-- Elevar usuário guilhermearevalo27@gmail.com para admin
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
    
    -- Inserir role admin para o usuário
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