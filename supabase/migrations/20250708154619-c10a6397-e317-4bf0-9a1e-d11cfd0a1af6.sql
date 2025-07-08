-- Criar dados de teste para validar os fluxos de login

-- 1. Inserir registros na tabela attendants para testar login de atendentes
INSERT INTO public.attendants (id, full_name, user_id, cat_id, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'João Silva Atendente', null, null, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos Atendente', null, null, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir registros na tabela municipal_profiles para testar gestores municipais
INSERT INTO public.municipal_profiles (id, city_id, manager_name, department_name, institutional_email, institutional_phone) VALUES
  (1, 1, 'Carlos Municipal Manager', 'Secretaria de Turismo', 'carlos@campogrande.ms.gov.br', '(67) 3314-3000'),
  (2, 2, 'Ana Gestora Regional', 'Coordenadoria Regional', 'ana@bonito.ms.gov.br', '(67) 3255-1000')
ON CONFLICT (id) DO NOTHING;

-- 3. Criar function para automatizar redirecionamento baseado na role
CREATE OR REPLACE FUNCTION public.get_user_dashboard_route(user_role text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN user_role IN ('admin', 'tech') THEN '/technical-admin'
    WHEN user_role IN ('municipal_manager', 'gestor') THEN '/municipal-admin'
    WHEN user_role = 'atendente' THEN '/cat-attendant'
    ELSE '/management'
  END;
$$;

-- 4. Criar function para validar se usuário tem permissão para acessar uma rota
CREATE OR REPLACE FUNCTION public.can_access_route(user_role text, route_path text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT CASE route_path
    WHEN '/technical-admin' THEN user_role IN ('admin', 'tech')
    WHEN '/municipal-admin' THEN user_role IN ('municipal_manager', 'gestor', 'admin', 'tech')
    WHEN '/cat-attendant' THEN user_role IN ('atendente', 'admin', 'tech')
    WHEN '/management' THEN user_role IN ('admin', 'tech', 'municipal_manager', 'gestor', 'atendente')
    ELSE true
  END;
$$;