-- Migration: Passaporte Digital Gamificado
-- Criação de tabelas e funções para sistema de passaporte digital

-- ============================================
-- EXPANDIR TABELAS EXISTENTES
-- ============================================

-- Expandir route_checkpoints
ALTER TABLE route_checkpoints 
ADD COLUMN IF NOT EXISTS stamp_fragment_number INTEGER,
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS requires_photo BOOLEAN DEFAULT false;

COMMENT ON COLUMN route_checkpoints.stamp_fragment_number IS 'Número do fragmento do carimbo (1, 2, 3...)';
COMMENT ON COLUMN route_checkpoints.geofence_radius IS 'Raio de validação geográfica em metros';
COMMENT ON COLUMN route_checkpoints.requires_photo IS 'Se foto é obrigatória para check-in';

-- Expandir routes
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS passport_number_prefix VARCHAR(10) DEFAULT 'MS';

COMMENT ON COLUMN routes.video_url IS 'URL do vídeo inspirador do roteiro';
COMMENT ON COLUMN routes.passport_number_prefix IS 'Prefixo para números de passaporte desta rota';

-- ============================================
-- NOVAS TABELAS
-- ============================================

-- Tabela: passport_configurations
CREATE TABLE IF NOT EXISTS passport_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stamp_theme VARCHAR(20) NOT NULL CHECK (stamp_theme IN ('onca', 'tuiuiu', 'jacare', 'arara')),
  stamp_fragments INTEGER NOT NULL DEFAULT 5 CHECK (stamp_fragments > 0),
  video_url TEXT,
  description TEXT,
  map_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(route_id)
);

COMMENT ON TABLE passport_configurations IS 'Configurações de passaporte para cada rota';
COMMENT ON COLUMN passport_configurations.stamp_theme IS 'Tema do carimbo: onca, tuiuiu, jacare, arara';
COMMENT ON COLUMN passport_configurations.stamp_fragments IS 'Quantidade de checkpoints que formam o selo completo';
COMMENT ON COLUMN passport_configurations.map_config IS 'Configuração do mapa interativo (JSON)';

-- Tabela: passport_rewards
CREATE TABLE IF NOT EXISTS passport_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  partner_name VARCHAR(255) NOT NULL,
  reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('desconto', 'brinde', 'experiencia')),
  reward_description TEXT,
  reward_code_prefix VARCHAR(20),
  discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  partner_address TEXT,
  partner_phone VARCHAR(50),
  partner_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE passport_rewards IS 'Recompensas disponíveis por rota';
COMMENT ON COLUMN passport_rewards.reward_type IS 'Tipo: desconto, brinde, experiencia';
COMMENT ON COLUMN passport_rewards.reward_code_prefix IS 'Prefixo para códigos de voucher únicos';

-- Tabela: user_rewards
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES passport_rewards(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  voucher_code VARCHAR(50) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reward_id, route_id)
);

COMMENT ON TABLE user_rewards IS 'Recompensas desbloqueadas pelos usuários';
COMMENT ON COLUMN user_rewards.voucher_code IS 'Código único do voucher para apresentar ao parceiro';

-- Tabela: offline_checkins
CREATE TABLE IF NOT EXISTS offline_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES route_checkpoints(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy INTEGER,
  photo_url TEXT,
  photo_metadata JSONB,
  device_info TEXT,
  synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated BOOLEAN DEFAULT false,
  validation_error TEXT
);

COMMENT ON TABLE offline_checkins IS 'Check-ins feitos offline, aguardando sincronização';
COMMENT ON COLUMN offline_checkins.photo_metadata IS 'Metadados da foto (EXIF, geolocalização)';

