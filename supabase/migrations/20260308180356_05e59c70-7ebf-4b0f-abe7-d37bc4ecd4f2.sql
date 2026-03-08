-- Remaining trigger functions
CREATE OR REPLACE FUNCTION public.update_partner_pricing_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_viajar_products_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

-- Immutable functions
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = 'public' AS $function$
DECLARE level_data jsonb;
BEGIN
  CASE 
    WHEN points >= 2000 THEN level_data := jsonb_build_object('level',5,'name','Mestre','icon','👑','color','#8B5CF6','points_to_next',null);
    WHEN points >= 1001 THEN level_data := jsonb_build_object('level',4,'name','Aventureiro','icon','⚔️','color','#F59E0B','points_to_next',2000-points);
    WHEN points >= 501 THEN level_data := jsonb_build_object('level',3,'name','Viajante','icon','🗺️','color','#10B981','points_to_next',1001-points);
    WHEN points >= 101 THEN level_data := jsonb_build_object('level',2,'name','Explorador','icon','🔍','color','#3B82F6','points_to_next',501-points);
    ELSE level_data := jsonb_build_object('level',1,'name','Iniciante','icon','🌱','color','#6B7280','points_to_next',101-points);
  END CASE;
  RETURN level_data;
END; $function$;

CREATE OR REPLACE FUNCTION public.check_geofence(checkpoint_lat numeric, checkpoint_lon numeric, user_lat numeric, user_lon numeric, radius_meters integer DEFAULT 100)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = 'public' AS $function$
DECLARE distance NUMERIC;
BEGIN distance := calculate_distance(checkpoint_lat, checkpoint_lon, user_lat, user_lon); RETURN distance <= radius_meters; END; $function$;

