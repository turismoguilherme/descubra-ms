-- ============================================================
-- LIMPEZA DIAGNOSTICADA (supabase inspect db table-stats / index-stats)
-- Achados no projeto remoto:
--   - idx_chunks_vec ~968 kB UNUSED e document_chunks com 0 rows
--   - idx_security_audit_log_metadata ~160 kB UNUSED
--   - varias tabelas legado/Master/FlowTrip com 0 rows ainda no schema
-- NAO mexe em: events, guata_user_memory, guata_cartilhas, user_*,
--              institutional_partners, site_settings, tourist_regions
-- ============================================================

-- Helper: so dropa se existir e estiver vazia
CREATE OR REPLACE FUNCTION public._drop_if_empty_v2(p_schema text, p_table text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  n bigint;
  fq text := format('%I.%I', p_schema, p_table);
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = p_schema AND table_name = p_table
  ) THEN
    RETURN format('skip missing %s', fq);
  END IF;

  EXECUTE format('SELECT COUNT(*) FROM %I.%I', p_schema, p_table) INTO n;
  IF n = 0 THEN
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', p_schema, p_table);
    RETURN format('dropped empty %s', fq);
  END IF;
  RETURN format('kept %s (%s rows)', fq, n);
END;
$$;

-- 1) Maior ganho de espaco: indices RAG mortos (0 linhas / 0 scans)
DROP INDEX IF EXISTS public.idx_chunks_vec;
DROP INDEX IF EXISTS public.idx_chunks_fts;

-- 2) Indice de auditoria nunca usado
DROP INDEX IF EXISTS public.idx_security_audit_log_metadata;

-- 3) Guata legado (0 rows) — nao e o Capacita atual
SELECT public._drop_if_empty_v2('public', 'guata_tourist_attractions');
SELECT public._drop_if_empty_v2('public', 'guata_itineraries');
SELECT public._drop_if_empty_v2('public', 'guata_events');
SELECT public._drop_if_empty_v2('public', 'guata_verified_partners');
SELECT public._drop_if_empty_v2('public', 'guata_search_stats');

-- 4) Master / FlowTrip / commercial (0 rows) — fora do Descubra MS atual
SELECT public._drop_if_empty_v2('public', 'master_system_metrics');
SELECT public._drop_if_empty_v2('public', 'master_platform_config');
SELECT public._drop_if_empty_v2('public', 'master_support_tickets');
SELECT public._drop_if_empty_v2('public', 'master_ai_feedback');
SELECT public._drop_if_empty_v2('public', 'flowtrip_state_features');
SELECT public._drop_if_empty_v2('public', 'flowtrip_onboarding_steps');
SELECT public._drop_if_empty_v2('public', 'flowtrip_white_label_configs');
SELECT public._drop_if_empty_v2('public', 'flowtrip_support_tickets');
SELECT public._drop_if_empty_v2('public', 'commercial_subscription_plans');
SELECT public._drop_if_empty_v2('public', 'commercial_partner_metrics');
SELECT public._drop_if_empty_v2('public', 'offline_checkins');
SELECT public._drop_if_empty_v2('public', 'inventory_analytics');
SELECT public._drop_if_empty_v2('public', 'ai_seo_improvements');
SELECT public._drop_if_empty_v2('public', 'secretary_files');
SELECT public._drop_if_empty_v2('public', 'partner_translations');
SELECT public._drop_if_empty_v2('public', 'overflow_one_users');

-- Koda mantido de proposito (nao dropar koda_response_cache)

DROP FUNCTION IF EXISTS public._drop_if_empty_v2(text, text);

-- Resultado: maiores tabelas depois
SELECT
  c.relname AS relation,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  COALESCE(s.n_live_tup, 0) AS est_rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 25;

-- OBS: VACUUM nao roda dentro de transacao do SQL Editor.
-- Se quiser compactar depois, rode SEPARADO (um por vez):
--   VACUUM public.document_chunks;
--   VACUUM public.security_audit_log;
--   VACUUM public.system_health_checks;
--   VACUUM public.events;
