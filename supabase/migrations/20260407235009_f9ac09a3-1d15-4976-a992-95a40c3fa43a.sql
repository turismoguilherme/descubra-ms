
-- Adicionar colunas faltantes na tabela events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sponsor_payment_status text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS stripe_payment_link_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS return_domain text;

-- Atualizar RLS de institutional_content para incluir master_admin
DROP POLICY IF EXISTS "Admins can manage institutional content" ON public.institutional_content;
CREATE POLICY "Admins can manage institutional content"
ON public.institutional_content
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'master_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'master_admin')
  )
);

-- Atualizar RLS de site_settings para incluir master_admin
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'master_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'master_admin')
  )
);
