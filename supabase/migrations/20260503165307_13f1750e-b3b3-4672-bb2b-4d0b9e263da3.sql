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
BEGIN
  -- 1. Buscar checkpoint
  SELECT id, name, latitude, longitude, geofence_radius, requires_photo,
         day_number, order_sequence
  INTO checkpoint_record
  FROM route_checkpoints
  WHERE id = p_checkpoint_id AND route_id = p_route_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint não encontrado ou não pertence à rota');
  END IF;

  -- 2. Já carimbado?
  SELECT id INTO existing_stamp
  FROM passport_stamps
  WHERE user_id = p_user_id AND checkpoint_id = p_checkpoint_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint já foi carimbado');
  END IF;

  -- 2.1 Sequencial Total — dias anteriores precisam estar 100% completos
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

  -- 2.2 Sequencial Total — dentro do dia, na ordem
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

  -- 3. Geofence
  IF checkpoint_record.latitude IS NOT NULL AND checkpoint_record.longitude IS NOT NULL THEN
    distance_meters := (
      6371000 * acos(
        cos(radians(p_latitude)) * cos(radians(checkpoint_record.latitude)) *
        cos(radians(checkpoint_record.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(checkpoint_record.latitude))
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

  -- 4. Foto
  IF checkpoint_record.requires_photo = true AND p_photo_url IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este checkpoint requer uma foto para validação');
  END IF;

  -- 5. Inserir stamp
  INSERT INTO passport_stamps (
    user_id, checkpoint_id, route_id, stamp_type, stamped_at,
    latitude, longitude, photo_url
  ) VALUES (
    p_user_id, p_checkpoint_id, p_route_id, 'checkpoint', NOW(),
    p_latitude, p_longitude, p_photo_url
  ) RETURNING * INTO new_stamp;

  INSERT INTO security_audit_log (action, user_id, success, metadata)
  VALUES ('checkpoint_stamped', p_user_id, true,
    jsonb_build_object(
      'checkpoint_id', p_checkpoint_id,
      'route_id', p_route_id,
      'distance', distance_meters,
      'day_number', checkpoint_record.day_number
    ));

  RETURN jsonb_build_object(
    'success', true,
    'stamp_id', new_stamp.id,
    'distance', distance_meters,
    'checkpoint_name', checkpoint_record.name
  );
END;
$function$;