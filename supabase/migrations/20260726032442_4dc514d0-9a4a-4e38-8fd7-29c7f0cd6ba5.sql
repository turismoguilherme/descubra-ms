-- Reclaim de espaço sem VACUUM FULL: preserva as linhas recentes, trunca (libera disco) e reinsere
CREATE TEMP TABLE _keep_audit ON COMMIT DROP AS
  SELECT * FROM public.security_audit_log;

TRUNCATE TABLE public.security_audit_log;

INSERT INTO public.security_audit_log SELECT * FROM _keep_audit;