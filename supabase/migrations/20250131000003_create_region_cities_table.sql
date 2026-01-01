-- Migration: Criar tabela region_cities para informações específicas de cada cidade
-- Descrição: Permite que cada cidade da região turística tenha suas próprias informações, galeria de fotos e atrativos

CREATE TABLE IF NOT EXISTS public.region_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_region_id UUID NOT NULL REFERENCES public.tourist_regions(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  description TEXT,
  image_gallery TEXT[] DEFAULT ARRAY[]::TEXT[], -- Galeria de fotos específica da cidade
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[], -- Atrativos específicos da cidade
  contact_phone TEXT,
  contact_email TEXT,
  official_website TEXT,
  social_links JSONB, -- {instagram, facebook, youtube}
  map_image_url TEXT, -- Imagem do mapa específico da cidade (opcional)
  order_index INTEGER DEFAULT 0, -- Ordem de exibição
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraint para evitar cidades duplicadas na mesma região
  UNIQUE(tourist_region_id, city_name)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_region_cities_tourist_region_id ON public.region_cities(tourist_region_id);
CREATE INDEX IF NOT EXISTS idx_region_cities_city_name ON public.region_cities(city_name);
CREATE INDEX IF NOT EXISTS idx_region_cities_is_active ON public.region_cities(is_active);
CREATE INDEX IF NOT EXISTS idx_region_cities_order_index ON public.region_cities(order_index);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_region_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_region_cities_updated_at
  BEFORE UPDATE ON public.region_cities
  FOR EACH ROW
  EXECUTE FUNCTION update_region_cities_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.region_cities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Leitura pública
CREATE POLICY "Public can view active region cities"
  ON public.region_cities FOR SELECT
  USING (is_active = true);

-- Inserção/atualização apenas para usuários autenticados (admin)
CREATE POLICY "Authenticated users can manage region cities"
  ON public.region_cities FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE public.region_cities IS 'Informações específicas de cada cidade dentro de uma região turística';
COMMENT ON COLUMN public.region_cities.city_name IS 'Nome da cidade (deve corresponder ao nome no array cities da tabela tourist_regions)';
COMMENT ON COLUMN public.region_cities.image_gallery IS 'Array de URLs de imagens específicas da cidade';
COMMENT ON COLUMN public.region_cities.highlights IS 'Array de atrativos específicos da cidade';
COMMENT ON COLUMN public.region_cities.social_links IS 'Links de redes sociais em formato JSON: {instagram, facebook, youtube}';

