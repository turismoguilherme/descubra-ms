-- ============================================================
-- Guatá: corrigir RLS em guata_user_memory
-- Problema: política "Users can manage own memory" (FOR ALL authenticated)
-- exige user_id = auth.uid() em INSERT — inserts do ML com user_id NULL falhavam.
-- Usuários anônimos (role anon) precisam da política de INSERT explícita.
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own memory" ON public.guata_user_memory;

-- Leitura / atualização / exclusão: apenas linhas com user_id do próprio usuário
CREATE POLICY "guata_memory_authenticated_select"
  ON public.guata_user_memory
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NOT NULL
    AND user_id = (auth.uid())::text
  );

CREATE POLICY "guata_memory_authenticated_update"
  ON public.guata_user_memory
  FOR UPDATE
  TO authenticated
  USING (
    user_id IS NOT NULL
    AND user_id = (auth.uid())::text
  )
  WITH CHECK (
    user_id IS NOT NULL
    AND user_id = (auth.uid())::text
  );

CREATE POLICY "guata_memory_authenticated_delete"
  ON public.guata_user_memory
  FOR DELETE
  TO authenticated
  USING (
    user_id IS NOT NULL
    AND user_id = (auth.uid())::text
  );

-- INSERT autenticado: próprio user_id OU guest (user_id NULL) com session_id — usado pelo ML
CREATE POLICY "guata_memory_authenticated_insert"
  ON public.guata_user_memory
  FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND length(trim(session_id)) > 0
    AND length(session_id) <= 255
    AND memory_type IS NOT NULL
    AND length(trim(memory_type)) > 0
    AND length(memory_type) <= 100
    AND memory_key IS NOT NULL
    AND length(trim(memory_key)) > 0
    AND length(memory_key) <= 255
    AND (user_id IS NULL OR user_id = (auth.uid())::text)
    AND (user_id IS NULL OR length(user_id) <= 255)
  );

-- INSERT anônimo (visitante com session_id)
DROP POLICY IF EXISTS "Allow anonymous inserts on guata_user_memory" ON public.guata_user_memory;

CREATE POLICY "Allow anonymous inserts on guata_user_memory"
  ON public.guata_user_memory
  FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL
    AND length(trim(session_id)) > 0
    AND length(session_id) <= 255
    AND memory_type IS NOT NULL
    AND length(trim(memory_type)) > 0
    AND length(memory_type) <= 100
    AND memory_key IS NOT NULL
    AND length(trim(memory_key)) > 0
    AND length(memory_key) <= 255
    AND (user_id IS NULL OR length(user_id) <= 255)
  );

COMMENT ON POLICY "guata_memory_authenticated_insert" ON public.guata_user_memory IS
  'Permite ML salvar memória com user_id NULL (sessão) ou com user_id = auth.uid().';
