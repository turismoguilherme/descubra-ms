
-- Fix SECURITY DEFINER View: recreate events_public with security_invoker=on
DROP VIEW IF EXISTS public.events_public;
CREATE VIEW public.events_public
WITH (security_invoker = on) AS
SELECT id, external_id, titulo, descricao, data_inicio, data_fim, local, cidade, estado,
  categoria, tipo_entrada, organizador, fonte, site_oficial, link_inscricao, tags,
  imagem_principal, video_promocional, publico_alvo, processado_por_ia, confiabilidade,
  ultima_atualizacao, created_at, updated_at, is_visible, approval_status, is_sponsored,
  sponsor_tier, sponsor_start_date, sponsor_end_date, sponsor_payment_status,
  start_time, end_time
FROM public.events
WHERE COALESCE(is_visible, true) = true
  AND COALESCE(approval_status, 'approved'::text) = ANY (ARRAY['approved'::text, 'aprovado'::text]);

GRANT SELECT ON public.events_public TO anon, authenticated;

-- Fix Function Search Path Mutable for the 3 user-defined trigger functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_api_usage_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tourist_regions_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
