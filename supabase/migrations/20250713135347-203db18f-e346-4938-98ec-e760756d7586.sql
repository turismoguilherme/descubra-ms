-- Limpar usuários de teste existentes se houver
DELETE FROM auth.users WHERE email IN ('admin-teste@ms.gov.br', 'usuario-teste@ms.gov.br');

-- Criar usuários de teste com senhas simples para testes
-- SENHA PARA AMBOS: 123456789
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
-- Admin de teste (email: admin-teste@ms.gov.br, senha: 123456789)
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin-teste@ms.gov.br',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin de Teste"}',
  false,
  'authenticated'
),
-- Usuário comum de teste (email: usuario-teste@ms.gov.br, senha: 123456789)
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'usuario-teste@ms.gov.br',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Usuário de Teste"}',
  false,
  'authenticated'
);

-- Criar perfis correspondentes
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  display_name,
  user_type,
  created_at,
  updated_at
) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin de Teste', 'Admin', 'collaborator', now(), now()),
('22222222-2222-2222-2222-222222222222', 'Usuário de Teste', 'Usuario', 'tourist', now(), now());

-- Criar role de admin para o usuário de teste
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at,
  created_by
) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', now(), '11111111-1111-1111-1111-111111111111');