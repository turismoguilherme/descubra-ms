-- A) Posse de parceiro apenas por created_by
CREATE OR REPLACE FUNCTION public.is_partner_owner(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = p_partner_id
      AND auth.uid() IS NOT NULL
      AND ip.created_by = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.partner_row_is_mine(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = p_partner_id
      AND auth.uid() IS NOT NULL
      AND ip.created_by = auth.uid()
  );
$function$;

-- created_by nunca pode ser escolhido pelo cliente
CREATE OR REPLACE FUNCTION public.insert_partner_application(
  p_name text, p_description text, p_partner_type text, p_person_type text,
  p_cpf text, p_cnpj text, p_website_url text, p_contact_email text,
  p_contact_phone text, p_address text, p_youtube_url text, p_created_by uuid
)
RETURNS TABLE(partner_id uuid, partner_name text, partner_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_partner_id UUID;
  v_partner_name TEXT;
  v_partner_email TEXT;
  v_owner UUID;
BEGIN
  -- Ignora p_created_by enviado pelo cliente: usa sempre o usuário autenticado
  v_owner := auth.uid();

  INSERT INTO public.institutional_partners (
    name, description, partner_type, person_type, cpf, cnpj, website_url,
    contact_email, contact_phone, address, youtube_url, status, is_active,
    created_by, stripe_connect_status
  ) VALUES (
    p_name, p_description, p_partner_type, p_person_type, p_cpf, p_cnpj, p_website_url,
    lower(trim(p_contact_email)), p_contact_phone, p_address, p_youtube_url, 'pending', false,
    v_owner, 'pending'
  )
  RETURNING institutional_partners.id, institutional_partners.name, institutional_partners.contact_email
  INTO v_partner_id, v_partner_name, v_partner_email;

  RETURN QUERY SELECT v_partner_id, v_partner_name, v_partner_email;
END;
$function$;

-- B) Cache do Guata: individual apenas para o dono
DROP POLICY IF EXISTS "Cache entries are readable by everyone" ON public.guata_response_cache;
CREATE POLICY "Anyone can read shared guata cache"
  ON public.guata_response_cache FOR SELECT
  USING (cache_type::text = 'shared');
CREATE POLICY "Users can read own individual guata cache"
  ON public.guata_response_cache FOR SELECT
  USING (cache_type::text = 'individual' AND user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Anon can update individual guata cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Anon can insert individual guata cache" ON public.guata_response_cache;

-- C) Tentativas de código: sem falsificação de identidade
DROP POLICY IF EXISTS "Authenticated can insert code attempts" ON public.checkpoint_code_attempts;
CREATE POLICY "Authenticated can insert own code attempts"
  ON public.checkpoint_code_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- D) Funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.get_my_leaderboard_position(text, text) FROM anon;
DROP FUNCTION IF EXISTS public.save_guata_cartilha_content(text, text, text, jsonb);