CREATE OR REPLACE FUNCTION public.partner_row_is_mine(p_partner_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = p_partner_id
      AND (
        ip.created_by = auth.uid()
        OR (ip.contact_email IS NOT NULL
            AND lower(ip.contact_email) = lower(coalesce(auth.jwt()->>'email', '')))
      )
  );
$function$;
REVOKE EXECUTE ON FUNCTION public.partner_row_is_mine(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.partner_row_is_mine(uuid) TO authenticated;