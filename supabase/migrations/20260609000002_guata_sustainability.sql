-- Guatá: sustentabilidade Opção 1+2 (cache anônimo + orçamento diário Gemini)

-- ============================================================
-- 1) Orçamento diário global de chamadas Gemini (teto 300/dia)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guata_gemini_daily_usage (
  usage_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  gemini_calls INTEGER NOT NULL DEFAULT 0 CHECK (gemini_calls >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.guata_gemini_daily_usage IS
  'Contador global diário de chamadas Gemini do Guatá (Edge Functions).';

ALTER TABLE public.guata_gemini_daily_usage ENABLE ROW LEVEL SECURITY;

-- Sem policies para anon/authenticated: apenas service role / SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.guata_try_consume_gemini_budget(p_max INTEGER DEFAULT 300)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_today DATE := CURRENT_DATE;
  v_max INTEGER := GREATEST(1, COALESCE(p_max, 300));
BEGIN
  INSERT INTO public.guata_gemini_daily_usage (usage_date, gemini_calls)
  VALUES (v_today, 0)
  ON CONFLICT (usage_date) DO NOTHING;

  SELECT gemini_calls INTO v_count
  FROM public.guata_gemini_daily_usage
  WHERE usage_date = v_today
  FOR UPDATE;

  IF v_count >= v_max THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'DAILY_BUDGET',
      'count', v_count,
      'max', v_max
    );
  END IF;

  UPDATE public.guata_gemini_daily_usage
  SET gemini_calls = gemini_calls + 1,
      updated_at = NOW()
  WHERE usage_date = v_today;

  RETURN jsonb_build_object(
    'ok', true,
    'count', v_count + 1,
    'max', v_max
  );
END;
$$;

REVOKE ALL ON FUNCTION public.guata_try_consume_gemini_budget(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guata_try_consume_gemini_budget(INTEGER) TO service_role;

-- ============================================================
-- 2) Cache de respostas: visitantes podem gravar (sustentabilidade)
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert shared guata cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Anon can update shared guata cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Anon can insert individual guata cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Anon can update individual guata cache" ON public.guata_response_cache;

CREATE POLICY "Anon can insert shared guata cache"
  ON public.guata_response_cache
  FOR INSERT
  TO anon
  WITH CHECK (cache_type = 'shared');

CREATE POLICY "Anon can update shared guata cache"
  ON public.guata_response_cache
  FOR UPDATE
  TO anon
  USING (cache_type = 'shared')
  WITH CHECK (cache_type = 'shared');

CREATE POLICY "Anon can insert individual guata cache"
  ON public.guata_response_cache
  FOR INSERT
  TO anon
  WITH CHECK (
    cache_type = 'individual'
    AND user_id IS NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
  );

CREATE POLICY "Anon can update individual guata cache"
  ON public.guata_response_cache
  FOR UPDATE
  TO anon
  USING (
    cache_type = 'individual'
    AND user_id IS NULL
    AND session_id IS NOT NULL
  )
  WITH CHECK (
    cache_type = 'individual'
    AND user_id IS NULL
    AND session_id IS NOT NULL
  );

-- ============================================================
-- 3) Memória ML para visitantes (upsert)
-- ============================================================
DROP POLICY IF EXISTS "Allow anonymous update on guata_user_memory" ON public.guata_user_memory;

CREATE POLICY "Allow anonymous update on guata_user_memory"
  ON public.guata_user_memory
  FOR UPDATE
  TO anon
  USING (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
  )
  WITH CHECK (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
  );
