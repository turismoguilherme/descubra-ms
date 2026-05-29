-- Garante coluna logo_evento (migration 20251223000000 pode não ter sido aplicada).
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS logo_evento TEXT;

COMMENT ON COLUMN public.events.logo_evento IS
  'URL da imagem do logotipo do evento (armazenado no Supabase Storage)';

-- Expose logo_evento on events_public for listing and share previews (OG image).
DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public
WITH (security_invoker = false)
AS
SELECT
  id,
  external_id,
  titulo,
  descricao,
  data_inicio,
  data_fim,
  local,
  cidade,
  estado,
  categoria,
  tipo_entrada,
  organizador,
  fonte,
  site_oficial,
  link_inscricao,
  tags,
  imagem_principal,
  logo_evento,
  video_promocional,
  publico_alvo,
  processado_por_ia,
  confiabilidade,
  ultima_atualizacao,
  created_at,
  updated_at,
  is_visible,
  approval_status,
  is_sponsored,
  sponsor_tier,
  sponsor_start_date,
  sponsor_end_date,
  sponsor_payment_status,
  start_time,
  end_time
FROM public.events
WHERE COALESCE(is_visible, true) = true
  AND COALESCE(approval_status, 'approved') IN ('approved', 'aprovado');

GRANT SELECT ON public.events_public TO anon, authenticated;

COMMENT ON VIEW public.events_public IS
  'Approved visible events for public listing and share; security_invoker=false so anon can read without events table SELECT.';
