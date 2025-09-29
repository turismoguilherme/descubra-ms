-- Fix critical security issues in commercial partners system

-- 1. Add server-side validation function for CNPJ
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cnpj_clean text;
  cnpj_length int;
BEGIN
  -- Remove non-numeric characters
  cnpj_clean := regexp_replace(cnpj_input, '[^0-9]', '', 'g');
  cnpj_length := length(cnpj_clean);
  
  -- Check if CNPJ has exactly 14 digits
  IF cnpj_length != 14 THEN
    RETURN false;
  END IF;
  
  -- Check for invalid patterns (all same digits)
  IF cnpj_clean ~ '^(.)\1+$' THEN
    RETURN false;
  END IF;
  
  -- Basic CNPJ validation (simplified)
  RETURN true;
END;
$$;

-- 2. Add server-side rate limiting function for commercial partner registrations
CREATE OR REPLACE FUNCTION public.check_partner_registration_rate_limit(user_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registration_count int;
BEGIN
  -- Check registrations in last hour
  SELECT COUNT(*) INTO registration_count
  FROM commercial_partners
  WHERE created_by = user_id_input
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow maximum 3 registrations per hour
  IF registration_count >= 3 THEN
    -- Log security violation
    INSERT INTO security_audit_log (
      action,
      user_id,
      success,
      error_message
    ) VALUES (
      'partner_registration_rate_limit_exceeded',
      user_id_input,
      false,
      'Too many partner registration attempts'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Fix the get_user_role function (was missing)
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user's role from user_roles table
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  -- Return 'user' as default if no role found
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- 4. Add trigger to validate CNPJ and check rate limits on commercial partner insertion
CREATE OR REPLACE FUNCTION public.validate_commercial_partner_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check CNPJ format
  IF NOT validate_cnpj(NEW.cnpj) THEN
    RAISE EXCEPTION 'CNPJ inválido: %', NEW.cnpj;
  END IF;
  
  -- Check for duplicate CNPJ
  IF EXISTS (
    SELECT 1 FROM commercial_partners 
    WHERE cnpj = NEW.cnpj AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'CNPJ já cadastrado: %', NEW.cnpj;
  END IF;
  
  -- Check rate limiting for new registrations
  IF TG_OP = 'INSERT' AND NEW.created_by IS NOT NULL THEN
    IF NOT check_partner_registration_rate_limit(NEW.created_by) THEN
      RAISE EXCEPTION 'Limite de cadastros excedido. Tente novamente em 1 hora.';
    END IF;
  END IF;
  
  -- Sanitize text inputs
  NEW.company_name := TRIM(NEW.company_name);
  NEW.trade_name := TRIM(NEW.trade_name);
  NEW.contact_person := TRIM(NEW.contact_person);
  NEW.contact_email := LOWER(TRIM(NEW.contact_email));
  NEW.description := TRIM(NEW.description);
  
  -- Log the registration attempt
  INSERT INTO security_audit_log (
    action,
    user_id,
    success,
    metadata
  ) VALUES (
    'commercial_partner_registration',
    NEW.created_by,
    true,
    jsonb_build_object(
      'company_name', NEW.company_name,
      'cnpj', NEW.cnpj,
      'business_type', NEW.business_type
    )
  );
  
  RETURN NEW;
END;
$$;

-- Apply the trigger to commercial_partners table
DROP TRIGGER IF EXISTS validate_commercial_partner_trigger ON commercial_partners;
CREATE TRIGGER validate_commercial_partner_trigger
  BEFORE INSERT OR UPDATE ON commercial_partners
  FOR EACH ROW
  EXECUTE FUNCTION validate_commercial_partner_insert();

-- 5. Improve RLS policies for commercial_partners table
DROP POLICY IF EXISTS "Usuários autenticados podem criar parceiros comerciais" ON commercial_partners;
CREATE POLICY "Usuários autenticados podem criar parceiros comerciais"
ON commercial_partners
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  check_partner_registration_rate_limit(auth.uid())
);

-- 6. Add enhanced audit logging for admin operations
CREATE OR REPLACE FUNCTION public.log_enhanced_admin_operation(
  operation_type text,
  target_table text DEFAULT NULL,
  target_record_id uuid DEFAULT NULL,
  operation_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_audit_log (
    action,
    user_id,
    success,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    'admin_operation_' || operation_type,
    auth.uid(),
    true,
    jsonb_build_object(
      'target_table', target_table,
      'target_record_id', target_record_id,
      'operation_details', operation_details,
      'timestamp', NOW()
    ),
    COALESCE(inet_client_addr(), '127.0.0.1'::inet),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;