
-- 1. Fix partner_transactions admin policy (privilege escalation via raw_user_meta_data)
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.partner_transactions;
CREATE POLICY "Admins can view all transactions"
ON public.partner_transactions
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- 2. Fix reservation_messages admin policy
DROP POLICY IF EXISTS "Admins can view all messages" ON public.reservation_messages;
CREATE POLICY "Admins can view all messages"
ON public.reservation_messages
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- 3. Restrict anonymous uploads to event-images and tourism-images buckets
DROP POLICY IF EXISTS "Permitir upload público de imagens de eventos" ON storage.objects;
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Permitir upload público de imagens de turismo" ON storage.objects;
CREATE POLICY "Authenticated users can upload tourism images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tourism-images');

-- 4. Scope user-uploads bucket reads to owner folder
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Users can read own user-uploads files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. Fix koda_response_cache individual policy
DROP POLICY IF EXISTS "Users can read own individual cache" ON public.koda_response_cache;
CREATE POLICY "Users can read own individual cache"
ON public.koda_response_cache
FOR SELECT
TO authenticated
USING (
  cache_type = 'individual' AND auth.uid() = user_id
);

-- 6. Remove regional manager SELECT on ai_consultant_config (exposes encrypted Gemini key)
-- Regional managers must use the ai_consultant_config_safe view (which excludes the key column)
DROP POLICY IF EXISTS "Regional managers read AI config (cols restricted)" ON public.ai_consultant_config;
