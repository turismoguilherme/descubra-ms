-- Verificar análises de métricas geradas
SELECT 
  type,
  created_at,
  LEFT(insights, 100) as insights_preview
FROM ai_analyses
ORDER BY created_at DESC
LIMIT 10;

-- Verificar aprovações automáticas
SELECT 
  event_id,
  approval_reason,
  created_at
FROM ai_auto_approvals
ORDER BY created_at DESC
LIMIT 10;

-- Verificar melhorias de SEO
SELECT 
  content_type,
  content_id,
  priority,
  status,
  created_at
FROM ai_seo_improvements
ORDER BY created_at DESC
LIMIT 10;


