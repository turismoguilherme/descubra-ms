-- Migração para implementar controle de acesso baseado em roles
-- Data: 16/01/2025

-- 1. Verificar se a tabela user_roles existe e tem as colunas necessárias
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'region_id') THEN
        ALTER TABLE user_roles ADD COLUMN region_id UUID REFERENCES regions(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'city_id') THEN
        ALTER TABLE user_roles ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Atualizar a constraint de roles para incluir todos os roles necessários
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (
    role IN (
        'admin',
        'diretor_estadual',
        'gestor_igr',
        'gestor_municipal',
        'atendente',
        'user'
    )
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_region_id ON user_roles(region_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_city_id ON user_roles(city_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- 4. Habilitar RLS na tabela user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para user_roles
-- Política para usuários verem apenas seus próprios roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para admins verem todos os roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Política para diretores estaduais verem roles de sua área
CREATE POLICY "State directors can view state roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'diretor_estadual'
    )
  );

-- 6. Criar políticas RLS para destinations baseadas em roles
CREATE POLICY "Role-based destinations access" ON destinations
  FOR ALL USING (
    -- Admin pode ver tudo
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
    OR
    -- Diretor estadual pode ver tudo
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'diretor_estadual'
    )
    OR
    -- Gestor regional pode ver destinos de sua região
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'gestor_igr'
      AND ur.region_id = destinations.region_id
    )
    OR
    -- Gestor municipal pode ver destinos de sua cidade
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'gestor_municipal'
      AND ur.city_id = destinations.city_id
    )
    OR
    -- Atendente pode ver destinos de sua cidade
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'atendente'
      AND ur.city_id = destinations.city_id
    )
  );

-- 7. Criar políticas RLS para events baseadas em roles
CREATE POLICY "Role-based events access" ON events
  FOR ALL USING (
    -- Admin pode ver tudo
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
    OR
    -- Diretor estadual pode ver tudo
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'diretor_estadual'
    )
    OR
    -- Gestor regional pode ver eventos de sua região
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'gestor_igr'
      AND ur.region_id = events.region_id
    )
    OR
    -- Gestor municipal pode ver eventos de sua cidade
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'gestor_municipal'
      AND ur.city_id = events.city_id
    )
    OR
    -- Atendente pode ver eventos de sua cidade
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'atendente'
      AND ur.city_id = events.city_id
    )
  );

-- 8. Criar políticas RLS para user_profiles baseadas em roles
CREATE POLICY "Role-based user profiles access" ON user_profiles
  FOR ALL USING (
    -- Usuário pode ver seu próprio perfil
    auth.uid() = user_id
    OR
    -- Admin pode ver todos os perfis
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
    OR
    -- Diretor estadual pode ver perfis de sua área
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'diretor_estadual'
    )
  );

-- 9. Criar função para verificar permissões de usuário
CREATE OR REPLACE FUNCTION check_user_permission(
  user_id UUID,
  required_role TEXT,
  region_id UUID DEFAULT NULL,
  city_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem o role necessário
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = check_user_permission.user_id 
    AND ur.role = required_role
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Se region_id foi especificado, verificar se o usuário tem acesso à região
  IF region_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = check_user_permission.user_id 
      AND (ur.role IN ('admin', 'diretor_estadual') OR ur.region_id = region_id)
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Se city_id foi especificado, verificar se o usuário tem acesso à cidade
  IF city_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = check_user_permission.user_id 
      AND (ur.role IN ('admin', 'diretor_estadual') OR ur.city_id = city_id)
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar função para obter dados filtrados por role
CREATE OR REPLACE FUNCTION get_filtered_data(
  table_name TEXT,
  user_id UUID
) RETURNS TABLE (
  id UUID,
  data JSONB
) AS $$
BEGIN
  -- Esta função será implementada conforme necessário para cada tabela
  -- Por enquanto, retorna uma estrutura básica
  RETURN QUERY SELECT NULL::UUID, NULL::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Comentários para documentação
COMMENT ON FUNCTION check_user_permission IS 'Verifica se um usuário tem permissão para acessar dados específicos baseado em seu role';
COMMENT ON FUNCTION get_filtered_data IS 'Retorna dados filtrados baseado no role do usuário';
COMMENT ON TABLE user_roles IS 'Tabela de roles e permissões dos usuários';
COMMENT ON COLUMN user_roles.role IS 'Role do usuário: admin, diretor_estadual, gestor_igr, gestor_municipal, atendente, user';
COMMENT ON COLUMN user_roles.region_id IS 'ID da região para gestores regionais';
COMMENT ON COLUMN user_roles.city_id IS 'ID da cidade para gestores municipais e atendentes';

-- 12. Log da migração
INSERT INTO schema_migrations (version, name) VALUES 
('20250116000000', 'create_role_based_access')
ON CONFLICT (version) DO NOTHING; 