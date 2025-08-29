-- Criar tabela de conquistas/achievements se não existir
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
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

-- Criar tabela de conquistas dos usuários se não existir
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Habilitar RLS na tabela user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias conquistas
CREATE POLICY "Usuários podem ver suas conquistas" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para sistema criar conquistas dos usuários
CREATE POLICY "Sistema pode criar conquistas de usuários" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Melhorar a tabela user_levels se necessário
DO $$ 
BEGIN
  -- Adicionar coluna level_name se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_levels' AND column_name = 'level_name') THEN
    ALTER TABLE public.user_levels ADD COLUMN level_name text;
  END IF;
  
  -- Adicionar coluna points_to_next_level se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_levels' AND column_name = 'points_to_next_level') THEN
    ALTER TABLE public.user_levels ADD COLUMN points_to_next_level integer;
  END IF;
END $$;

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

-- Trigger para atualizar dados do usuário quando ganhar pontos
CREATE OR REPLACE FUNCTION public.update_user_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  user_stats RECORD;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT 
    COUNT(DISTINCT ps.route_id) as total_routes,
    COUNT(ps.id) as total_stamps,
    COUNT(DISTINCT tr.region) as unique_regions,
    NEW.total_points as points
  INTO user_stats
  FROM passport_stamps ps
  LEFT JOIN routes r ON ps.route_id = r.id
  LEFT JOIN tourist_regions tr ON r.region = tr.id
  WHERE ps.user_id = NEW.user_id;

  -- Verificar cada conquista disponível
  FOR achievement_record IN 
    SELECT * FROM achievements WHERE is_active = true
  LOOP
    -- Verificar se usuário já tem essa conquista
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = NEW.user_id AND achievement_id = achievement_record.id
    ) THEN
      -- Verificar critérios específicos
      CASE achievement_record.criteria->>'type'
        WHEN 'checkin_count' THEN
          IF user_stats.total_stamps >= (achievement_record.criteria->>'min_count')::integer THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
          END IF;
        WHEN 'unique_regions' THEN
          IF user_stats.unique_regions >= (achievement_record.criteria->>'min_count')::integer THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
          END IF;
        WHEN 'total_stamps' THEN
          IF user_stats.total_stamps >= (achievement_record.criteria->>'min_count')::integer THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
          END IF;
        WHEN 'all_regions' THEN
          IF user_stats.unique_regions >= 10 THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
          END IF;
      END CASE;
    END IF;
  END LOOP;

  -- Atualizar nível do usuário
  UPDATE user_levels 
  SET 
    level_name = (calculate_user_level(NEW.total_points)->>'name'),
    level_number = (calculate_user_level(NEW.total_points)->>'level')::integer,
    points_to_next_level = (calculate_user_level(NEW.total_points)->>'points_to_next')::integer,
    updated_at = now()
  WHERE user_id = NEW.user_id AND state_id = NEW.state_id;

  RETURN NEW;
END;
$$;

-- Criar trigger para user_levels
DROP TRIGGER IF EXISTS trigger_update_achievements ON user_levels;
CREATE TRIGGER trigger_update_achievements 
  AFTER UPDATE OF total_points ON user_levels
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_achievements();