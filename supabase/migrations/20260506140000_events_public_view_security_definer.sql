-- events_public must run as definer: with security_invoker=true, anon still hits RLS on
-- public.events (staff-only SELECT after 20260505163855) and gets zero rows.
-- Definer read only exposes columns listed below (no contato_email / contato_telefone).

DROP VIEW IF EXISTS public.events_public CASCADE;

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
  'Approved visible events for public listing; security_invoker=false so anon can read without events table SELECT.';
