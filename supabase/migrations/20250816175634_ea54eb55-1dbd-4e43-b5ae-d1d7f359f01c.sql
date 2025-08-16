-- Fix remaining search path security issues for database functions

-- Fix assign_user_role function
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_role text, p_city_id uuid DEFAULT NULL::uuid, p_region_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar role do usuário
  INSERT INTO public.user_roles (
    user_id,
    role,
    city_id,
    region_id,
    created_at,
    created_by
  ) VALUES (
    p_user_id,
    p_role,
    p_city_id,
    p_region_id,
    now(),
    p_user_id
  )
  ON CONFLICT (user_id, role) DO UPDATE SET
    city_id = EXCLUDED.city_id,
    region_id = EXCLUDED.region_id,
    created_at = EXCLUDED.created_at;
  
  -- Log da criação
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'user_role_assigned',
    p_user_id,
    true,
    now()
  );
  
  RETURN true;
END;
$$;

-- Fix promote_user_to_role function
CREATE OR REPLACE FUNCTION public.promote_user_to_role(p_email text, p_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar usuário por email na tabela auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = p_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', p_email;
  END IF;
  
  -- Criar perfil se não existir
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'Usuário ' || p_email,
    'Usuário ' || p_email,
    CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    now(),
    now()
  ) ON CONFLICT (user_id) DO UPDATE SET
    user_type = CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    updated_at = now();
  
  -- Assinar role se não for user
  IF p_role != 'user' THEN
    INSERT INTO public.user_roles (
      user_id,
      role,
      created_at,
      created_by
    ) VALUES (
      target_user_id,
      p_role,
      now(),
      target_user_id
    ) ON CONFLICT (user_id, role) DO UPDATE SET
      created_at = now();
  END IF;
  
  RETURN true;
END;
$$;

-- Fix create_initial_admin_if_needed function
CREATE OR REPLACE FUNCTION public.create_initial_admin_if_needed(admin_email text, admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');

  -- Only allow if no admins exist
  IF admin_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_blocked', 
      admin_user_id, 
      false, 
      'Attempted to create initial admin when admins already exist'
    );
    RETURN FALSE;
  END IF;

  -- Create the admin role directly (bypassing RLS for initial setup)
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (admin_user_id, 'admin', admin_user_id);

  -- Log the creation
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'initial_admin_created', 
    admin_user_id, 
    true, 
    format('Initial admin created for user: %s', admin_email)
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_error', 
      admin_user_id, 
      false, 
      SQLERRM
    );
    RETURN FALSE;
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

-- Fix cleanup_old_ai_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove logs mais antigos que 90 dias
  DELETE FROM ai_consultant_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove insights expirados
  DELETE FROM ai_proactive_insights 
  WHERE expires_at < NOW();
  
  -- Remove feedback órfão
  DELETE FROM ai_consultant_feedback 
  WHERE log_id NOT IN (SELECT id FROM ai_consultant_logs);
END;
$$;

-- Fix auto_expire_events function
CREATE OR REPLACE FUNCTION public.auto_expire_events()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Atualizar eventos com end_date que já passaram para inativos
  UPDATE public.events
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE
    end_date IS NOT NULL
    AND end_date <= NOW()
    AND is_active = TRUE;

  -- Atualizar eventos em event_details onde auto_hide é TRUE e visibility_end_date já passou
  -- Isso irá impactar a visibilidade no frontend, mas o evento principal permanece.
  UPDATE public.event_details
  SET
    is_visible = FALSE, -- Assumindo que você terá uma coluna is_visible em event_details
    updated_at = NOW()
  WHERE
    auto_hide = TRUE
    AND visibility_end_date IS NOT NULL
    AND visibility_end_date <= NOW()
    AND is_visible = TRUE;

  RAISE NOTICE 'Event expiration function executed.';
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

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$$;

-- Fix is_manager function
CREATE OR REPLACE FUNCTION public.is_manager(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor', 'municipal')
  );
$$;

-- Fix get_user_statistics function
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE(role_name text, user_count bigint, active_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissões
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access statistics.';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(ur.role::text, 'user') as role_name,
    COUNT(*) as user_count,
    COUNT(CASE WHEN u.banned_until IS NULL AND u.deleted_at IS NULL THEN 1 END) as active_count
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY ur.role
  ORDER BY user_count DESC;
END;
$$;

-- Fix create_initial_admin_user function
CREATE OR REPLACE FUNCTION public.create_initial_admin_user(admin_email text, admin_password text, admin_name text DEFAULT 'System Administrator'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  existing_admin_count int;
BEGIN
  -- Check if any admin users already exist
  SELECT COUNT(*) INTO existing_admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Only create if no admins exist
  IF existing_admin_count > 0 THEN
    RAISE NOTICE 'Admin users already exist. Skipping creation.';
    RETURN false;
  END IF;
  
  -- Create the user in auth.users (this would typically be done via Supabase Auth API)
  -- For now, we'll just create the profile and role entries
  
  -- Generate a UUID for the admin user
  new_user_id := gen_random_uuid();
  
  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    admin_name,
    admin_name,
    'administrator',
    now(),
    now()
  );
  
  -- Assign admin role
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    created_by
  ) VALUES (
    new_user_id,
    'admin',
    now(),
    new_user_id
  );
  
  -- Log the admin creation
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'initial_admin_user_created',
    new_user_id,
    true,
    now()
  );
  
  RAISE NOTICE 'Initial admin user profile created with ID: %', new_user_id;
  RETURN true;
END;
$$;