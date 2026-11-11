CREATE OR REPLACE FUNCTION public.unlock_rewards(p_user_id uuid, p_route_id uuid)
RETURNS TABLE(reward_id uuid, voucher_code character varying)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $function$
DECLARE v_reward RECORD; v_voucher_code VARCHAR; v_prefix VARCHAR; v_new_id uuid; v_count int;
BEGIN
  IF auth.uid() IS NULL OR (auth.uid() <> p_user_id AND NOT public.is_admin_user(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão para emitir vouchers para este usuário';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM route_checkpoints rc WHERE rc.route_id = p_route_id
    AND NOT EXISTS (SELECT 1 FROM passport_stamps ps WHERE ps.checkpoint_id = rc.id AND ps.user_id = p_user_id)) THEN
    FOR v_reward IN SELECT * FROM passport_rewards pr WHERE pr.route_id = p_route_id AND pr.is_active = true
      AND (pr.reward_type IS DISTINCT FROM 'avatar')
      AND (pr.expires_at IS NULL OR pr.expires_at > NOW())
      AND NOT EXISTS (SELECT 1 FROM user_rewards ur WHERE ur.user_id = p_user_id AND ur.reward_id = pr.id)
    LOOP
      IF v_reward.max_vouchers IS NOT NULL THEN
        SELECT count(*) INTO v_count FROM user_rewards ur WHERE ur.reward_id = v_reward.id;
        IF v_count >= v_reward.max_vouchers THEN CONTINUE; END IF;
      END IF;
      v_prefix := COALESCE(NULLIF(TRIM(v_reward.reward_code_prefix), ''), 'MS');
      LOOP
        v_voucher_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(p_user_id::TEXT || v_reward.id::TEXT || clock_timestamp()::TEXT || RANDOM()::TEXT), 1, 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM user_rewards ur WHERE ur.voucher_code = v_voucher_code);
      END LOOP;
      INSERT INTO user_rewards (user_id, reward_id, route_id, voucher_code)
      VALUES (p_user_id, v_reward.id, p_route_id, v_voucher_code);
      reward_id := v_reward.id; voucher_code := v_voucher_code;
      RETURN NEXT;
    END LOOP;
  END IF;
  RETURN;
END; $function$;
GRANT EXECUTE ON FUNCTION public.unlock_rewards(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_passport_leaderboard(p_period text DEFAULT 'all'::text, p_region text DEFAULT NULL::text, p_limit integer DEFAULT 50)
 RETURNS TABLE(rank_position bigint, ranked_user_id uuid, display_name text, avatar_url text, total_points bigint, total_stamps bigint)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH filtered AS (
    SELECT ps.user_id AS uid,
           COALESCE(NULLIF(ps.points_earned, 0), NULLIF(rc.points_reward, 0), 10) AS pts
    FROM passport_stamps ps
    JOIN routes r ON r.id = ps.route_id
    LEFT JOIN route_checkpoints rc ON rc.id = ps.checkpoint_id
    WHERE ps.route_id IS NOT NULL
      AND (p_period <> 'month' OR ps.stamped_at >= date_trunc('month', now()))
      AND (p_region IS NULL OR r.region = p_region)
  ),
  agg AS (
    SELECT f.uid, SUM(f.pts)::bigint AS pts_total, COUNT(*)::bigint AS stamps_total
    FROM filtered f GROUP BY f.uid
  )
  SELECT
    RANK() OVER (ORDER BY a.pts_total DESC, a.stamps_total DESC)::bigint,
    a.uid,
    COALESCE(NULLIF(up.full_name, ''), NULLIF(up.display_name, ''),
             NULLIF(split_part(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''), ' ', 1), ''),
             'Viajante'),
    COALESCE(
      CASE WHEN COALESCE(up.avatar_display_mode, 'pantanal') = 'photo' THEN NULLIF(TRIM(up.avatar_url), '') ELSE pa.image_url END,
      NULLIF(TRIM(up.avatar_url), ''),
      pa.image_url,
      NULLIF(au.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(au.raw_user_meta_data->>'picture', '')
    ),
    a.pts_total,
    a.stamps_total
  FROM agg a
  LEFT JOIN user_profiles up ON up.user_id = a.uid
  LEFT JOIN auth.users au ON au.id = a.uid
  LEFT JOIN pantanal_avatars pa ON pa.is_active = true AND up.selected_avatar IS NOT NULL AND pa.id::text = TRIM(up.selected_avatar)
  WHERE COALESCE(up.leaderboard_opt_out, false) = false
  ORDER BY a.pts_total DESC, a.stamps_total DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200));
$function$;

UPDATE public.passport_rewards SET discount_percentage = 10, is_fallback = false
WHERE id = '0064e60b-3703-4a41-aaee-b88871d976f2';