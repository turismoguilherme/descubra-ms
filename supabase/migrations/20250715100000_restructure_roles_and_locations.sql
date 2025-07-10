
-- Fase 1: Reestruturação do Banco de Dados
-- Este script prepara o banco de dados para a nova hierarquia de papéis e localidades.

-- 1. Cria a tabela de Regiões Turísticas (IGRs)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.regions IS 'Tabela para armazenar as regiões turísticas (Instâncias de Governança Regional - IGR).';

-- 2. Cria a tabela de Cidades e a associa às regiões
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.cities IS 'Tabela para os municípios do estado, cada um associado a uma região turística.';
CREATE INDEX IF NOT EXISTS idx_cities_region_id ON public.cities(region_id);

-- 3. Altera a tabela user_roles para adicionar associação de localidade
-- Adiciona colunas para vincular um papel a uma região ou cidade específica.
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_roles.region_id IS 'Associa o papel a uma região específica (para Gestores de IGR).';
COMMENT ON COLUMN public.user_roles.city_id IS 'Associa o papel a uma cidade específica (para Gestores Municipais e Atendentes).';

-- 4. Atualiza os papéis de usuário permitidos no sistema
-- Remove a antiga restrição CHECK para adicionar uma nova com os papéis atualizados.
-- NOTA: O nome da constraint ('user_roles_role_check') é um padrão comum, mas pode variar.
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check CHECK (
    role IN (
        'admin',
        'tech',
        'diretor_estadual',
        'gestor_igr',
        'gestor_municipal',
        'atendente',
        'user'
    )
);

-- 5. Adiciona a associação de cidade às tabelas de conteúdo
ALTER TABLE public.destinations
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_destinations_city_id ON public.destinations(city_id);

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_city_id ON public.events(city_id);

ALTER TABLE public.routes
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_routes_city_id ON public.routes(city_id);

COMMENT ON COLUMN public.destinations.city_id IS 'Define a qual cidade este destino pertence.';
COMMENT ON COLUMN public.events.city_id IS 'Define em qual cidade este evento ocorre.';
COMMENT ON COLUMN public.routes.city_id IS 'Define em qual cidade esta rota está localizada (ou onde começa).';

-- Adiciona triggers para atualizar o campo 'updated_at' nas novas tabelas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 