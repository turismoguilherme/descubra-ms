-- ============================================================
-- SCRIPT COMPLETO: System Health Monitoring
-- ============================================================
-- Execute este script no Supabase SQL Editor para criar
-- todas as tabelas e políticas necessárias
-- ============================================================

-- Tabela de verificações de saúde do sistema
CREATE TABLE IF NOT EXISTS system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('database', 'auth', 'storage', 'api', 'email', 'cdn', 'other')),
  status TEXT NOT NULL CHECK (status IN ('online', 'slow', 'offline', 'checking')),
  latency_ms INTEGER,
  response_data JSONB,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas do sistema
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('error', 'warning', 'info')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de alertas
CREATE TABLE IF NOT EXISTS system_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  email_address TEXT,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  downtime_alerts BOOLEAN DEFAULT true,
  slow_response_alerts BOOLEAN DEFAULT true,
  error_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_system_health_checks_service_name ON system_health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON system_health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON system_health_checks(status);

CREATE INDEX IF NOT EXISTS idx_system_alerts_service_name ON system_alerts(service_name);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_alert_type ON system_alerts(alert_type);

-- RLS Policies
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alert_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Admins can view system health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Admins can insert system health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Admins can view system alerts" ON system_alerts;
DROP POLICY IF EXISTS "Admins can insert system alerts" ON system_alerts;
DROP POLICY IF EXISTS "Admins can update system alerts" ON system_alerts;

-- Políticas para system_health_checks (admins podem ler/escrever)
CREATE POLICY "Admins can view system health checks"
  ON system_health_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert system health checks"
  ON system_health_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Políticas para system_alerts (admins podem ler/escrever)
CREATE POLICY "Admins can view system alerts"
  ON system_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert system alerts"
  ON system_alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

CREATE POLICY "Admins can update system alerts"
  ON system_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Políticas para system_alert_config (usuários podem gerenciar suas próprias configurações)
CREATE POLICY "Users can view their own alert config"
  ON system_alert_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert config"
  ON system_alert_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert config"
  ON system_alert_config FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para calcular uptime das últimas 24h
CREATE OR REPLACE FUNCTION calculate_system_uptime_24h(service_name_param TEXT DEFAULT NULL)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_checks INTEGER;
  online_checks INTEGER;
  uptime_percentage NUMERIC;
BEGIN
  -- Verificar se o usuário tem permissão de admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  ) THEN
    RETURN 0.0; -- Retornar 0 se não for admin
  END IF;

  IF service_name_param IS NULL THEN
    -- Calcular uptime geral (todos os serviços)
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'online')
    INTO total_checks, online_checks
    FROM system_health_checks
    WHERE checked_at >= NOW() - INTERVAL '24 hours';
  ELSE
    -- Calcular uptime para um serviço específico
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'online')
    INTO total_checks, online_checks
    FROM system_health_checks
    WHERE service_name = service_name_param
    AND checked_at >= NOW() - INTERVAL '24 hours';
  END IF;

  IF total_checks = 0 THEN
    RETURN 100.0; -- Se não há verificações, assumir 100%
  END IF;

  uptime_percentage := (online_checks::NUMERIC / total_checks::NUMERIC) * 100.0;
  RETURN ROUND(uptime_percentage, 2);
END;
$$;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute estas queries para verificar se tudo foi criado:

-- Verificar tabelas criadas
SELECT 
    table_name,
    'Tabela criada ✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_health_checks', 'system_alerts', 'system_alert_config')
ORDER BY table_name;

-- Verificar políticas RLS criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    'Política RLS criada ✅' as status
FROM pg_policies
WHERE tablename IN ('system_health_checks', 'system_alerts', 'system_alert_config')
ORDER BY tablename, policyname;

-- Verificar função RPC
SELECT 
    routine_name as function_name,
    'Função criada ✅' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'calculate_system_uptime_24h';

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- 3 tabelas (system_health_checks, system_alerts, system_alert_config)
-- 8 políticas RLS (3 para system_health_checks, 3 para system_alerts, 3 para system_alert_config)
-- 1 função RPC (calculate_system_uptime_24h)
-- ============================================================

