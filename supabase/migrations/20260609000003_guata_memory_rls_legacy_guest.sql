-- Corrige upsert anon em linhas legadas com user_id = 'convidado' etc.
DROP POLICY IF EXISTS "Allow anonymous update on guata_user_memory" ON public.guata_user_memory;

CREATE POLICY "Allow anonymous update on guata_user_memory"
  ON public.guata_user_memory
  FOR UPDATE
  TO anon
  USING (
    session_id IS NOT NULL
    AND length(trim(session_id)) > 0
    AND (
      user_id IS NULL
      OR user_id IN ('convidado', 'anonymous', 'guest')
    )
  )
  WITH CHECK (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
  );

-- Normaliza registros antigos para user_id NULL (upsert futuro)
UPDATE public.guata_user_memory
SET user_id = NULL, updated_at = now()
WHERE user_id IN ('convidado', 'anonymous', 'guest');
