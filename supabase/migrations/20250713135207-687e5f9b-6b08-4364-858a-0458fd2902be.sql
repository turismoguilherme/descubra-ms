-- Criar usuários de teste válidos
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
-- Admin de teste
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin-teste@ms.gov.br',
  '$2a$10$l/HGu4VlZJd4Y5Y5Q5Y5YeY5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin de Teste"}',
  false,
  'authenticated'
),
-- Usuário comum de teste
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'usuario-teste@ms.gov.br',
  '$2a$10$l/HGu4VlZJd4Y5Y5Q5Y5YeY5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Usuário de Teste"}',
  false,
  'authenticated'
);

-- Executar função para criar perfis de teste
SELECT create_test_user_profiles();