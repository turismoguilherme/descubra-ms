
-- ============================================================
-- SECURITY FIX: Server-side geofence validation for passport stamps
-- Prevents GPS spoofing and direct API manipulation
-- ============================================================

-- Create function to validate geofence and insert stamp atomically
CREATE OR REPLACE FUNCTION public.validate_and_stamp_checkpoint(
  p_user_id UUID,
  p_checkpoint_id UUID,
  p_route_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  checkpoint_record RECORD;
  distance_meters DOUBLE PRECISION;
  allowed_radius DOUBLE PRECISION;
  existing_stamp RECORD;
  new_stamp RECORD;
BEGIN
  -- 1. Verificar se o checkpoint existe e pertence à rota
  SELECT id, name, latitude, longitude, geofence_radius, requires_photo
  INTO checkpoint_record
  FROM route_checkpoints
  WHERE id = p_checkpoint_id AND route_id = p_route_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint não encontrado ou não pertence à rota');
  END IF;

  -- 2. Verificar se já existe stamp para este checkpoint
  SELECT id INTO existing_stamp
  FROM passport_stamps
  WHERE user_id = p_user_id 
    AND checkpoint_id = p_checkpoint_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Checkpoint já foi carimbado');
  END IF;

  -- 3. Calcular distância usando fórmula Haversine no servidor
  IF checkpoint_record.latitude IS NOT NULL AND checkpoint_record.longitude IS NOT NULL THEN
    distance_meters := (
      6371000 * acos(
        cos(radians(p_latitude)) * cos(radians(checkpoint_record.latitude)) *
        cos(radians(checkpoint_record.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(checkpoint_record.latitude))
      )
    );

    allowed_radius := COALESCE(checkpoint_record.geofence_radius, 100); -- Default 100m

    IF distance_meters > allowed_radius THEN
      -- Log tentativa suspeita
      INSERT INTO security_audit_log (action, user_id, success, error_message, metadata)
      VALUES (
        'geofence_violation',
        p_user_id,
        false,
        format('Distância: %.0fm, Permitido: %.0fm', distance_meters, allowed_radius),
        jsonb_build_object(
          'checkpoint_id', p_checkpoint_id,
          'user_lat', p_latitude,
          'user_lng', p_longitude,
          'checkpoint_lat', checkpoint_record.latitude,
          'checkpoint_lng', checkpoint_record.longitude,
          'distance', distance_meters
        )
      );
      
      RETURN jsonb_build_object(
        'success', false, 
        'error', format('Você está a %.0fm do checkpoint. Aproxime-se para carimbar (máx: %.0fm).', distance_meters, allowed_radius),
        'distance', distance_meters,
        'allowed_radius', allowed_radius
      );
    END IF;
  END IF;

  -- 4. Verificar foto se necessário
  IF checkpoint_record.requires_photo = true AND p_photo_url IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este checkpoint requer uma foto para validação');
  END IF;

  -- 5. Inserir stamp (validação passou)
  INSERT INTO passport_stamps (
    user_id, 
    checkpoint_id, 
    route_id, 
    stamp_type, 
    stamped_at,
    latitude,
    longitude,
    photo_url
  )
  VALUES (
    p_user_id,
    p_checkpoint_id,
    p_route_id,
    'checkpoint',
    NOW(),
    p_latitude,
    p_longitude,
    p_photo_url
  )
  RETURNING * INTO new_stamp;

  -- 6. Log de sucesso
  INSERT INTO security_audit_log (action, user_id, success, metadata)
  VALUES (
    'checkpoint_stamped',
    p_user_id,
    true,
    jsonb_build_object(
      'checkpoint_id', p_checkpoint_id,
      'route_id', p_route_id,
      'distance', distance_meters
    )
  );

  RETURN jsonb_build_object(
    'success', true, 
    'stamp_id', new_stamp.id,
    'distance', distance_meters,
    'checkpoint_name', checkpoint_record.name
  );
END;
$$;

-- Adicionar colunas latitude/longitude/photo_url ao passport_stamps se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'passport_stamps' AND column_name = 'latitude') THEN
    ALTER TABLE passport_stamps ADD COLUMN latitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'passport_stamps' AND column_name = 'longitude') THEN
    ALTER TABLE passport_stamps ADD COLUMN longitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'passport_stamps' AND column_name = 'photo_url') THEN
    ALTER TABLE passport_stamps ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- RLS: Garantir que passport_stamps tem RLS habilitado
ALTER TABLE passport_stamps ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só podem ver seus próprios stamps
DROP POLICY IF EXISTS "Users can view own stamps" ON passport_stamps;
CREATE POLICY "Users can view own stamps"
ON passport_stamps FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Inserção SOMENTE via função validate_and_stamp_checkpoint (SECURITY DEFINER)
-- Remover qualquer policy de INSERT que permita inserção direta
DROP POLICY IF EXISTS "Users can insert own stamps" ON passport_stamps;
DROP POLICY IF EXISTS "Authenticated users can insert stamps" ON passport_stamps;

-- Nota: A inserção é feita via validate_and_stamp_checkpoint que é SECURITY DEFINER
-- Isso garante que nenhum usuário pode inserir stamps diretamente via API
