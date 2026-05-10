-- Hero/cover image for passport routes (admin upload → RouteHeroSection)

ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.routes.image_url IS 'URL da capa (hero) do roteiro no passaporte digital';
