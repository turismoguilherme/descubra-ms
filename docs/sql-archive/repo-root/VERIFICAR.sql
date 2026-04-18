SELECT
  table_name,
  '✅ Existe' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'tourism_inventory',
    'inventory_categories',
    'dynamic_menus',
    'viajar_products',
    'attendant_checkins',
    'attendant_allowed_locations',
    'attendant_location_assignments'
  )
ORDER BY table_name;

SELECT
  name,
  '✅ Categoria' as status
FROM inventory_categories
ORDER BY sort_order;
