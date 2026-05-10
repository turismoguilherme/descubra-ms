-- Events UPDATE/DELETE: staff who use ViaJAR admin (`admin`, `master_admin`, `tech` — see ViaJARAdminPanel).
-- Gestor/diretor roles removed from product; do not reference dropped role slugs here.
--
-- No OR on owner columns: production DBs differ (some have neither created_by nor submitted_by).
--
-- NOTE: Policy "Eventos: admins veem tudo" (20260505163855) may still list old roles on SELECT;
-- if listing events in admin breaks, run a follow-up migration aligning that SELECT with the same ARRAY.

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::text, 'tech'::text, 'master_admin'::text])
  )
);

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::text, 'tech'::text, 'master_admin'::text])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::text, 'tech'::text, 'master_admin'::text])
  )
);

COMMENT ON POLICY "Admins can delete events" ON public.events IS
  'ViaJAR staff: admin, tech, master_admin (user_roles).';

COMMENT ON POLICY "Admins can update events" ON public.events IS
  'ViaJAR staff: admin, tech, master_admin (user_roles).';
