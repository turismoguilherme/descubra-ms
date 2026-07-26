-- Retenção de logs de auditoria (90 dias) para conter o crescimento da tabela
CREATE OR REPLACE FUNCTION public.purge_old_security_audit_logs(_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.security_audit_log
  WHERE created_at < now() - (_days || ' days')::interval;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_security_audit_logs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_security_audit_logs(integer) TO service_role;

-- Limpeza imediata: logs antigos e caches expirados
DELETE FROM public.security_audit_log WHERE created_at < now() - interval '90 days';
DELETE FROM public.guata_response_cache WHERE expires_at IS NOT NULL AND expires_at < now();
DELETE FROM public.koda_response_cache WHERE expires_at IS NOT NULL AND expires_at < now();