-- events_public com security_invoker=true (20260719033513) faz anon receber 0 linhas
-- porque SELECT em public.events é só staff. Restaurar security_invoker=false.

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
WHERE COALESCE(is_visible, false) = true
  AND COALESCE(approval_status, '') IN ('approved', 'aprovado');

GRANT SELECT ON public.events_public TO anon, authenticated;

COMMENT ON VIEW public.events_public IS
  'Eventos aprovados e visíveis para vitrine pública; security_invoker=false para leitura anônima.';

-- Reforço: política pública na tabela (útil se a view voltar a security_invoker).
DROP POLICY IF EXISTS "Public can view approved visible events" ON public.events;
CREATE POLICY "Public can view approved visible events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (
  COALESCE(is_visible, false) = true
  AND COALESCE(approval_status, '') IN ('approved', 'aprovado')
);
