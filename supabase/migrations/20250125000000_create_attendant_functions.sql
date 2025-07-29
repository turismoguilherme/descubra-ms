-- Função para criar atendente de forma simplificada
CREATE OR REPLACE FUNCTION create_attendant_user(
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT DEFAULT NULL,
  user_city_id UUID,
  send_invite BOOLEAN DEFAULT true
) 
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  temp_password TEXT;
  result JSON;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário com este email já existe';
  END IF;
  
  -- Gerar senha temporária
  temp_password := 'TempPass' || floor(random() * 10000)::text;
  
  -- Criar usuário no auth.users (simulação - em produção usar auth.create_user)
  new_user_id := gen_random_uuid();
  
  -- Inserir no user_profiles
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    city_id,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    user_email,
    user_name,
    user_phone,
    'atendente',
    CASE WHEN send_invite THEN 'pending' ELSE 'active' END,
    user_city_id,
    NOW(),
    NOW()
  );
  
  -- Log da ação para auditoria
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    severity,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    'create_attendant',
    'user_profiles',
    new_user_id,
    jsonb_build_object(
      'attendant_email', user_email,
      'attendant_name', user_name,
      'city_id', user_city_id,
      'send_invite', send_invite
    ),
    'info',
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent',
    NOW()
  );
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Atendente criado com sucesso',
    'temp_password', CASE WHEN NOT send_invite THEN temp_password ELSE NULL END
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar atendente: %', SQLERRM;
END;
$$;

-- Função para buscar usuários com detalhes (melhorada)
CREATE OR REPLACE FUNCTION get_users_with_details()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  city_id UUID,
  region_id UUID,
  user_type TEXT,
  city_name TEXT,
  region_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.phone,
    up.role,
    up.status,
    up.created_at,
    up.last_sign_in_at,
    up.city_id,
    c.region_id,
    up.user_type,
    c.name as city_name,
    r.name as region_name
  FROM user_profiles up
  LEFT JOIN cities c ON up.city_id = c.id
  LEFT JOIN regions r ON c.region_id = r.id
  ORDER BY up.created_at DESC;
END;
$$;

-- Garantir permissões RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que gestores vejam atendentes de sua região/cidade
CREATE POLICY "Gestores podem ver atendentes de sua região" ON user_profiles
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('admin', 'tech', 'diretor_estadual')
    ) OR
    (
      auth.uid() IN (
        SELECT id FROM user_profiles 
        WHERE role IN ('gestor_igr', 'gestor_municipal')
      ) AND
      city_id IN (
        SELECT id FROM cities 
        WHERE region_id = (
          SELECT c.region_id FROM user_profiles up
          JOIN cities c ON up.city_id = c.id
          WHERE up.id = auth.uid()
        )
      )
    )
  );

-- Política para criação de atendentes
CREATE POLICY "Gestores podem criar atendentes" ON user_profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('admin', 'tech', 'diretor_estadual', 'gestor_igr', 'gestor_municipal')
    )
  );

-- Política para atualização de atendentes
CREATE POLICY "Gestores podem atualizar atendentes" ON user_profiles
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('admin', 'tech', 'diretor_estadual')
    ) OR
    (
      auth.uid() IN (
        SELECT id FROM user_profiles 
        WHERE role IN ('gestor_igr', 'gestor_municipal')
      ) AND
      city_id IN (
        SELECT id FROM cities 
        WHERE region_id = (
          SELECT c.region_id FROM user_profiles up
          JOIN cities c ON up.city_id = c.id
          WHERE up.id = auth.uid()
        )
      )
    )
  ); 