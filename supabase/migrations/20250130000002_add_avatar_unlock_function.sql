-- Função para desbloquear avatares automaticamente ao completar rotas
CREATE OR REPLACE FUNCTION unlock_route_avatars(
  p_user_id UUID,
  p_route_id UUID
)
RETURNS TABLE(avatar_id UUID, avatar_name TEXT, rarity TEXT) AS $$
DECLARE
  v_avatar RECORD;
  v_user_route_count INTEGER;
  v_rarity_tier TEXT;
  v_max_avatars INTEGER;
BEGIN
  -- Contar quantas rotas o usuário já completou (para determinar raridade)
  SELECT COUNT(DISTINCT ur.route_id) INTO v_user_route_count
  FROM user_routes ur
  WHERE ur.user_id = p_user_id AND ur.completed_at IS NOT NULL;

  -- Determinar tier de raridade baseado no progresso global
  CASE
    WHEN v_user_route_count >= 7 THEN v_rarity_tier := 'legendary';
    WHEN v_user_route_count >= 4 THEN v_rarity_tier := 'epic';
    WHEN v_user_route_count >= 1 THEN v_rarity_tier := 'rare';
    ELSE v_rarity_tier := 'common';
  END CASE;

  -- Para cada recompensa de avatar configurada nesta rota
  FOR v_avatar IN
    SELECT pr.id as reward_id, pr.avatar_id, pr.max_avatars_per_route,
           pa.name, pa.rarity, pa.display_order
    FROM passport_rewards pr
    JOIN pantanal_avatars pa ON pa.id = pr.avatar_id
    WHERE pr.route_id = p_route_id
      AND pr.reward_type = 'avatar'
      AND pr.is_active = true
      AND (pr.expires_at IS NULL OR pr.expires_at > NOW())
      AND NOT EXISTS (
        SELECT 1 FROM user_avatars ua
        WHERE ua.user_id = p_user_id AND ua.avatar_id = pr.avatar_id
      )
    ORDER BY pa.display_order, pa.rarity DESC
  LOOP
    -- Verificar limite de avatares por rota
    SELECT COUNT(*) INTO v_max_avatars
    FROM user_avatars ua
    WHERE ua.user_id = p_user_id AND ua.route_id = p_route_id;

    IF v_max_avatars < COALESCE(v_avatar.max_avatars_per_route, 3) THEN
      -- Desbloquear avatar
      INSERT INTO user_avatars (user_id, avatar_id, route_id)
      VALUES (p_user_id, v_avatar.avatar_id, p_route_id);

      RETURN QUERY SELECT v_avatar.avatar_id, v_avatar.name, v_avatar.rarity::TEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;
