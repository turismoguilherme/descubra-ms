-- Corrigir o constraint de roles para incluir 'atendente' e outros roles do sistema
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Adicionar constraint atualizado com todos os roles corretos
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'tech', 'municipal', 'municipal_manager', 'gestor', 'atendente', 'user'));

-- Criar função para elevar um usuário a admin (uso interno)
CREATE OR REPLACE FUNCTION elevate_to_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar o user_id pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com email: %', user_email;
  END IF;
  
  -- Inserir ou atualizar role para admin
  INSERT INTO user_roles (user_id, role, created_by)
  VALUES (target_user_id, 'admin', target_user_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin', created_at = now();
  
  -- Log da operação
  INSERT INTO security_audit_log (action, user_id, success)
  VALUES ('elevate_to_admin', target_user_id, true);
  
  RETURN true;
END;
$$;