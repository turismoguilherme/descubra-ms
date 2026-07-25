-- Cartilhas Guatá Capacita (catálogo público + progresso na nuvem)

CREATE TABLE IF NOT EXISTS public.guata_cartilhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  audience TEXT,
  theme TEXT NOT NULL DEFAULT 'pantanal',
  cover_url TEXT,
  html_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'coming_soon')),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guata_cartilha_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cartilha_id UUID NOT NULL REFERENCES public.guata_cartilhas(id) ON DELETE CASCADE,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cartilha_id)
);

ALTER TABLE public.guata_cartilhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guata_cartilha_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guata_cartilhas_public_read"
ON public.guata_cartilhas FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "guata_cartilhas_admin_read_all"
ON public.guata_cartilhas FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_cartilhas_admin_insert"
ON public.guata_cartilhas FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_cartilhas_admin_update"
ON public.guata_cartilhas FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_cartilhas_admin_delete"
ON public.guata_cartilhas FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_cartilha_progress_select_own"
ON public.guata_cartilha_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "guata_cartilha_progress_insert_own"
ON public.guata_cartilha_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guata_cartilha_progress_update_own"
ON public.guata_cartilha_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guata_cartilha_progress_delete_own"
ON public.guata_cartilha_progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_guata_cartilhas_active_order
  ON public.guata_cartilhas (is_active, is_featured, display_order);

CREATE INDEX IF NOT EXISTS idx_guata_cartilha_progress_user
  ON public.guata_cartilha_progress (user_id, cartilha_id);

DROP TRIGGER IF EXISTS guata_cartilhas_set_updated_at ON public.guata_cartilhas;
CREATE TRIGGER guata_cartilhas_set_updated_at
BEFORE UPDATE ON public.guata_cartilhas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS guata_cartilha_progress_set_updated_at ON public.guata_cartilha_progress;
CREATE TRIGGER guata_cartilha_progress_set_updated_at
BEFORE UPDATE ON public.guata_cartilha_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage público para HTML/capa das cartilhas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guata-cartilhas',
  'guata-cartilhas',
  true,
  10485760,
  ARRAY['text/html', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "guata_cartilhas_storage_public_read" ON storage.objects;
CREATE POLICY "guata_cartilhas_storage_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'guata-cartilhas');

DROP POLICY IF EXISTS "guata_cartilhas_storage_admin_insert" ON storage.objects;
CREATE POLICY "guata_cartilhas_storage_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guata-cartilhas' AND public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "guata_cartilhas_storage_admin_update" ON storage.objects;
CREATE POLICY "guata_cartilhas_storage_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'guata-cartilhas' AND public.is_admin_user(auth.uid()))
WITH CHECK (bucket_id = 'guata-cartilhas' AND public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "guata_cartilhas_storage_admin_delete" ON storage.objects;
CREATE POLICY "guata_cartilhas_storage_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guata-cartilhas' AND public.is_admin_user(auth.uid()));

-- Seed inicial (home)
INSERT INTO public.guata_cartilhas (
  slug, title, subtitle, audience, theme, html_url, is_featured, is_active, status, display_order
) VALUES
(
  'guata-capacita',
  'Guatá Capacita',
  'Plano de Capacitação Prática para Atendentes dos Centros de Atendimento ao Turista (CATs)',
  'Atendentes de CAT',
  'pantanal',
  '/cartilhas/guata-capacita/index.html',
  true,
  true,
  'available',
  0
),
(
  'sabores-de-ms',
  'Sabores de MS',
  'Guia de Boas Práticas e Hospitalidade no Atendimento em Bares e Restaurantes',
  'Gastronomia',
  'terracotta',
  NULL,
  true,
  true,
  'coming_soon',
  1
),
(
  'hotelaria-ms',
  'Recepção de Hotelaria MS',
  'Qualificação em Recepção e Hospitalidade para Pousadas e Hotéis',
  'Hotelaria',
  'blue',
  NULL,
  true,
  true,
  'coming_soon',
  2
)
ON CONFLICT (slug) DO NOTHING;
