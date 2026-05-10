-- Narrow authenticated SELECT on public.events to ViaJAR staff roles only
-- (gestor_municipal / gestor_igr / diretor_estadual removed from product).

DROP POLICY IF EXISTS "Eventos: admins veem tudo" ON public.events;

CREATE POLICY "Eventos: admins veem tudo"
ON public.events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::text, 'tech'::text, 'master_admin'::text])
  )
);

COMMENT ON POLICY "Eventos: admins veem tudo" ON public.events IS
  'Authenticated staff: admin, tech, master_admin. Public listing uses events_public view.';
