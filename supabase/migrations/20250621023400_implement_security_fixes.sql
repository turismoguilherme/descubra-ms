
-- IMPLEMENTAÇÃO CRÍTICA DE SEGURANÇA: RLS POLICIES PARA PASSAPORTE DIGITAL
-- Esta migration implementa Row Level Security para todas as tabelas do sistema de passaporte digital

-- 1. ATIVAR RLS EM TODAS AS TABELAS DO PASSAPORTE DIGITAL

ALTER TABLE tourist_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passport_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA REGIÕES TURÍSTICAS
-- Leitura pública, escrita apenas para gestores

CREATE POLICY "tourist_regions_select_public" ON tourist_regions
  FOR SELECT USING (true);

CREATE POLICY "tourist_regions_insert_managers" ON tourist_regions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

CREATE POLICY "tourist_regions_update_managers" ON tourist_regions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

CREATE POLICY "tourist_regions_delete_admins" ON tourist_regions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- 3. POLÍTICAS PARA CIDADES DAS REGIÕES
-- Leitura pública, escrita com controle de região

CREATE POLICY "region_cities_select_public" ON region_cities
  FOR SELECT USING (true);

CREATE POLICY "region_cities_insert_managers" ON region_cities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND (
        ur.role IN ('admin', 'tech') 
        OR (ur.role = 'municipal_manager' AND ur.region = region_id::text)
      )
    )
  );

CREATE POLICY "region_cities_update_managers" ON region_cities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND (
        ur.role IN ('admin', 'tech') 
        OR (ur.role = 'municipal_manager' AND ur.region = region_id::text)
      )
    )
  );

CREATE POLICY "region_cities_delete_admins" ON region_cities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- 4. POLÍTICAS PARA RECOMPENSAS DE ROTEIROS
-- Leitura pública, escrita para gestores

CREATE POLICY "route_rewards_select_public" ON route_rewards
  FOR SELECT USING (true);

CREATE POLICY "route_rewards_insert_managers" ON route_rewards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

CREATE POLICY "route_rewards_update_managers" ON route_rewards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

CREATE POLICY "route_rewards_delete_admins" ON route_rewards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech')
    )
  );

-- 5. POLÍTICAS PARA PROGRESSO DO USUÁRIO
-- Usuários veem apenas seu próprio progresso

CREATE POLICY "user_passport_progress_select_own" ON user_passport_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_passport_progress_insert_own" ON user_passport_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_passport_progress_update_own" ON user_passport_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_passport_progress_select_managers" ON user_passport_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- 6. POLÍTICAS PARA CARIMBOS DIGITAIS
-- Usuários veem apenas seus próprios carimbos

CREATE POLICY "digital_stamps_select_own" ON digital_stamps
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "digital_stamps_insert_own" ON digital_stamps
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "digital_stamps_select_managers" ON digital_stamps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- 7. POLÍTICAS PARA RECOMPENSAS DO USUÁRIOS
-- Usuários veem apenas suas próprias recompensas

CREATE POLICY "user_rewards_select_own" ON user_rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_rewards_insert_own" ON user_rewards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_rewards_update_own" ON user_rewards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_rewards_select_managers" ON user_rewards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- 8. FUNÇÃO PARA LOG DE SEGURANÇA DO PASSAPORTE DIGITAL

