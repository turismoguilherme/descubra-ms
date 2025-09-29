-- Criar tabela de conquistas/achievements se não existir
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  category text DEFAULT 'general',
  criteria jsonb NOT NULL DEFAULT '{}',
  points_reward integer DEFAULT 0,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Política para achievements serem públicas para visualização
CREATE POLICY "Achievements são públicas para leitura" 
ON public.achievements 
FOR SELECT 
USING (is_active = true);

-- Política para admins gerenciarem achievements
CREATE POLICY "Admins podem gerenciar achievements" 
ON public.achievements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'tech')
  )
);

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  level_data jsonb;
BEGIN
  CASE 
    WHEN points >= 2000 THEN 
      level_data := jsonb_build_object(
        'level', 5,
        'name', 'Mestre',
        'icon', '👑',
        'color', '#8B5CF6',
        'points_to_next', null
      );
    WHEN points >= 1001 THEN 
      level_data := jsonb_build_object(
        'level', 4,
        'name', 'Aventureiro',
        'icon', '⚔️',
        'color', '#F59E0B',
        'points_to_next', 2000 - points
      );
    WHEN points >= 501 THEN 
      level_data := jsonb_build_object(
        'level', 3,
        'name', 'Viajante',
        'icon', '🗺️',
        'color', '#10B981',
        'points_to_next', 1001 - points
      );
    WHEN points >= 101 THEN 
      level_data := jsonb_build_object(
        'level', 2,
        'name', 'Explorador',
        'icon', '🔍',
        'color', '#3B82F6',
        'points_to_next', 501 - points
      );
    ELSE 
      level_data := jsonb_build_object(
        'level', 1,
        'name', 'Iniciante',
        'icon', '🌱',
        'color', '#6B7280',
        'points_to_next', 101 - points
      );
  END CASE;
  
  RETURN level_data;
END;
$$;

-- Inserir conquistas básicas
INSERT INTO public.achievements (name, description, icon, category, criteria, points_reward, rarity) VALUES
  ('Primeira Visita', 'Complete seu primeiro check-in em qualquer roteiro', '🎯', 'beginner', '{"type": "checkin_count", "min_count": 1}', 10, 'common'),
  ('Explorador Regional', 'Visite pelo menos 3 regiões diferentes', '🗺️', 'exploration', '{"type": "unique_regions", "min_count": 3}', 50, 'rare'),
  ('Colecionador', 'Colete 10 carimbos digitais', '📝', 'collection', '{"type": "total_stamps", "min_count": 10}', 25, 'common'),
  ('Aventureiro da Natureza', 'Complete 5 roteiros da categoria natureza', '🌲', 'nature', '{"type": "nature_routes", "min_count": 5}', 75, 'epic'),
  ('Descobridor Cultural', 'Complete 5 roteiros da categoria cultura', '🏛️', 'culture', '{"type": "culture_routes", "min_count": 5}', 75, 'epic'),
  ('Maratonista', 'Complete 5 roteiros em um único dia', '🏃‍♂️', 'special', '{"type": "daily_routes", "min_count": 5}', 100, 'legendary'),
  ('Explorador Completo', 'Visite todas as 10 regiões de MS', '🏆', 'master', '{"type": "all_regions", "min_count": 10}', 200, 'legendary')
ON CONFLICT (name) DO NOTHING;