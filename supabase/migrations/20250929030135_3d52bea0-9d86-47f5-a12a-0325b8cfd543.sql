-- Fix search_path security warnings for database functions

-- Fix update_commercial_partners_updated_at function
CREATE OR REPLACE FUNCTION public.update_commercial_partners_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix audit_table_changes function
CREATE OR REPLACE FUNCTION public.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_audit_log (
    table_name,
    action,
    record_id,
    user_id,
    user_name,
    old_values,
    new_values
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    COALESCE(
      (SELECT full_name FROM public.user_profiles WHERE user_id = auth.uid()),
      auth.email()
    ),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix auto_expire_events function
CREATE OR REPLACE FUNCTION public.auto_expire_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar eventos com end_date que já passaram para inativos
  UPDATE public.events
  SET
    is_visible = FALSE,
    updated_at = NOW()
  WHERE
    end_date IS NOT NULL
    AND end_date <= NOW()
    AND is_visible = TRUE;

  -- Atualizar eventos em event_details onde auto_hide é TRUE e visibility_end_date já passou
  UPDATE public.event_details
  SET
    updated_at = NOW()
  WHERE
    auto_hide = TRUE
    AND visibility_end_date IS NOT NULL
    AND visibility_end_date <= NOW();

  RAISE NOTICE 'Event expiration function executed.';
END;
$$;

-- Fix cleanup_old_ai_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove logs mais antigos que 90 dias
  DELETE FROM public.ai_consultant_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove insights expirados
  DELETE FROM public.ai_proactive_insights 
  WHERE expires_at < NOW();
  
  -- Remove feedback órfão
  DELETE FROM public.ai_consultant_feedback 
  WHERE log_id NOT IN (SELECT id FROM public.ai_consultant_logs);
END;
$$;

-- Fix fix_incomplete_profiles function
CREATE OR REPLACE FUNCTION public.fix_incomplete_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfis básicos para usuários que não têm perfil
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    'tourist',
    u.created_at,
    now()
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  -- Atualizar perfis com dados nulos
  UPDATE public.user_profiles 
  SET 
    full_name = COALESCE(full_name, 'Usuário'),
    display_name = COALESCE(display_name, 'Usuário'),
    user_type = COALESCE(user_type, 'tourist'),
    updated_at = now()
  WHERE full_name IS NULL OR display_name IS NULL OR user_type IS NULL;
END;
$$;

-- Fix ensure_admin_exists function
CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
BEGIN
  -- Verificar se existe pelo menos um admin
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Se não existir admin, retornar false para indicar que é necessário criar
  IF admin_count = 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;