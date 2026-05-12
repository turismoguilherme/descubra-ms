-- ============================================================
-- 1) GUATÁ TABLES — habilitar RLS + políticas
-- ============================================================
ALTER TABLE public.guata_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guata_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guata_tourist_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guata_verified_partners ENABLE ROW LEVEL SECURITY;

-- guata_events: leitura pública, escrita admin
DROP POLICY IF EXISTS "guata_events_public_read" ON public.guata_events;
CREATE POLICY "guata_events_public_read" ON public.guata_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "guata_events_admin_write" ON public.guata_events;
CREATE POLICY "guata_events_admin_write" ON public.guata_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')));

DROP POLICY IF EXISTS "guata_itineraries_public_read" ON public.guata_itineraries;
CREATE POLICY "guata_itineraries_public_read" ON public.guata_itineraries FOR SELECT USING (true);
DROP POLICY IF EXISTS "guata_itineraries_admin_write" ON public.guata_itineraries;
CREATE POLICY "guata_itineraries_admin_write" ON public.guata_itineraries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')));

-- guata_tourist_attractions: leitura pública SEM email/phone via view; base só admin lê tudo
DROP POLICY IF EXISTS "guata_tourist_attractions_admin_all" ON public.guata_tourist_attractions;
CREATE POLICY "guata_tourist_attractions_admin_all" ON public.guata_tourist_attractions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')));
DROP POLICY IF EXISTS "guata_tourist_attractions_public_read" ON public.guata_tourist_attractions;
CREATE POLICY "guata_tourist_attractions_public_read" ON public.guata_tourist_attractions FOR SELECT USING (true);
-- Revogar acesso de email/phone do anon e authenticated (continuam só para admin via service role)
REVOKE SELECT (email, phone) ON public.guata_tourist_attractions FROM anon, authenticated;

DROP POLICY IF EXISTS "guata_verified_partners_admin_all" ON public.guata_verified_partners;
CREATE POLICY "guata_verified_partners_admin_all" ON public.guata_verified_partners FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')));
DROP POLICY IF EXISTS "guata_verified_partners_public_read" ON public.guata_verified_partners;
CREATE POLICY "guata_verified_partners_public_read" ON public.guata_verified_partners FOR SELECT USING (true);
REVOKE SELECT (contact_info, verified_by) ON public.guata_verified_partners FROM anon, authenticated;

-- ============================================================
-- 2) TOURISM_INVENTORY — bloquear self-approval
-- ============================================================
DROP POLICY IF EXISTS "Users can manage their own inventory" ON public.tourism_inventory;
CREATE POLICY "tourism_inventory_owner_insert" ON public.tourism_inventory FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "tourism_inventory_owner_select" ON public.tourism_inventory FOR SELECT TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "tourism_inventory_owner_delete" ON public.tourism_inventory FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Trigger que impede mudar campos de moderação por não-admin
CREATE OR REPLACE FUNCTION public.tourism_inventory_protect_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','diretor_estadual'))
    INTO is_admin;
  IF is_admin THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.setur_compliance_score IS DISTINCT FROM OLD.setur_compliance_score
     OR NEW.setur_code IS DISTINCT FROM OLD.setur_code THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar campos de moderação';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tourism_inventory_protect_moderation ON public.tourism_inventory;
CREATE TRIGGER trg_tourism_inventory_protect_moderation
  BEFORE UPDATE ON public.tourism_inventory
  FOR EACH ROW EXECUTE FUNCTION public.tourism_inventory_protect_moderation();
CREATE POLICY "tourism_inventory_owner_update" ON public.tourism_inventory FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- ============================================================
-- 3) COMMERCIAL_PARTNERS — bloquear self-approval
-- ============================================================
DROP POLICY IF EXISTS "Parceiros podem gerenciar seus próprios dados" ON public.commercial_partners;
CREATE POLICY "commercial_partners_owner_select" ON public.commercial_partners FOR SELECT TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "commercial_partners_owner_update" ON public.commercial_partners FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE OR REPLACE FUNCTION public.commercial_partners_protect_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin'))
    INTO is_admin;
  IF is_admin THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.verified IS DISTINCT FROM OLD.verified
     OR NEW.featured IS DISTINCT FROM OLD.featured
     OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     OR NEW.monthly_fee IS DISTINCT FROM OLD.monthly_fee THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar status, plano e mensalidade';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_commercial_partners_protect_moderation ON public.commercial_partners;
CREATE TRIGGER trg_commercial_partners_protect_moderation
  BEFORE UPDATE ON public.commercial_partners
  FOR EACH ROW EXECUTE FUNCTION public.commercial_partners_protect_moderation();

-- ============================================================
-- 4) TRANSLATIONS — restringir escrita a admin/tech/gestor municipal
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['destination_translations','event_translations','route_translations','region_translations']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem inserir traduções de destinos" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem atualizar traduções de destinos" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem inserir traduções de eventos" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem atualizar traduções de eventos" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem inserir traduções de roteiros" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem atualizar traduções de roteiros" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem inserir traduções de regiões" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem atualizar traduções de regiões" ON public.%I', t);

    EXECUTE format($q$CREATE POLICY "translations_admin_insert" ON public.%I FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin','gestor_municipal','municipal_manager')))$q$, t);
    EXECUTE format($q$CREATE POLICY "translations_admin_update" ON public.%I FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin','gestor_municipal','municipal_manager')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin','gestor_municipal','municipal_manager')))$q$, t);
    EXECUTE format($q$CREATE POLICY "translations_admin_delete" ON public.%I FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','tech','master_admin')))$q$, t);
  END LOOP;
END $$;

-- ============================================================
-- 5) STORAGE POLICIES — remover públicas/abertas, restringir a admin
-- ============================================================
DROP POLICY IF EXISTS "Permitir deleção pública de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção pública de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de imagens de parceiros" ON storage.objects;

CREATE POLICY "Admins manage tourism-images write" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tourism-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')))
  WITH CHECK (bucket_id = 'tourism-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')));
CREATE POLICY "Admins delete tourism-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tourism-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')));
CREATE POLICY "Admins delete event-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')));
CREATE POLICY "Admins update event-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'event-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')))
  WITH CHECK (bucket_id = 'event-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin','municipal_manager','gestor_municipal')));

CREATE POLICY "Admins manage partner-images write" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (bucket_id = 'partner-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));
CREATE POLICY "Admins delete partner-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'partner-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

-- ============================================================
-- 6) GEO-ATTENDANT FUNCTIONS — set search_path
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='validate_attendant_location') THEN
    EXECUTE 'ALTER FUNCTION public.validate_attendant_location(uuid, double precision, double precision) SET search_path = ''public''';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='get_attendant_checkin_stats') THEN
    EXECUTE 'ALTER FUNCTION public.get_attendant_checkin_stats(uuid) SET search_path = ''public''';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='cleanup_old_attendant_checkins') THEN
    EXECUTE 'ALTER FUNCTION public.cleanup_old_attendant_checkins() SET search_path = ''public''';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;