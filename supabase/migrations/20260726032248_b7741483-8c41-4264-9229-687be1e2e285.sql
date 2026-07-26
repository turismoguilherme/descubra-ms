-- Retenção mais curta: o log ocupa ~10 KB por linha
CREATE OR REPLACE FUNCTION public.purge_old_security_audit_logs(_days integer DEFAULT 30)
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

DELETE FROM public.security_audit_log WHERE created_at < now() - interval '30 days';