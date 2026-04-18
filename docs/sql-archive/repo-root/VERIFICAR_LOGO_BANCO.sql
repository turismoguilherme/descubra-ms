-- ============================================
-- VERIFICAR LOGO NO BANCO DE DADOS
-- ============================================
-- Execute este SQL no Supabase SQL Editor para verificar qual logo está no banco

-- Verificar logo do Descubra MS
SELECT 
  content_key,
  content_value as logo_url,
  content_type,
  description,
  is_active,
  updated_at,
  created_at
FROM public.institutional_content
WHERE content_key = 'ms_logo_url';

-- Se não houver resultado, significa que a logo padrão está sendo usada
-- A logo padrão é: /images/logo-descubra-ms.png?v=3