CREATE OR REPLACE FUNCTION log_passport_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO security_logs (
    user_id,
    action,
    table_name,
    record_id,
    success,
    error_message,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_success,
    p_error_message,
    COALESCE((current_setting('request.headers')::json->>'cf-connecting-ip'), 'unknown'),
    COALESCE((current_setting('request.headers')::json->>'user-agent'), 'unknown'),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGERS PARA AUDITORIA AUTOMÁTICA

CREATE OR REPLACE FUNCTION audit_passport_changes() RETURNS TRIGGER AS $$
BEGIN
  -- Log da operação baseado no tipo de trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM log_passport_security_event(
      auth.uid(),
      'INSERT_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      NEW.id::text,
      true
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_passport_security_event(
      auth.uid(),
      'UPDATE_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      NEW.id::text,
      true
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_passport_security_event(
      auth.uid(),
      'DELETE_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      OLD.id::text,
      true
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers em todas as tabelas do passaporte
CREATE TRIGGER audit_tourist_regions_changes
  AFTER INSERT OR UPDATE OR DELETE ON tourist_regions
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

CREATE TRIGGER audit_region_cities_changes
  AFTER INSERT OR UPDATE OR DELETE ON region_cities
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

CREATE TRIGGER audit_route_rewards_changes
  AFTER INSERT OR UPDATE OR DELETE ON route_rewards
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

CREATE TRIGGER audit_user_progress_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_passport_progress
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

CREATE TRIGGER audit_digital_stamps_changes
  AFTER INSERT OR UPDATE OR DELETE ON digital_stamps
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

CREATE TRIGGER audit_user_rewards_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_rewards
  FOR EACH ROW EXECUTE FUNCTION audit_passport_changes();

-- 10. FUNÇÃO PARA VALIDAÇÃO DE OPERAÇÕES ADMINISTRATIVAS

CREATE OR REPLACE FUNCTION validate_admin_passport_operation(
  operation_type TEXT,
  target_region_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_role_info RECORD;
  is_authorized BOOLEAN := false;
BEGIN
  -- Buscar informações do usuário
  SELECT ur.role, ur.region INTO user_role_info
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();
  
  -- Se não encontrou papel, negar acesso
  IF user_role_info IS NULL THEN
    PERFORM log_passport_security_event(
      auth.uid(),
      'UNAUTHORIZED_' || operation_type,
      'validation',
      target_region_id::text,
      false,
      'User has no role assigned'
    );
    RETURN false;
  END IF;
  
  -- Determinar autorização baseado no papel
  CASE user_role_info.role
    WHEN 'admin', 'tech' THEN
      is_authorized := true;
    WHEN 'municipal_manager' THEN
      -- Gestores municipais podem operar apenas em sua região
      is_authorized := (target_region_id IS NULL OR user_role_info.region = target_region_id::text);
    ELSE
      is_authorized := false;
  END CASE;
  
  -- Log da operação
  PERFORM log_passport_security_event(
    auth.uid(),
    operation_type || '_VALIDATION',
    'admin_operation',
    target_region_id::text,
    is_authorized,
    CASE WHEN NOT is_authorized THEN 'Insufficient privileges' ELSE NULL END
  );
  
  RETURN is_authorized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. FUNCTION PARA ESTATÍSTICAS DE SEGURANÇA

CREATE OR REPLACE FUNCTION get_passport_security_stats()
RETURNS TABLE(
  table_name TEXT,
  total_records BIGINT,
  records_last_24h BIGINT,
  unique_users_24h BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'digital_stamps'::text,
    (SELECT COUNT(*) FROM digital_stamps)::BIGINT,
    (SELECT COUNT(*) FROM digital_stamps WHERE earned_at > now() - interval '24 hours')::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM digital_stamps WHERE earned_at > now() - interval '24 hours')::BIGINT
  UNION ALL
  SELECT 
    'user_rewards'::text,
    (SELECT COUNT(*) FROM user_rewards)::BIGINT,
    (SELECT COUNT(*) FROM user_rewards WHERE earned_at > now() - interval '24 hours')::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM user_rewards WHERE earned_at > now() - interval '24 hours')::BIGINT
  UNION ALL
  SELECT 
    'user_passport_progress'::text,
    (SELECT COUNT(*) FROM user_passport_progress)::BIGINT,
    (SELECT COUNT(*) FROM user_passport_progress WHERE completed_at > now() - interval '24 hours')::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM user_passport_progress WHERE completed_at > now() - interval '24 hours')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO

COMMENT ON POLICY "tourist_regions_select_public" ON tourist_regions IS 
'Permite leitura pública das regiões turísticas para todos os usuários';

COMMENT ON POLICY "user_passport_progress_select_own" ON user_passport_progress IS 
'Usuários podem ver apenas seu próprio progresso no passaporte digital';

COMMENT ON POLICY "digital_stamps_select_own" ON digital_stamps IS 
'Usuários podem ver apenas seus próprios carimbos digitais coletados';

COMMENT ON FUNCTION validate_admin_passport_operation IS 
'Valida se o usuário atual tem permissão para realizar operações administrativas no sistema de passaporte digital';

COMMENT ON FUNCTION log_passport_security_event IS 
'Registra eventos de segurança específicos do sistema de passaporte digital para auditoria';
