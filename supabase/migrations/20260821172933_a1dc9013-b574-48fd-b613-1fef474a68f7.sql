-- 1) events: public submissions cannot forge privileged fields
DROP POLICY IF EXISTS "Public can submit events" ON public.events;
CREATE POLICY "Public can submit events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  titulo IS NOT NULL
  AND data_inicio IS NOT NULL
  AND (is_visible IS NULL OR is_visible = false)
  AND (is_sponsored IS NULL OR is_sponsored = false)
  AND sponsor_payment_status IS NULL
  AND (approval_status IS NULL OR approval_status = 'pending')
);

-- 2) guata_itineraries: public só vê conteúdo destacado/publicado
DROP POLICY IF EXISTS "guata_itineraries_public_read" ON public.guata_itineraries;
CREATE POLICY "guata_itineraries_public_read"
ON public.guata_itineraries
FOR SELECT
TO anon, authenticated
USING (is_featured = true);

-- 3) partner_reservations: reserva precisa pertencer a quem cria
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.partner_reservations;
CREATE POLICY "Authenticated users can create reservations"
ON public.partner_reservations
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 4) plano_diretor_colaboradores: fallback por e-mail só para convite não reivindicado e e-mail verificado
DROP POLICY IF EXISTS "Colaboradores can view their own colaborador record" ON public.plano_diretor_colaboradores;
CREATE POLICY "Colaboradores can view their own colaborador record"
ON public.plano_diretor_colaboradores
FOR SELECT
TO authenticated
USING (
  usuario_id = auth.uid()
  OR (
    usuario_id IS NULL
    AND lower(trim(email)) = lower(trim(coalesce((
      SELECT u.email FROM auth.users u
      WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
    )::text, '')))
    AND coalesce(nullif(trim(email), ''), '') <> ''
  )
);

DROP POLICY IF EXISTS "Colaboradores can update their own acceptance" ON public.plano_diretor_colaboradores;
CREATE POLICY "Colaboradores can update their own acceptance"
ON public.plano_diretor_colaboradores
FOR UPDATE
TO authenticated
USING (
  usuario_id = auth.uid()
  OR (
    usuario_id IS NULL
    AND lower(trim(email)) = lower(trim(coalesce((
      SELECT u.email FROM auth.users u
      WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
    )::text, '')))
    AND coalesce(nullif(trim(email), ''), '') <> ''
  )
)
WITH CHECK (
  usuario_id = auth.uid()
  AND data_aceite IS NOT NULL
);