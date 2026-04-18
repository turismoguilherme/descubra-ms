-- Query para verificar se as tabelas do Passaporte Digital foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins',
  'user_passports'
)
ORDER BY table_name;

-- Verificar se as colunas foram adicionadas às tabelas existentes
SELECT 
  column_name, 
  data_type, 
  table_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  (table_name = 'routes' AND column_name IN ('video_url', 'passport_number_prefix'))
  OR
  (table_name = 'route_checkpoints' AND column_name IN ('stamp_fragment_number', 'geofence_radius', 'requires_photo'))
)
ORDER BY table_name, column_name;

-- Verificar se as funções foram criadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_passport_number',
  'calculate_distance',
  'check_geofence',
  'check_checkin_rate_limit',
  'unlock_rewards'
)
ORDER BY routine_name;

