-- ============================================================
-- FASE 3: Hardening — SET search_path nas funções sem search_path
-- Foco: funções SECURITY DEFINER e funções que acessam tabelas
-- ============================================================

-- Trigger functions (baixo risco, mas boa prática)
CREATE OR REPLACE FUNCTION public.update_ai_agent_config_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_ai_prompt_configs_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_content_translations_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_guata_cache_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_guata_kb_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.ultima_atualizacao = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_koda_cache_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_pantanal_avatars_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_partner_availability_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_partner_cancellation_policies_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_partner_reservations_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_partner_transactions_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_plano_diretor_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_region_cities_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_tourist_regions_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.update_viajar_team_members_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

-- Cache/utility functions
CREATE OR REPLACE FUNCTION public.clean_expired_guata_cache()
RETURNS integer LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE deleted_count INTEGER;
BEGIN DELETE FROM guata_response_cache WHERE expires_at < NOW(); GET DIAGNOSTICS deleted_count = ROW_COUNT; RETURN deleted_count; END; $function$;

CREATE OR REPLACE FUNCTION public.clean_expired_koda_cache()
RETURNS integer LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE deleted_count INTEGER;
BEGIN DELETE FROM koda_response_cache WHERE expires_at < NOW(); GET DIAGNOSTICS deleted_count = ROW_COUNT; RETURN deleted_count; END; $function$;

CREATE OR REPLACE FUNCTION public.increment_guata_cache_usage(cache_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN UPDATE guata_response_cache SET used_count = used_count + 1, updated_at = NOW() WHERE id = cache_id; END; $function$;

CREATE OR REPLACE FUNCTION public.increment_guata_kb_usage(kb_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN UPDATE guata_knowledge_base SET usado_por = usado_por + 1 WHERE id = kb_id; END; $function$;

CREATE OR REPLACE FUNCTION public.increment_koda_cache_usage(cache_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = 'public' AS $function$
BEGIN UPDATE koda_response_cache SET used_count = used_count + 1, updated_at = NOW() WHERE id = cache_id; END; $function$;

-- Pure/immutable functions
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = 'public' AS $function$
DECLARE earth_radius NUMERIC := 6371000; dlat NUMERIC; dlon NUMERIC; a NUMERIC; c NUMERIC;
BEGIN dlat := RADIANS(lat2 - lat1); dlon := RADIANS(lon2 - lon1);
a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
c := 2 * ATAN2(SQRT(a), SQRT(1-a)); RETURN earth_radius * c; END; $function$;

CREATE OR REPLACE FUNCTION public.is_valid_uuid(uuid_text text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = 'public' AS $function$
BEGIN RETURN uuid_text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; END; $function$;