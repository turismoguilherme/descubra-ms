-- Envio público de eventos: upload de imagem em pasta controlada + confirma política INSERT em events.

DROP POLICY IF EXISTS "Public submit event images" ON storage.objects;
CREATE POLICY "Public submit event images"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'public-submissions'
);

DROP POLICY IF EXISTS "Public read event-images" ON storage.objects;
CREATE POLICY "Public read event-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Idempotente com 20261017210000 (produção pode não ter aplicado ainda).
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
