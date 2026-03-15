-- Migration: Adicionar campo is_published e função para resetar progresso
-- Data: 2025-12-26
-- Descrição: Adiciona campo is_published para controlar publicação de rotas e função para usuários resetarem seu progresso

-- 1. Adicionar campo is_published na tabela routes
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 2. Atualizar rotas existentes: se is_active=true e tem checkpoints, marcar como published
UPDATE routes r
SET is_published = true
WHERE r.is_active = true
AND EXISTS (
  SELECT 1 FROM route_checkpoints rc
  WHERE rc.route_id = r.id
);

-- 3. Criar função para resetar progresso do usuário em uma rota
CREATE OR REPLACE FUNCTION reset_user_route_progress(
  p_user_id UUID,
  p_route_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Verificar se o usuário está tentando resetar seu próprio progresso
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode resetar seu próprio progresso';
  END IF;

  -- Excluir todos os stamps do usuário para esta rota
  DELETE FROM passport_stamps
  WHERE user_id = p_user_id
  AND route_id = p_route_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION reset_user_route_progress(UUID, UUID) IS 
'Permite que usuários resetem seu próprio progresso em uma rota, removendo todos os carimbos (stamps) associados. Não remove recompensas já ganhas.';

-- 4. Criar índice para melhorar performance da query de listagem
CREATE INDEX IF NOT EXISTS idx_routes_is_published ON routes(is_published) WHERE is_published = true;

-- 5. Comentário na coluna
COMMENT ON COLUMN routes.is_published IS 
'Indica se a rota está publicada e disponível para usuários finais. Deve ser true apenas quando a rota tem pelo menos um checkpoint ativo.';

