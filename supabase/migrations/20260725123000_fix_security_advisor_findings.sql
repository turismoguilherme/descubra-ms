-- ============================================================
-- Fix Security Advisor findings:
-- 1) RAG documents / document_chunks — remove broad authenticated SELECT
-- 2) flowtrip_state_features — revoke anon + proper admin/state RLS
-- 3) SECURITY DEFINER — revoke PUBLIC/anon; grant only intentional RPCs
-- 4) Storage INSERT — documents, partner-images, tourism-images
-- ============================================================

-- ------------------------------------------------------------
-- 1) RAG documents: only admins, state managers, service_role
--    Guatá RAG reads via edge function (service_role), not client.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can access public tourism documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can access public document chunks" ON public.document_chunks;

-- Keep / refresh admin + regional policies with master_admin
DROP POLICY IF EXISTS "Admins can access all documents" ON public.documents;
CREATE POLICY "Admins can access all documents"
ON public.documents
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can access all document chunks" ON public.document_chunks;
CREATE POLICY "Admins can access all document chunks"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Regional managers can access state documents" ON public.documents;
CREATE POLICY "Regional managers can access state documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.flowtrip_states fs ON ur.state_id = fs.id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal', 'municipal_manager')
      AND fs.code = documents.state_code
  )
);

DROP POLICY IF EXISTS "Regional managers can access state document chunks" ON public.document_chunks;
CREATE POLICY "Regional managers can access state document chunks"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.flowtrip_states fs ON ur.state_id = fs.id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal', 'municipal_manager')
      AND fs.code = document_chunks.state_code
  )
);

-- Align can_access_document with the same rules (no soft public category bypass)
CREATE OR REPLACE FUNCTION public.can_access_document(
  p_document_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_state_code text;
  user_role text;
  user_state_id uuid;
BEGIN
  SELECT state_code INTO doc_state_code
  FROM public.documents
  WHERE id = p_document_id;

  IF doc_state_code IS NULL THEN
    RETURN false;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN coalesce(auth.role(), current_setting('role', true)) = 'service_role';
  END IF;

  IF public.is_admin_user(p_user_id) THEN
    RETURN true;
  END IF;

  SELECT ur.role, ur.state_id
  INTO user_role, user_state_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
    AND ur.role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal', 'municipal_manager')
  LIMIT 1;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.flowtrip_states fs
    WHERE fs.id = user_state_id
      AND fs.code = doc_state_code
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_document(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_document(uuid, uuid) TO authenticated, service_role;

-- ------------------------------------------------------------
-- 2) flowtrip_state_features
-- ------------------------------------------------------------
REVOKE ALL ON TABLE public.flowtrip_state_features FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.flowtrip_state_features FROM authenticated;

DROP POLICY IF EXISTS "State admins can manage features" ON public.flowtrip_state_features;

CREATE POLICY "Admins manage all state features"
ON public.flowtrip_state_features
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "State managers manage own state features"
ON public.flowtrip_state_features
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('diretor_estadual', 'gestor_igr')
      AND ur.state_id IS NOT NULL
      AND ur.state_id = flowtrip_state_features.state_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('diretor_estadual', 'gestor_igr')
      AND ur.state_id IS NOT NULL
      AND ur.state_id = flowtrip_state_features.state_id
  )
);

-- Authenticated may SELECT only features for states they manage (or all if admin via policy above)
-- Keep SELECT grant for authenticated so policies can apply
GRANT SELECT ON TABLE public.flowtrip_state_features TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.flowtrip_state_features TO authenticated;

-- ------------------------------------------------------------
-- 3) SECURITY DEFINER EXECUTE hardening
--    Revoke PUBLIC/anon on all public SECURITY DEFINER functions,
--    then re-grant intentional client RPCs to authenticated.
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon',
        r.schema_name, r.func_name, r.args
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip revoke %.%(%) : %', r.schema_name, r.func_name, r.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Privileged / dangerous: authenticated must NOT execute
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'elevate_to_admin(text)',
    'assign_user_role(uuid,text,uuid,uuid)',
    'promote_user_to_role(text,text)',
    'secure_update_user_role(uuid,text,uuid)',
    'create_initial_admin_if_needed(text,uuid)',
    'create_initial_admin_user(text,text,text)',
    'create_attendant_user(text,text,uuid,text,boolean)',
    'create_test_user_profiles()',
    'ensure_admin_exists()',
    'fix_incomplete_profiles()',
    'delete_passport_stamps_by_route(uuid)',
    'guata_try_consume_gemini_budget(integer)',
    'audit_table_changes()',
    'auto_expire_events()',
    'check_events_to_cleanup()',
    'cleanup_expired_events()',
    'cleanup_all_events_with_logging()',
    'cleanup_old_ai_logs()',
    'cleanup_rejected_events()',
    'commercial_partners_protect_moderation()',
    'tourism_inventory_protect_moderation()',
    'update_commercial_partners_updated_at()',
    'validate_commercial_partner_insert()',
    'create_plano_diretor_historico_entry()',
    'log_event_cleanup(integer,integer,integer,uuid[],jsonb)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing privileged fn: %', fn;
    END;
  END LOOP;
