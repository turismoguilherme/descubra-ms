
-- Corrigir função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Corrigir função audit_content_changes com search_path seguro
CREATE OR REPLACE FUNCTION public.audit_content_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  user_name_val text;
BEGIN
  -- Tentar obter o nome do usuário
  SELECT COALESCE(email, id::text) INTO user_name_val 
  FROM auth.users 
  WHERE id = auth.uid();

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.content_audit_log (
      table_name, record_id, action, old_values, user_id, user_name
    ) VALUES (
      TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), auth.uid(), user_name_val
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.content_audit_log (
      table_name, record_id, action, old_values, new_values, user_id, user_name
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), user_name_val
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.content_audit_log (
      table_name, record_id, action, new_values, user_id, user_name
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), auth.uid(), user_name_val
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;
