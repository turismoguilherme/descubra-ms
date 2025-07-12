-- Criar usuário admin inicial (corrigido)
-- Primeiro vamos criar um usuário fictício admin para testes
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@sistema.com',
  crypt('admin123', gen_salt('bf')), -- senha: admin123
  now(),
  now(),
  now(),
  '{"full_name": "Administrador do Sistema"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Criar perfil para o admin (sem user_type para evitar constraint)
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  display_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Administrador do Sistema',
  'Admin',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Atribuir role admin
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at,
  created_by
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin',
  now(),
  '00000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role;