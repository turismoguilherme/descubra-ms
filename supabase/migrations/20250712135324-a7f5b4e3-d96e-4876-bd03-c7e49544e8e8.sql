-- Atualizar conta do usuário para admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'guilhermearevalo27@gmail.com'
);

-- Se não existir role, inserir uma nova
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'guilhermearevalo27@gmail.com' 
AND id NOT IN (SELECT user_id FROM user_roles);