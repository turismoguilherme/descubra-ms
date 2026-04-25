-- Restore public event submissions from unauthenticated form.
-- A migration in 2026 restricted INSERT on events to authenticated users only,
-- which breaks the public "Cadastrar Evento" flow.

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remove restrictive policy created in security hardening migration.
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;

-- Ensure API roles can attempt insert (RLS still enforces row checks).
GRANT INSERT ON TABLE public.events TO anon, authenticated;

-- Allow both anon and authenticated submissions with basic safety checks.
CREATE POLICY "Public can submit events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  titulo IS NOT NULL
  AND data_inicio IS NOT NULL
  AND (is_visible IS NULL OR is_visible = false)
);
