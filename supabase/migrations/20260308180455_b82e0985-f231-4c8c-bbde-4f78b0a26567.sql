-- Last batch of functions without search_path

CREATE OR REPLACE FUNCTION public.auto_update_objetivo_progress()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE objetivo_uuid UUID;
BEGIN
  IF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN objetivo_uuid := NEW.objetivo_id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
    SELECT e.objetivo_id INTO objetivo_uuid FROM plano_diretor_estrategias e WHERE e.id = NEW.estrategia_id;
  END IF;
  IF objetivo_uuid IS NOT NULL THEN
    UPDATE plano_diretor_objetivos SET progresso = calculate_objetivo_progress(objetivo_uuid), updated_at = NOW() WHERE id = objetivo_uuid;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.calculate_objetivo_progress(objetivo_uuid uuid)
RETURNS numeric LANGUAGE plpgsql STABLE SET search_path = 'public' AS $function$
DECLARE total_estrategias INTEGER; concluidas_estrategias INTEGER; total_acoes INTEGER; concluidas_acoes INTEGER; progress_value NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_estrategias FROM plano_diretor_estrategias WHERE objetivo_id = objetivo_uuid AND status != 'cancelada';
  SELECT COUNT(*) INTO concluidas_estrategias FROM plano_diretor_estrategias WHERE objetivo_id = objetivo_uuid AND status = 'concluida';
  SELECT COUNT(*) INTO total_acoes FROM plano_diretor_acoes a JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id WHERE e.objetivo_id = objetivo_uuid AND a.status != 'cancelada';
  SELECT COUNT(*) INTO concluidas_acoes FROM plano_diretor_acoes a JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id WHERE e.objetivo_id = objetivo_uuid AND a.status = 'concluida';
  IF total_estrategias = 0 AND total_acoes = 0 THEN RETURN 0; END IF;
  IF total_estrategias > 0 AND total_acoes > 0 THEN
    progress_value := ((concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 40) + (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 60));
  ELSIF total_estrategias > 0 THEN progress_value := (concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 100);
  ELSE progress_value := (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 100); END IF;
  RETURN LEAST(100, GREATEST(0, ROUND(progress_value, 2)));
END; $function$;