END $$;

-- Intentional client RPCs (authenticated) — grant all overloads by name
DO $$
DECLARE
  r record;
  names text[] := ARRAY[
    'is_admin_user',
    'get_user_role',
    'partner_row_is_mine',
    'can_access_document',
    'validate_partner_code',
    'validate_attendant_checkin',
    'get_attendant_checkin_stats',
    'update_user_points',
    'unlock_rewards',
    'unlock_route_avatars',
    'check_geofence',
    'check_checkin_rate_limit',
    'insert_partner_application',
    'increment_guata_kb_usage',
    'increment_guata_cache_usage',
    'calculate_user_level',
    'record_password_change',
    'generate_partner_code',
    'validate_data_availability',
    'log_data_sale_action',
    'increment_suggestion_votes_count',
    'increment_suggestion_comments_count',
    'update_suggestion_votes_count'
  ];
BEGIN
  FOR r IN
    SELECT p.oid, n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY (names)
  LOOP
    BEGIN
      EXECUTE format(
        'GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated',
        r.nspname, r.proname, r.args
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip grant %.%(%) : %', r.nspname, r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Keep service_role on budget helper (edge functions)
DO $$
BEGIN
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.guata_try_consume_gemini_budget(integer) TO service_role';
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'guata_try_consume_gemini_budget missing — skip';
END $$;

-- ------------------------------------------------------------
-- 4) Storage INSERT hardening
-- ------------------------------------------------------------

-- documents: drop open INSERT
DROP POLICY IF EXISTS "Permitir upload de documentos de termos" ON storage.objects;

CREATE POLICY "Admins upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public.is_admin_user(auth.uid())
);

-- Partners: only partner-terms paths for their own partner id
CREATE POLICY "Partners upload own terms PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    name LIKE 'partner-terms/%'
    OR name LIKE 'partner-terms-uploaded/%'
  )
  AND (
    -- path contains partner uuid they own
    EXISTS (
      SELECT 1
      FROM public.institutional_partners ip
      WHERE public.partner_row_is_mine(ip.id)
        AND (
          name LIKE ('partner-terms/partner-terms-' || ip.id::text || '-%')
          OR name LIKE ('partner-terms-uploaded/' || ip.id::text || '-%')
        )
    )
  )
);

-- Authenticated users: only own consent PDFs
CREATE POLICY "Users upload own consent PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND name LIKE ('consents/consent-' || auth.uid()::text || '-%')
);

-- tourism-images: privileged roles OR scoped chat/event-logo folder
DROP POLICY IF EXISTS "Authenticated users can upload tourism images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de imagens de turismo" ON storage.objects;

CREATE POLICY "Privileged upload tourism images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tourism-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY[
        'admin','tech','master_admin',
        'municipal_manager','gestor_municipal',
        'diretor_estadual','gestor_igr'
      ])
  )
);

-- Guatá chat / event logo uploads (folder-scoped, not whole bucket)
CREATE POLICY "Authenticated upload event-logos folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tourism-images'
  AND (storage.foldername(name))[1] = 'event-logos'
);

-- partner-images: admins OR own partner folder
DROP POLICY IF EXISTS "Permitir upload de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload partner images" ON storage.objects;

CREATE POLICY "Admins upload partner images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-images'
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Partners upload own partner images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-images'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.partner_row_is_mine(((storage.foldername(name))[1])::uuid)
);

-- Also allow partners to update/delete their own folder (admins already covered)
DROP POLICY IF EXISTS "Partners manage own partner-images" ON storage.objects;
CREATE POLICY "Partners manage own partner-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'partner-images'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.partner_row_is_mine(((storage.foldername(name))[1])::uuid)
)
WITH CHECK (
  bucket_id = 'partner-images'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.partner_row_is_mine(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Partners delete own partner-images" ON storage.objects;
CREATE POLICY "Partners delete own partner-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-images'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.partner_row_is_mine(((storage.foldername(name))[1])::uuid)
);

-- event-images: restrict INSERT to privileged roles (was any authenticated)
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de imagens de eventos" ON storage.objects;

CREATE POLICY "Privileged upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY[
        'admin','tech','master_admin',
        'municipal_manager','gestor_municipal',
        'diretor_estadual','gestor_igr'
      ])
  )
);
