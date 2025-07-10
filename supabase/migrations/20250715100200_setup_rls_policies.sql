
-- Fase 3: Implementação da Lógica de Permissões (Row Level Security)
-- Este script define as políticas de RLS para as tabelas de conteúdo.

-- Habilitar RLS em tabelas que ainda não têm (precaução)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para a tabela `user_roles`
-- Apenas admins podem gerenciar papéis para evitar elevação de privilégio não autorizada.
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    (get_my_claim('user_role') ->> 'role' IN ('admin', 'tech'))
  ) WITH CHECK (
    (get_my_claim('user_role') ->> 'role' IN ('admin', 'tech'))
  );
-- Permite que usuários vejam seu próprio papel.
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);


-- 2. Políticas para `regions` e `cities`
-- São dados públicos, todos podem ver. Apenas admins podem modificar.
CREATE POLICY "Regions and cities are public" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Regions and cities are public" ON public.cities FOR SELECT USING (true);

CREATE POLICY "Admins can manage regions" ON public.regions FOR ALL
  USING ((get_my_claim('user_role') ->> 'role' IN ('admin', 'tech')));
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL
  USING ((get_my_claim('user_role') ->> 'role' IN ('admin', 'tech')));


-- 3. Políticas para Tabelas de Conteúdo (`destinations`, `events`, `routes`)

-- Função auxiliar para extrair o papel do usuário logado a partir dos claims do JWT.
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT COALESCE(
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
        'user'
    ) INTO user_role;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função auxiliar para obter o city_id associado ao usuário
CREATE OR REPLACE FUNCTION get_current_user_city_id()
RETURNS UUID AS $$
DECLARE
    city_uuid UUID;
BEGIN
    SELECT city_id INTO city_uuid FROM public.user_roles WHERE user_id = auth.uid() AND city_id IS NOT NULL LIMIT 1;
    RETURN city_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função auxiliar para obter o region_id associado ao usuário
CREATE OR REPLACE FUNCTION get_current_user_region_id()
RETURNS UUID AS $$
DECLARE
    region_uuid UUID;
BEGIN
    SELECT region_id INTO region_uuid FROM public.user_roles WHERE user_id = auth.uid() AND region_id IS NOT NULL LIMIT 1;
    RETURN region_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpa políticas antigas antes de aplicar as novas
DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations;
DROP POLICY IF EXISTS "Destinations are publicly readable" ON public.destinations;

-- Políticas para `destinations`
CREATE POLICY "Destinations are visible to everyone" ON public.destinations FOR SELECT USING (true);

CREATE POLICY "Content managers can create destinations for their city" ON public.destinations
  FOR INSERT WITH CHECK (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );

CREATE POLICY "Content managers can update/delete their own city's destinations" ON public.destinations
  FOR UPDATE USING (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );

-- Políticas para `events`
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;

CREATE POLICY "Events are visible to everyone" ON public.events FOR SELECT USING (true);

CREATE POLICY "Content managers can create events for their city" ON public.events
  FOR INSERT WITH CHECK (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );

CREATE POLICY "Content managers can update/delete their own city's events" ON public.events
  FOR UPDATE USING (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );


-- Políticas para `routes`
DROP POLICY IF EXISTS "Admins can manage routes" ON public.routes;
DROP POLICY IF EXISTS "Routes are publicly readable" ON public.routes;

CREATE POLICY "Routes are visible to everyone" ON public.routes FOR SELECT USING (true);

CREATE POLICY "Content managers can create routes for their city" ON public.routes
  FOR INSERT WITH CHECK (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );

CREATE POLICY "Content managers can update/delete their own city's routes" ON public.routes
  FOR UPDATE USING (
    get_current_user_role() IN ('gestor_municipal', 'atendente') AND
    city_id = get_current_user_city_id()
  );

-- Política geral para admins e diretores terem controle total (simplifica as regras acima)
-- Esta política será combinada com as outras.
CREATE POLICY "Admins and Directors have full access" ON public.destinations
  FOR ALL USING (get_current_user_role() IN ('admin', 'tech', 'diretor_estadual'));
CREATE POLICY "Admins and Directors have full access" ON public.events
  FOR ALL USING (get_current_user_role() IN ('admin', 'tech', 'diretor_estadual'));
CREATE POLICY "Admins and Directors have full access" ON public.routes
  FOR ALL USING (get_current_user_role() IN ('admin', 'tech', 'diretor_estadual')); 