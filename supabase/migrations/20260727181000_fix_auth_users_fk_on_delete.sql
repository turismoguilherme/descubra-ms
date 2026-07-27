-- Fix auth.users FKs that block admin deleteUser with "Database error deleting user".
-- Personal user data → CASCADE; authorship/audit columns → SET NULL.

CREATE OR REPLACE FUNCTION public._rewrite_auth_users_fk(
  p_table regclass,
  p_column text,
  p_on_delete text -- 'CASCADE' | 'SET NULL'
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_conname text;
  v_nullable boolean;
BEGIN
  IF to_regclass(p_table::text) IS NULL THEN
    RAISE NOTICE 'skip missing table %', p_table;
    RETURN;
  END IF;

  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
  JOIN pg_class rel ON rel.oid = c.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  JOIN pg_class frel ON frel.oid = c.confrelid
  JOIN pg_namespace fnsp ON fnsp.oid = frel.relnamespace
  WHERE c.contype = 'f'
    AND c.conrelid = p_table
    AND a.attname = p_column
    AND fnsp.nspname = 'auth'
    AND frel.relname = 'users'
  LIMIT 1;

  IF v_conname IS NULL THEN
    RAISE NOTICE 'skip missing FK %.%', p_table, p_column;
    RETURN;
  END IF;

  SELECT NOT a.attnotnull INTO v_nullable
  FROM pg_attribute a
  WHERE a.attrelid = p_table
    AND a.attname = p_column
    AND NOT a.attisdropped;

  IF p_on_delete = 'SET NULL' AND NOT v_nullable THEN
    EXECUTE format('ALTER TABLE %s ALTER COLUMN %I DROP NOT NULL', p_table, p_column);
  END IF;

  EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', p_table, v_conname);
  EXECUTE format(
    'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE %s',
    p_table,
    v_conname,
    p_column,
    p_on_delete
  );
END;
$$;

-- Personal / owned data
SELECT public._rewrite_auth_users_fk('public.passport_stamps', 'user_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.user_achievements', 'user_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.attendant_checkins', 'attendant_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.attendant_timesheet', 'user_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.inventory_reviews', 'user_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.checkpoint_code_attempts', 'user_id', 'CASCADE');
SELECT public._rewrite_auth_users_fk('public.app_push_devices', 'user_id', 'CASCADE');

-- Authorship / audit (preserve rows)
SELECT public._rewrite_auth_users_fk('public.routes', 'created_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.security_audit_log', 'user_id', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.leads', 'created_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.leads', 'assigned_to', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.tourism_inventory', 'created_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.destinations', 'created_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.passport_configurations', 'created_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.pending_refunds', 'processed_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.system_alerts', 'resolved_by', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.content_audit_log', 'user_id', 'SET NULL');
SELECT public._rewrite_auth_users_fk('public.site_settings', 'updated_by', 'SET NULL');

DROP FUNCTION public._rewrite_auth_users_fk(regclass, text, text);
