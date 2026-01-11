-- Migration: Limpeza Automática de Eventos
-- Data: 2025-02-02
-- Descrição: Remove eventos expirados e rejeitados automaticamente para economizar espaço no banco

-- Habilitar extensão pg_cron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar tabela de log para auditoria PRIMEIRO (antes das funções que a usam)
CREATE TABLE IF NOT EXISTS public.event_cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expired_events_deleted INTEGER NOT NULL DEFAULT 0,
  rejected_events_deleted INTEGER NOT NULL DEFAULT 0,
  total_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_event_ids UUID[],
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.event_cleanup_logs IS 
'Log de execuções da limpeza automática de eventos para auditoria';

-- Criar índice para consultas de log
CREATE INDEX IF NOT EXISTS idx_event_cleanup_logs_execution_date 
ON public.event_cleanup_logs(execution_date DESC);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.event_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de logs de limpeza para autenticados" ON public.event_cleanup_logs;
CREATE POLICY "Permitir leitura de logs de limpeza para autenticados"
ON public.event_cleanup_logs
FOR SELECT
TO authenticated
USING (true);

-- Criar função para limpeza de eventos expirados (90 dias após término)
CREATE OR REPLACE FUNCTION public.cleanup_expired_events()
RETURNS TABLE(
  deleted_count INTEGER,
  deleted_ids UUID[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_ids_array UUID[];
  deleted_count_var INTEGER;
BEGIN
  -- Deletar eventos onde end_date passou há mais de 90 dias
  -- Ou start_date passou há mais de 90 dias (se end_date for NULL)
  WITH deleted AS (
    DELETE FROM public.events
    WHERE (
      (end_date IS NOT NULL AND end_date < NOW() - INTERVAL '90 days')
      OR (end_date IS NULL AND start_date IS NOT NULL AND start_date < NOW() - INTERVAL '90 days')
    )
    AND COALESCE(approval_status, '') != 'rejected' -- Eventos rejeitados são limpos separadamente
    RETURNING id
  )
  SELECT 
    COUNT(*),
    ARRAY_AGG(id)
  INTO deleted_count_var, deleted_ids_array
  FROM deleted;

  RETURN QUERY SELECT 
    COALESCE(deleted_count_var, 0),
    COALESCE(deleted_ids_array, ARRAY[]::UUID[]);
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_events() IS 
'Remove eventos expirados (end_date passou há mais de 90 dias) para economizar espaço no banco';

-- Criar função para limpeza de eventos rejeitados (30 dias após rejeição)
CREATE OR REPLACE FUNCTION public.cleanup_rejected_events()
RETURNS TABLE(
  deleted_count INTEGER,
  deleted_ids UUID[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_ids_array UUID[];
  deleted_count_var INTEGER;
BEGIN
  -- Deletar eventos rejeitados há mais de 30 dias
  WITH deleted AS (
    DELETE FROM public.events
    WHERE approval_status = 'rejected'
    AND updated_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT 
    COUNT(*),
    ARRAY_AGG(id)
  INTO deleted_count_var, deleted_ids_array
  FROM deleted;

  RETURN QUERY SELECT 
    COALESCE(deleted_count_var, 0),
    COALESCE(deleted_ids_array, ARRAY[]::UUID[]);
END;
$$;

COMMENT ON FUNCTION public.cleanup_rejected_events() IS 
'Remove eventos rejeitados (rejeitados há mais de 30 dias) para economizar espaço no banco';

-- Criar função para registrar log de limpeza (ANTES de cleanup_all_events_with_logging)
CREATE OR REPLACE FUNCTION public.log_event_cleanup(
  p_expired_count INTEGER,
  p_rejected_count INTEGER,
  p_total_count INTEGER,
  p_deleted_ids UUID[],
  p_result JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.event_cleanup_logs (
    execution_date,
    expired_events_deleted,
    rejected_events_deleted,
    total_deleted,
    deleted_event_ids,
    result
  ) VALUES (
    NOW(),
    p_expired_count,
    p_rejected_count,
    p_total_count,
    p_deleted_ids,
    p_result
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

COMMENT ON FUNCTION public.log_event_cleanup(INTEGER, INTEGER, INTEGER, UUID[], JSONB) IS 
'Registra log de execução da limpeza de eventos para auditoria';

-- Criar função unificada que executa ambas as limpezas COM logging
CREATE OR REPLACE FUNCTION public.cleanup_all_events_with_logging()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_result RECORD;
  rejected_result RECORD;
  result JSONB;
  log_id UUID;
  all_deleted_ids UUID[];
BEGIN
  -- Limpar eventos expirados
  SELECT * INTO expired_result FROM public.cleanup_expired_events();
  
  -- Limpar eventos rejeitados
  SELECT * INTO rejected_result FROM public.cleanup_rejected_events();
  
  -- Combinar IDs deletados
  all_deleted_ids := COALESCE(expired_result.deleted_ids, ARRAY[]::UUID[]) || 
                     COALESCE(rejected_result.deleted_ids, ARRAY[]::UUID[]);
  
  -- Retornar resultado em formato JSON
  result := jsonb_build_object(
    'success', true,
    'timestamp', NOW(),
    'expired_events', jsonb_build_object(
      'deleted_count', expired_result.deleted_count,
      'deleted_ids', expired_result.deleted_ids
    ),
    'rejected_events', jsonb_build_object(
      'deleted_count', rejected_result.deleted_count,
      'deleted_ids', rejected_result.deleted_ids
    ),
    'total_deleted', (expired_result.deleted_count + rejected_result.deleted_count)
  );
  
  -- Registrar log
  SELECT public.log_event_cleanup(
    expired_result.deleted_count,
    rejected_result.deleted_count,
    (expired_result.deleted_count + rejected_result.deleted_count),
    all_deleted_ids,
    result
  ) INTO log_id;
  
  -- Adicionar log_id ao resultado
  result := result || jsonb_build_object('log_id', log_id);
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.cleanup_all_events_with_logging() IS 
'Função unificada que executa limpeza de eventos e registra log para auditoria';

-- Função auxiliar para verificar quantos eventos seriam deletados (sem deletar)
CREATE OR REPLACE FUNCTION public.check_events_to_cleanup()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
  rejected_count INTEGER;
  result JSONB;
BEGIN
  -- Contar eventos expirados que seriam deletados
  SELECT COUNT(*) INTO expired_count
  FROM public.events
  WHERE (
    (end_date IS NOT NULL AND end_date < NOW() - INTERVAL '90 days')
    OR (end_date IS NULL AND start_date IS NOT NULL AND start_date < NOW() - INTERVAL '90 days')
  )
  AND COALESCE(approval_status, '') != 'rejected';
  
  -- Contar eventos rejeitados que seriam deletados
  SELECT COUNT(*) INTO rejected_count
  FROM public.events
  WHERE approval_status = 'rejected'
  AND updated_at < NOW() - INTERVAL '30 days';
  
  result := jsonb_build_object(
    'expired_events_count', expired_count,
    'rejected_events_count', rejected_count,
    'total_count', (expired_count + rejected_count),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.check_events_to_cleanup() IS 
'Verifica quantos eventos seriam deletados na próxima limpeza (sem deletar)';

-- Remover cron job anterior se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-events-daily') THEN
    PERFORM cron.unschedule('cleanup-events-daily');
  END IF;
END $$;

-- Criar cron job para executar limpeza diariamente às 2h da manhã
SELECT cron.schedule(
  'cleanup-events-daily',
  '0 2 * * *', -- Todos os dias às 2h da manhã (formato cron: minuto hora dia mês dia-da-semana)
  $$
  SELECT public.cleanup_all_events_with_logging();
  $$
);