CREATE OR REPLACE FUNCTION public.create_plano_diretor_historico_entry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE historico_tipo TEXT; historico_secao TEXT; historico_secao_id UUID; alteracoes_data JSONB; target_plano_diretor_id UUID; autor_id_value UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN historico_tipo := 'criacao'; ELSIF TG_OP = 'UPDATE' THEN historico_tipo := 'edicao'; ELSE RETURN NULL; END IF;
  IF TG_TABLE_NAME = 'plano_diretor_documents' THEN historico_secao := 'geral'; historico_secao_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_objetivos' THEN historico_secao := 'objetivo'; historico_secao_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN historico_secao := 'estrategia'; historico_secao_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN historico_secao := 'acao'; historico_secao_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_indicadores' THEN historico_secao := 'indicador'; historico_secao_id := NEW.id;
  ELSE RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN alteracoes_data := jsonb_build_object('campo','multiple','valor_anterior',to_jsonb(OLD),'valor_novo',to_jsonb(NEW));
  ELSE alteracoes_data := to_jsonb(NEW); END IF;
  IF TG_TABLE_NAME = 'plano_diretor_documents' THEN target_plano_diretor_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_objetivos' THEN target_plano_diretor_id := NEW.plano_diretor_id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN target_plano_diretor_id := NEW.plano_diretor_id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN SELECT e.plano_diretor_id INTO target_plano_diretor_id FROM plano_diretor_estrategias e WHERE e.id = NEW.estrategia_id;
  ELSIF TG_TABLE_NAME = 'plano_diretor_indicadores' THEN target_plano_diretor_id := NEW.plano_diretor_id; END IF;
  IF TG_TABLE_NAME = 'plano_diretor_documents' AND TG_OP = 'INSERT' THEN autor_id_value := NEW.criador_id;
  ELSE autor_id_value := COALESCE((SELECT current_setting('request.jwt.claim.user_id', true)::uuid), auth.uid(), (SELECT criador_id FROM plano_diretor_documents WHERE id = target_plano_diretor_id LIMIT 1)); END IF;
  INSERT INTO plano_diretor_historico (plano_diretor_id, versao, autor_id, tipo_alteracao, secao, secao_id, alteracoes)
  VALUES (target_plano_diretor_id, (SELECT versao FROM plano_diretor_documents WHERE id = target_plano_diretor_id), autor_id_value, historico_tipo, historico_secao, historico_secao_id, alteracoes_data);
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.create_test_user_profiles()
RETURNS TABLE(user_id_created uuid, email_ref text, role_assigned text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE users_info text[][] := ARRAY[
  ARRAY['admin-teste@ms.gov.br','admin','Administrador de Teste','Admin Teste','collaborator'],
  ARRAY['diretor-teste@ms.gov.br','diretor_estadual','Diretor Estadual de Teste','Diretor Teste','collaborator'],
  ARRAY['gestor-igr-teste@ms.gov.br','gestor_igr','Gestor IGR de Teste','Gestor IGR Teste','collaborator'],
  ARRAY['gestor-municipal-teste@ms.gov.br','gestor_municipal','Gestor Municipal de Teste','Gestor Municipal Teste','collaborator'],
  ARRAY['atendente-teste@ms.gov.br','atendente','Atendente de Teste','Atendente Teste','collaborator'],
  ARRAY['usuario-teste@ms.gov.br','user','Usuário de Teste','Usuário Teste','tourist']
]; user_info text[]; test_user_id uuid; i int;
BEGIN
  FOR i IN 1..array_length(users_info, 1) LOOP
    user_info := users_info[i]; test_user_id := gen_random_uuid();
    INSERT INTO public.user_profiles (user_id, full_name, display_name, user_type, created_at, updated_at) VALUES (test_user_id, user_info[3], user_info[4], user_info[5], now(), now());
    IF user_info[2] != 'user' THEN INSERT INTO public.user_roles (user_id, role, created_at, created_by) VALUES (test_user_id, user_info[2], now(), test_user_id); END IF;
    INSERT INTO public.security_audit_log (action, user_id, success, created_at) VALUES ('test_user_profile_created', test_user_id, true, now());
    RETURN QUERY SELECT test_user_id, user_info[1], user_info[2];
  END LOOP;
  RETURN;
END; $function$;

CREATE OR REPLACE FUNCTION public.unlock_rewards(p_user_id uuid, p_route_id uuid)
RETURNS TABLE(reward_id uuid, voucher_code character varying)
LANGUAGE plpgsql SET search_path = 'public' AS $function$
DECLARE v_reward RECORD; v_voucher_code VARCHAR; v_prefix VARCHAR;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM route_checkpoints rc WHERE rc.route_id = p_route_id
    AND NOT EXISTS (SELECT 1 FROM passport_stamps ps WHERE ps.checkpoint_id = rc.id AND ps.user_id = p_user_id)) THEN
    FOR v_reward IN SELECT * FROM passport_rewards WHERE route_id = p_route_id AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())
      AND NOT EXISTS (SELECT 1 FROM user_rewards WHERE user_id = p_user_id AND reward_id = v_reward.id)
    LOOP
      v_prefix := COALESCE(v_reward.reward_code_prefix, 'MS');
      v_voucher_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(p_user_id::TEXT || v_reward.id::TEXT || NOW()::TEXT), 1, 8));
      WHILE EXISTS (SELECT 1 FROM user_rewards WHERE voucher_code = v_voucher_code) LOOP
        v_voucher_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(p_user_id::TEXT || v_reward.id::TEXT || NOW()::TEXT || RANDOM()::TEXT), 1, 8));
      END LOOP;
      INSERT INTO user_rewards (user_id, reward_id, route_id, voucher_code) VALUES (p_user_id, v_reward.id, p_route_id, v_voucher_code)
      RETURNING id, voucher_code INTO v_reward.id, v_voucher_code;
      RETURN QUERY SELECT v_reward.id, v_voucher_code;
    END LOOP;
  END IF;
  RETURN;
END; $function$;