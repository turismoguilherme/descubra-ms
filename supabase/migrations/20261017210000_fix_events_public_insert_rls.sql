-- Cadastro público de eventos: default sponsor_payment_status = 'pending' conflitava com RLS (exigia NULL).

DROP POLICY IF EXISTS "Public can submit events" ON public.events;

CREATE POLICY "Public can submit events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  titulo IS NOT NULL
  AND data_inicio IS NOT NULL
  AND (is_visible IS NULL OR is_visible = false)
  AND (is_sponsored IS NULL OR is_sponsored = false)
  AND (sponsor_payment_status IS NULL OR sponsor_payment_status = 'pending')
  AND (approval_status IS NULL OR approval_status = 'pending')
);

GRANT INSERT ON TABLE public.events TO anon, authenticated;
