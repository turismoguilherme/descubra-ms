-- Pontuação por checkpoint + carimbo grava points_earned + ranking usa valor correto

ALTER TABLE public.route_checkpoints
  ADD COLUMN IF NOT EXISTS points_reward integer NOT NULL DEFAULT 10;

ALTER TABLE public.route_checkpoints
  DROP CONSTRAINT IF EXISTS route_checkpoints_points_reward_check;
ALTER TABLE public.route_checkpoints
  ADD CONSTRAINT route_checkpoints_points_reward_check
  CHECK (points_reward >= 0 AND points_reward <= 1000);

COMMENT ON COLUMN public.route_checkpoints.points_reward IS
  'Pontos creditados no ranking ao carimbar este checkpoint (padrão 10).';

-- Carimbos históricos com 0/NULL passam a valer o points_reward do checkpoint (ou 10)
UPDATE public.passport_stamps ps
SET points_earned = COALESCE(NULLIF(rc.points_reward, 0), 10)
FROM public.route_checkpoints rc
WHERE rc.id = ps.checkpoint_id
  AND (ps.points_earned IS NULL OR ps.points_earned = 0);

-- validate_and_stamp_checkpoint: grava points_reward do checkpoint
CREATE OR REPLACE FUNCTION public.validate_and_stamp_checkpoint(
  p_user_id uuid,
  p_checkpoint_id uuid,
  p_route_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_photo_url text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  checkpoint_record RECORD;
  distance_meters DOUBLE PRECISION;
  allowed_radius DOUBLE PRECISION;
  existing_stamp RECORD;
  new_stamp RECORD;
  pending_prior_in_day INTEGER;
  pending_prior_days INTEGER;
  v_order_mode TEXT;
  v_points INTEGER;
BEGIN
  SELECT id, name, latitude, longitude, geofence_radius, requires_photo,
         day_number, order_sequence,
         COALESCE(NULLIF(points_reward, 0), 10) AS points_reward
  INTO checkpoint_record
  FROM route_checkpoints
  WHERE id = p_checkpoint_id AND route_id = p_route_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint não encontrado ou não pertence à rota');
  END IF;

  v_points := COALESCE(checkpoint_record.points_reward, 10);

  SELECT COALESCE(checkpoint_order_mode, 'sequential') INTO v_order_mode
  FROM routes WHERE id = p_route_id;

  SELECT id INTO existing_stamp
  FROM passport_stamps
  WHERE user_id = p_user_id AND checkpoint_id = p_checkpoint_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint já foi carimbado');
  END IF;

  IF COALESCE(v_order_mode, 'sequential') <> 'free' THEN
    SELECT COUNT(*) INTO pending_prior_days
    FROM route_checkpoints rc
    WHERE rc.route_id = p_route_id
      AND COALESCE(rc.day_number, 1) < COALESCE(checkpoint_record.day_number, 1)
      AND NOT EXISTS (
        SELECT 1 FROM passport_stamps ps
        WHERE ps.user_id = p_user_id AND ps.checkpoint_id = rc.id
      );

    IF pending_prior_days > 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Conclua todos os checkpoints do(s) dia(s) anterior(es) antes de iniciar o Dia %s.',
          COALESCE(checkpoint_record.day_number, 1))
      );
    END IF;

    SELECT COUNT(*) INTO pending_prior_in_day
    FROM route_checkpoints rc
    WHERE rc.route_id = p_route_id
      AND COALESCE(rc.day_number, 1) = COALESCE(checkpoint_record.day_number, 1)
      AND COALESCE(rc.order_sequence, 0) < COALESCE(checkpoint_record.order_sequence, 0)
      AND NOT EXISTS (
        SELECT 1 FROM passport_stamps ps
        WHERE ps.user_id = p_user_id AND ps.checkpoint_id = rc.id
      );

    IF pending_prior_in_day > 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Faça check-in nos checkpoints anteriores deste dia, na ordem definida.'
      );
    END IF;
  END IF;

  IF checkpoint_record.latitude IS NOT NULL AND checkpoint_record.longitude IS NOT NULL THEN
    distance_meters := (
      6371000 * acos(
        LEAST(1, GREATEST(-1,
        cos(radians(p_latitude)) * cos(radians(checkpoint_record.latitude)) *
        cos(radians(checkpoint_record.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(checkpoint_record.latitude))
        ))
      )
    );
    allowed_radius := COALESCE(checkpoint_record.geofence_radius, 100);

    IF distance_meters > allowed_radius THEN
      INSERT INTO security_audit_log (action, user_id, success, error_message, metadata)
      VALUES ('geofence_violation', p_user_id, false,
        format('Distância: %.0fm, Permitido: %.0fm', distance_meters, allowed_radius),
        jsonb_build_object(
          'checkpoint_id', p_checkpoint_id,
          'user_lat', p_latitude, 'user_lng', p_longitude,
          'checkpoint_lat', checkpoint_record.latitude,
          'checkpoint_lng', checkpoint_record.longitude,
          'distance', distance_meters
        ));
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Você está a %.0fm do checkpoint. Aproxime-se para carimbar (máx: %.0fm).', distance_meters, allowed_radius),
        'distance', distance_meters,
        'allowed_radius', allowed_radius
      );
    END IF;
  END IF;

  IF checkpoint_record.requires_photo = true AND p_photo_url IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este checkpoint requer uma foto para validação');
  END IF;

  INSERT INTO passport_stamps (
    user_id, checkpoint_id, route_id, stamp_type, stamped_at,
    latitude, longitude, photo_url, points_earned
  ) VALUES (
    p_user_id, p_checkpoint_id, p_route_id, 'checkpoint', NOW(),
    p_latitude, p_longitude, p_photo_url, v_points
  ) RETURNING * INTO new_stamp;

  INSERT INTO security_audit_log (action, user_id, success, metadata)
  VALUES ('checkpoint_stamped', p_user_id, true,
    jsonb_build_object(
      'checkpoint_id', p_checkpoint_id,
      'route_id', p_route_id,
      'distance', distance_meters,
      'day_number', checkpoint_record.day_number,
      'points_earned', v_points
    ));

  RETURN jsonb_build_object(
    'success', true,
    'stamp_id', new_stamp.id,
    'distance', distance_meters,
    'checkpoint_name', checkpoint_record.name,
    'points_earned', v_points
  );