-- Tabela: user_passports (número único do passaporte)
CREATE TABLE IF NOT EXISTS user_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  passport_number VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_passports IS 'Número único do passaporte por usuário';

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_passport_configurations_route ON passport_configurations(route_id);
CREATE INDEX IF NOT EXISTS idx_passport_configurations_active ON passport_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_passport_rewards_route ON passport_rewards(route_id);
CREATE INDEX IF NOT EXISTS idx_passport_rewards_active ON passport_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_route ON user_rewards(route_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_voucher ON user_rewards(voucher_code);
CREATE INDEX IF NOT EXISTS idx_offline_checkins_user ON offline_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_checkins_synced ON offline_checkins(synced);
CREATE INDEX IF NOT EXISTS idx_offline_checkins_checkpoint ON offline_checkins(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_fragment ON route_checkpoints(route_id, stamp_fragment_number);

-- ============================================
-- FUNÇÕES SQL
-- ============================================

-- Função: Gerar número único do passaporte
CREATE OR REPLACE FUNCTION generate_passport_number(prefix VARCHAR DEFAULT 'MS')
RETURNS VARCHAR AS $$
DECLARE
  timestamp_part VARCHAR;
  random_part VARCHAR;
  passport_num VARCHAR;
BEGIN
  -- Formato: MS-YYYYMMDD-HHMMSS-XXXXXX
  timestamp_part := TO_CHAR(NOW(), 'YYYYMMDD-HHMMSS');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) || MD5(NOW()::TEXT), 1, 6));
  passport_num := prefix || '-' || timestamp_part || '-' || random_part;
  
  -- Garantir unicidade
  WHILE EXISTS (SELECT 1 FROM user_passports WHERE passport_number = passport_num) LOOP
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) || MD5(NOW()::TEXT), 1, 6));
    passport_num := prefix || '-' || timestamp_part || '-' || random_part;
  END LOOP;
  
  RETURN passport_num;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular distância entre dois pontos (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC,
  lon1 NUMERIC,
  lat2 NUMERIC,
  lon2 NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  earth_radius NUMERIC := 6371000; -- metros
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  
  a := SIN(dlat/2) * SIN(dlat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon/2) * SIN(dlon/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função: Validar geofence (proximidade)
CREATE OR REPLACE FUNCTION check_geofence(
  checkpoint_lat NUMERIC,
  checkpoint_lon NUMERIC,
  user_lat NUMERIC,
  user_lon NUMERIC,
  radius_meters INTEGER DEFAULT 100
)
RETURNS BOOLEAN AS $$
DECLARE
  distance NUMERIC;
BEGIN
  distance := calculate_distance(checkpoint_lat, checkpoint_lon, user_lat, user_lon);
  RETURN distance <= radius_meters;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função: Validar rate limiting de check-ins
CREATE OR REPLACE FUNCTION check_checkin_rate_limit(
  p_user_id UUID,
  p_max_checkins INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*) INTO v_count
  FROM passport_stamps
  WHERE user_id = p_user_id
    AND stamped_at >= v_window_start;
  
  RETURN v_count < p_max_checkins;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Desbloquear recompensas ao completar roteiro
CREATE OR REPLACE FUNCTION unlock_rewards(
  p_user_id UUID,
  p_route_id UUID
)
RETURNS TABLE(reward_id UUID, voucher_code VARCHAR) AS $$
DECLARE
  v_reward RECORD;
  v_voucher_code VARCHAR;
  v_prefix VARCHAR;
BEGIN
  -- Verificar se roteiro foi completado (todos os checkpoints)
  IF NOT EXISTS (
    SELECT 1
    FROM route_checkpoints rc
    WHERE rc.route_id = p_route_id
      AND NOT EXISTS (
        SELECT 1
        FROM passport_stamps ps
        WHERE ps.checkpoint_id = rc.id
          AND ps.user_id = p_user_id
      )
  ) THEN
    -- Roteiro completo, desbloquear recompensas
    FOR v_reward IN
      SELECT * FROM passport_rewards
      WHERE route_id = p_route_id
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND NOT EXISTS (
          SELECT 1 FROM user_rewards
          WHERE user_id = p_user_id
            AND reward_id = v_reward.id
        )
    LOOP
      -- Gerar código de voucher único
      v_prefix := COALESCE(v_reward.reward_code_prefix, 'MS');
      v_voucher_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(p_user_id::TEXT || v_reward.id::TEXT || NOW()::TEXT), 1, 8));
      
      -- Garantir unicidade
      WHILE EXISTS (SELECT 1 FROM user_rewards WHERE voucher_code = v_voucher_code) LOOP
        v_voucher_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(p_user_id::TEXT || v_reward.id::TEXT || NOW()::TEXT || RANDOM()::TEXT), 1, 8));
      END LOOP;
      
      -- Inserir recompensa
      INSERT INTO user_rewards (user_id, reward_id, route_id, voucher_code)
      VALUES (p_user_id, v_reward.id, p_route_id, v_voucher_code)
      RETURNING id, voucher_code INTO v_reward.id, v_voucher_code;
      
      RETURN QUERY SELECT v_reward.id, v_voucher_code;
    END LOOP;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_passport_configurations_updated_at ON passport_configurations;
CREATE TRIGGER update_passport_configurations_updated_at
  BEFORE UPDATE ON passport_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_passport_rewards_updated_at ON passport_rewards;
CREATE TRIGGER update_passport_rewards_updated_at
  BEFORE UPDATE ON passport_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_passports_updated_at ON user_passports;
CREATE TRIGGER update_user_passports_updated_at
  BEFORE UPDATE ON user_passports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE passport_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passports ENABLE ROW LEVEL SECURITY;

-- Políticas para passport_configurations
DROP POLICY IF EXISTS "Anyone can view active passport configurations" ON passport_configurations;
CREATE POLICY "Anyone can view active passport configurations"
  ON passport_configurations FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage passport configurations" ON passport_configurations;
CREATE POLICY "Admins can manage passport configurations"
  ON passport_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Políticas para passport_rewards
DROP POLICY IF EXISTS "Anyone can view active rewards" ON passport_rewards;
CREATE POLICY "Anyone can view active rewards"
  ON passport_rewards FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage rewards" ON passport_rewards;
CREATE POLICY "Admins can manage rewards"
  ON passport_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Políticas para user_rewards
DROP POLICY IF EXISTS "Users can view their own rewards" ON user_rewards;
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rewards (marcar como usado)" ON user_rewards;
CREATE POLICY "Users can update their own rewards (marcar como usado)"
  ON user_rewards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert rewards for users" ON user_rewards;
CREATE POLICY "System can insert rewards for users"
  ON user_rewards FOR INSERT
  WITH CHECK (true);

-- Políticas para offline_checkins
DROP POLICY IF EXISTS "Users can manage their own offline checkins" ON offline_checkins;
CREATE POLICY "Users can manage their own offline checkins"
  ON offline_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_passports
DROP POLICY IF EXISTS "Users can view their own passport" ON user_passports;
CREATE POLICY "Users can view their own passport"
  ON user_passports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create passports for users" ON user_passports;
CREATE POLICY "System can create passports for users"
  ON user_passports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own passport" ON user_passports;
CREATE POLICY "Users can update their own passport"
  ON user_passports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

