-- Ranking: exibir avatar do Pantanal (selected_avatar) quando avatar_url estiver vazio.

CREATE OR REPLACE FUNCTION public.get_passport_leaderboard(
  p_period text DEFAULT 'all',
  p_region text DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  rank_position bigint,
  ranked_user_id uuid,
  display_name text,
  avatar_url text,
  total_points bigint,
  total_stamps bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH filtered AS (
    SELECT ps.user_id AS uid,
           COALESCE(
             NULLIF(ps.points_earned, 0),
             NULLIF(rc.points_reward, 0),
             10
           ) AS pts
    FROM passport_stamps ps
    JOIN routes r ON r.id = ps.route_id
    LEFT JOIN route_checkpoints rc ON rc.id = ps.checkpoint_id
    WHERE ps.route_id IS NOT NULL
      AND (p_period <> 'month' OR ps.stamped_at >= date_trunc('month', now()))
      AND (p_region IS NULL OR r.region = p_region)
  ),
  agg AS (
    SELECT f.uid,
           SUM(f.pts)::bigint AS pts_total,
           COUNT(*)::bigint AS stamps_total
    FROM filtered f
    GROUP BY f.uid
  )
  SELECT
    RANK() OVER (ORDER BY a.pts_total DESC, a.stamps_total DESC)::bigint,
    a.uid,
    COALESCE(NULLIF(up.full_name, ''), NULLIF(up.display_name, ''), 'Viajante'),
    COALESCE(
      NULLIF(TRIM(up.avatar_url), ''),
      pa.image_url
    ),
    a.pts_total,
    a.stamps_total
  FROM agg a
  LEFT JOIN user_profiles up ON up.user_id = a.uid
  LEFT JOIN pantanal_avatars pa
    ON pa.is_active = true
    AND up.selected_avatar IS NOT NULL
    AND pa.id::text = TRIM(up.selected_avatar)
  WHERE COALESCE(up.leaderboard_opt_out, false) = false
  ORDER BY a.pts_total DESC, a.stamps_total DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200));
$function$;
