-- Conquistas de ranking + helper para sequência de meses no top N

INSERT INTO public.achievements (
  name, description, icon, category, criteria, points_reward, rarity, is_active
)
VALUES
  (
    'Top 10 do mês',
    'Fique entre os 10 primeiros do ranking mensal do Passaporte Digital.',
    '🏆',
    'ranking',
    '{"type":"leaderboard_monthly_top","max_rank":10}'::jsonb,
    150,
    'rare',
    true
  ),
  (
    '1º lugar regional',
    'Lidere o ranking mensal em uma região turística.',
    '🥇',
    'ranking',
    '{"type":"leaderboard_regional_first","max_rank":1}'::jsonb,
    200,
    'epic',
    true
  ),
  (
    'Sequência de 3 meses no top 50',
    'Permaneça no top 50 do ranking mensal por 3 meses consecutivos.',
    '🔥',
    'ranking',
    '{"type":"leaderboard_top50_streak","max_rank":50,"months":3}'::jsonb,
    300,
    'legendary',
    true
  )
ON CONFLICT (name) DO UPDATE
SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  criteria = EXCLUDED.criteria,
  points_reward = EXCLUDED.points_reward,
  rarity = EXCLUDED.rarity,
  is_active = true,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.count_consecutive_months_in_top(
  p_max_rank integer DEFAULT 50,
  p_lookback integer DEFAULT 3
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_offset integer;
  v_in_top boolean;
  v_streak integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 0;
  END IF;

  FOR v_offset IN 0..(GREATEST(p_lookback, 1) - 1) LOOP
    SELECT EXISTS (
      SELECT 1
      FROM (
        SELECT ps.user_id AS uid,
               RANK() OVER (
                 ORDER BY SUM(COALESCE(ps.points_earned, 10)) DESC,
                          COUNT(*) DESC
               ) AS pos
        FROM passport_stamps ps
        JOIN routes r ON r.id = ps.route_id
        WHERE ps.route_id IS NOT NULL
          AND ps.stamped_at >= date_trunc('month', now()) - make_interval(months => v_offset)
          AND ps.stamped_at <  date_trunc('month', now()) - make_interval(months => v_offset) + interval '1 month'
        GROUP BY ps.user_id
      ) ranked
      WHERE ranked.uid = v_uid
        AND ranked.pos <= GREATEST(p_max_rank, 1)
    ) INTO v_in_top;

    IF v_in_top THEN
      v_streak := v_streak + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_is_regional_monthly_leader()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH monthly AS (
    SELECT ps.user_id AS uid,
           r.region,
           SUM(COALESCE(ps.points_earned, 10)) AS pts,
           COUNT(*) AS stamps
    FROM passport_stamps ps
    JOIN routes r ON r.id = ps.route_id
    WHERE ps.route_id IS NOT NULL
      AND r.region IS NOT NULL
      AND btrim(r.region) <> ''
      AND ps.stamped_at >= date_trunc('month', now())
    GROUP BY ps.user_id, r.region
  ),
  ranked AS (
    SELECT uid, region,
           RANK() OVER (
             PARTITION BY region
             ORDER BY pts DESC, stamps DESC
           ) AS pos
    FROM monthly
  )
  SELECT EXISTS (
    SELECT 1 FROM ranked
    WHERE uid = auth.uid() AND pos = 1
  );
$function$;

REVOKE ALL ON FUNCTION public.count_consecutive_months_in_top(integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_is_regional_monthly_leader() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_consecutive_months_in_top(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_regional_monthly_leader() TO authenticated;