-- SECURITY DEFINER functions (higher risk without search_path)
CREATE OR REPLACE FUNCTION public.check_availability(p_partner_id uuid, p_service_id uuid, p_date date, p_guests integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE v_available BOOLEAN; v_max_guests INTEGER; v_booked_guests INTEGER;
BEGIN
  SELECT available, max_guests, booked_guests INTO v_available, v_max_guests, v_booked_guests
  FROM public.partner_availability WHERE partner_id = p_partner_id AND service_id = p_service_id AND date = p_date;
  IF v_available IS NULL THEN
    SELECT is_active INTO v_available FROM public.partner_pricing WHERE id = p_service_id AND partner_id = p_partner_id;
    IF v_available = true THEN RETURN true; ELSE RETURN false; END IF;
  END IF;
  IF v_available = false THEN RETURN false; END IF;
  IF v_max_guests IS NOT NULL THEN IF (v_booked_guests + p_guests) > v_max_guests THEN RETURN false; END IF; END IF;
  RETURN true;
END; $function$;

CREATE OR REPLACE FUNCTION public.get_ai_consultant_stats(p_tenant_id character varying DEFAULT NULL, p_region_id uuid DEFAULT NULL, p_city_id uuid DEFAULT NULL, p_days integer DEFAULT 30)
RETURNS TABLE(total_queries integer, avg_confidence numeric, total_users integer, most_common_topics text[], daily_usage jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
BEGIN
  RETURN QUERY SELECT COUNT(*)::INTEGER, AVG(l.confidence)::DECIMAL, COUNT(DISTINCT l.user_id)::INTEGER,
    array_agg(DISTINCT split_part(l.question, ' ', 1))::TEXT[],
    jsonb_object_agg(DATE(l.created_at)::text, COUNT(*))
  FROM ai_consultant_logs l
  WHERE (p_tenant_id IS NULL OR l.context->>'tenant' = p_tenant_id)
    AND (p_region_id IS NULL OR (l.context->>'regionId')::UUID = p_region_id)
    AND (p_city_id IS NULL OR (l.context->>'cityId')::UUID = p_city_id)
    AND l.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY 1;
END; $function$;

CREATE OR REPLACE FUNCTION public.get_available_slots(p_partner_id uuid, p_service_id uuid, p_date date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE v_max_guests INTEGER; v_booked_guests INTEGER; v_available BOOLEAN;
BEGIN
  SELECT max_guests, booked_guests, available INTO v_max_guests, v_booked_guests, v_available
  FROM public.partner_availability WHERE partner_id = p_partner_id AND service_id = p_service_id AND date = p_date;
  IF v_available IS NULL THEN
    SELECT is_active INTO v_available FROM public.partner_pricing WHERE id = p_service_id AND partner_id = p_partner_id;
    IF v_available = true THEN SELECT max_guests INTO v_max_guests FROM public.partner_pricing WHERE id = p_service_id; RETURN v_max_guests; ELSE RETURN 0; END IF;
  END IF;
  IF v_available = false THEN RETURN 0; END IF;
  IF v_max_guests IS NULL THEN RETURN NULL; END IF;
  RETURN GREATEST(0, v_max_guests - COALESCE(v_booked_guests, 0));
END; $function$;

CREATE OR REPLACE FUNCTION public.get_users_by_role(target_role text)
RETURNS TABLE(id uuid, email text, full_name text, region text, created_at timestamp with time zone)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
BEGIN
  IF NOT public.is_manager(auth.uid()) THEN RAISE EXCEPTION 'Permission denied to access user data.'; END IF;
  RETURN QUERY SELECT u.id, u.email, COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email), ur.region, u.created_at
  FROM auth.users u LEFT JOIN public.user_profiles p ON u.id = p.user_id LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE ur.role::text = target_role OR (target_role = 'user' AND ur.role IS NULL) ORDER BY u.created_at DESC;
END; $function$;

CREATE OR REPLACE FUNCTION public.decrease_booked_guests(p_partner_id uuid, p_service_id uuid, p_date date, p_guests integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
BEGIN
  INSERT INTO public.partner_availability (partner_id, service_id, date, booked_guests, available) VALUES (p_partner_id, p_service_id, p_date, GREATEST(0, p_guests), true)
  ON CONFLICT (partner_id, service_id, date) DO UPDATE SET booked_guests = GREATEST(0, (partner_availability.booked_guests + p_guests)), updated_at = now();
  RETURN true;
EXCEPTION WHEN OTHERS THEN RETURN false;
END; $function$;

-- Stable SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.check_checkin_rate_limit(p_user_id uuid, p_max_checkins integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
RETURNS boolean LANGUAGE plpgsql STABLE SET search_path = 'public' AS $function$
DECLARE v_count INTEGER; v_window_start TIMESTAMPTZ;
BEGIN v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  SELECT COUNT(*) INTO v_count FROM passport_stamps WHERE user_id = p_user_id AND stamped_at >= v_window_start;
  RETURN v_count < p_max_checkins;
END; $function$;

CREATE OR REPLACE FUNCTION public.check_colaborador_permission(colaborador_uuid uuid, required_permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE colaborador_record RECORD; has_permission BOOLEAN := false;
BEGIN
  SELECT nivel_acesso, permissoes, ativo INTO colaborador_record FROM plano_diretor_colaboradores WHERE id = colaborador_uuid;
  IF NOT FOUND OR NOT colaborador_record.ativo THEN RETURN false; END IF;
  IF required_permission = 'visualizar' THEN has_permission := true;
  ELSIF required_permission = 'editar' THEN has_permission := colaborador_record.nivel_acesso IN ('editar', 'aprovar');
  ELSIF required_permission = 'aprovar' THEN has_permission := colaborador_record.nivel_acesso = 'aprovar'; END IF;
  IF colaborador_record.permissoes ? required_permission THEN has_permission := (colaborador_record.permissoes->>required_permission)::boolean; END IF;
  RETURN has_permission;
END; $function$;

CREATE OR REPLACE FUNCTION public.has_plano_diretor_access(plano_id uuid, user_id uuid, required_permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = 'public' AS $function$
BEGIN
  IF is_plano_diretor_creator(plano_id, user_id) THEN RETURN true; END IF;
  RETURN is_plano_diretor_colaborador(plano_id, user_id, required_permission);
END; $function$;

CREATE OR REPLACE FUNCTION public.is_plano_diretor_colaborador(plano_id uuid, user_id uuid, required_permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE colaborador_record RECORD;
BEGIN
  SELECT nivel_acesso, permissoes, ativo INTO colaborador_record FROM plano_diretor_colaboradores
  WHERE plano_diretor_id = plano_id AND (usuario_id = user_id OR email = (SELECT email FROM auth.users WHERE id = user_id)) AND ativo = true;
  IF NOT FOUND THEN RETURN false; END IF;
  IF required_permission = 'visualizar' THEN RETURN true;
  ELSIF required_permission = 'editar' THEN RETURN colaborador_record.nivel_acesso IN ('editar', 'aprovar');
  ELSIF required_permission = 'aprovar' THEN RETURN colaborador_record.nivel_acesso = 'aprovar'; END IF;
  IF colaborador_record.permissoes ? required_permission THEN RETURN (colaborador_record.permissoes->>required_permission)::boolean; END IF;
  RETURN false;
END; $function$;

CREATE OR REPLACE FUNCTION public.is_plano_diretor_creator(plano_id uuid, user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = 'public' AS $function$
BEGIN RETURN EXISTS (SELECT 1 FROM plano_diretor_documents WHERE id = plano_id AND criador_id = user_id); END; $function$;

-- Regular functions
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS text LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE v_code TEXT; v_exists BOOLEAN;
BEGIN LOOP v_code := 'MS-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  SELECT EXISTS(SELECT 1 FROM route_checkpoints WHERE partner_code = v_code) INTO v_exists;
  EXIT WHEN NOT v_exists; END LOOP; RETURN v_code;
END; $function$;

CREATE OR REPLACE FUNCTION public.generate_passport_number(prefix character varying DEFAULT 'MS')
RETURNS character varying LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE timestamp_part VARCHAR; random_part VARCHAR; passport_num VARCHAR;
BEGIN timestamp_part := TO_CHAR(NOW(), 'YYYYMMDD-HHMMSS');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) || MD5(NOW()::TEXT), 1, 6));
  passport_num := prefix || '-' || timestamp_part || '-' || random_part;
  WHILE EXISTS (SELECT 1 FROM user_passports WHERE passport_number = passport_num) LOOP
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) || MD5(NOW()::TEXT), 1, 6));
    passport_num := prefix || '-' || timestamp_part || '-' || random_part;
  END LOOP; RETURN passport_num;
END; $function$;

CREATE OR REPLACE FUNCTION public.validate_checkpoint_partner_config()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN
  IF NEW.validation_mode IN ('code', 'mixed') THEN
    IF (NEW.partner_code IS NULL OR TRIM(NEW.partner_code) = '') AND NEW.partner_id IS NULL THEN
      RAISE WARNING 'Checkpoint exige código mas não tem parceiro ou código configurado.';
    END IF;
  END IF;
  RETURN NEW;
END; $function$;