END;
$function$;

-- Ranking: points_earned; se 0/NULL, cai no points_reward do checkpoint (ou 10)
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
    up.avatar_url,
    a.pts_total,
    a.stamps_total
  FROM agg a
  LEFT JOIN user_profiles up ON up.user_id = a.uid
  WHERE COALESCE(up.leaderboard_opt_out, false) = false
  ORDER BY a.pts_total DESC, a.stamps_total DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200));
$function$;

CREATE OR REPLACE FUNCTION public.get_my_leaderboard_position(
  p_period text DEFAULT 'all',
  p_region text DEFAULT NULL
)
RETURNS TABLE(
  rank_position bigint,
  total_points bigint,
  total_stamps bigint,
  total_participants bigint
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
           COUNT(*)::bigint AS stamps_total,
           RANK() OVER (ORDER BY SUM(f.pts) DESC, COUNT(*) DESC)::bigint AS pos
    FROM filtered f
    GROUP BY f.uid
  )
  SELECT a.pos, a.pts_total, a.stamps_total, (SELECT COUNT(*)::bigint FROM agg)
  FROM agg a
  WHERE a.uid = auth.uid();
$function$;

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
                 ORDER BY SUM(
                   COALESCE(NULLIF(ps.points_earned, 0), NULLIF(rc.points_reward, 0), 10)
                 ) DESC,
                 COUNT(*) DESC
               ) AS pos
        FROM passport_stamps ps
        JOIN routes r ON r.id = ps.route_id
        LEFT JOIN route_checkpoints rc ON rc.id = ps.checkpoint_id
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
           SUM(COALESCE(NULLIF(ps.points_earned, 0), NULLIF(rc.points_reward, 0), 10)) AS pts,
           COUNT(*) AS stamps
    FROM passport_stamps ps
    JOIN routes r ON r.id = ps.route_id
    LEFT JOIN route_checkpoints rc ON rc.id = ps.checkpoint_id
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
