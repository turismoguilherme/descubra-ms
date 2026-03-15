-- Migration: Permitir que admins excluam passport_stamps por route_id
-- Data: 2025-12-26
-- Descrição: Cria função SECURITY DEFINER para excluir stamps por route_id, bypassando RLS

-- Função para excluir stamps por route_id (apenas para admins)
CREATE OR REPLACE FUNCTION delete_passport_stamps_by_route(p_route_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
  is_admin BOOLEAN;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'municipal_manager')
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir carimbos por rota';
  END IF;

  -- Excluir todos os stamps da rota
  DELETE FROM passport_stamps
  WHERE route_id = p_route_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION delete_passport_stamps_by_route(UUID) IS 
'Permite que administradores excluam todos os passport_stamps associados a uma rota. Bypassa RLS usando SECURITY DEFINER.';

