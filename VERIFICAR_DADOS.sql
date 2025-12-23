-- ============================================
-- VERIFICAÇÃO DE DADOS - INSTITUTIONAL_CONTENT
-- ============================================
-- Execute estes SQLs no Supabase SQL Editor para verificar se os dados foram inseridos

-- 1. Verificar se os dados foram inseridos (primeiros 50 registros)
SELECT 
  content_key, 
  LEFT(content_value, 80) as content_preview,
  is_active,
  created_at
FROM public.institutional_content
WHERE content_key LIKE 'ms_%' OR content_key LIKE 'viajar_%'
ORDER BY content_key
LIMIT 50;

-- 2. Contar total de registros e quantos estão ativos
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inativos,
  COUNT(CASE WHEN content_value IS NULL OR content_value = '' THEN 1 END) as vazios
FROM public.institutional_content
WHERE content_key LIKE 'ms_%' OR content_key LIKE 'viajar_%';

-- 3. Verificar registros específicos do MS Hero
SELECT 
  content_key, 
  content_value,
  is_active
FROM public.institutional_content
WHERE content_key LIKE 'ms_hero_%'
ORDER BY content_key;

-- 4. Verificar registros específicos do ViajARTur Hero
SELECT 
  content_key, 
  content_value,
  is_active
FROM public.institutional_content
WHERE content_key LIKE 'viajar_hero_%'
ORDER BY content_key;

-- 5. Verificar se há registros com is_active = false (que não aparecerão na plataforma)
SELECT 
  content_key, 
  LEFT(content_value, 50) as content_preview,
  is_active
FROM public.institutional_content
WHERE (content_key LIKE 'ms_%' OR content_key LIKE 'viajar_%')
  AND is_active = false
ORDER BY content_key;





