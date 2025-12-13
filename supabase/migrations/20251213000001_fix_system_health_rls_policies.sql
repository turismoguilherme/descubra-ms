-- Fix RLS policies for system health tables
-- Correção: usar user_roles ao invés de user_profiles.role

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Admins can view system health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Admins can insert system health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Admins can view system alerts" ON system_alerts;
DROP POLICY IF EXISTS "Admins can insert system alerts" ON system_alerts;
DROP POLICY IF EXISTS "Admins can update system alerts" ON system_alerts;

-- Criar políticas corretas usando user_roles
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

-- Atualizar função RPC para usar SECURITY DEFINER e verificar permissões
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

