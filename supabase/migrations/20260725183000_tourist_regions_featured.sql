-- Destaque de regiões turísticas na página Destinos

ALTER TABLE public.tourist_regions
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.tourist_regions.is_featured IS
  'Quando true, a região aparece primeiro / com selo de destaque em Destinos.';

CREATE INDEX IF NOT EXISTS idx_tourist_regions_featured_order
  ON public.tourist_regions (is_active, is_featured DESC, order_index ASC, name ASC);
