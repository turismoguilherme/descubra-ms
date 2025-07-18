
-- Criar tabela para estados/clientes (multi-tenant)
CREATE TABLE public.states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#1E40AF',
  secondary_color text DEFAULT '#06B6D4',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir Mato Grosso do Sul como primeiro estado
INSERT INTO public.states (name, code, logo_url, primary_color, secondary_color) 
VALUES (
  'Mato Grosso do Sul',
  'MS',
  '/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png',
  '#1E40AF',
  '#06B6D4'
);

-- Adicionar state_id nas tabelas principais (começando com as mais importantes)
ALTER TABLE public.destinations ADD COLUMN state_id uuid REFERENCES public.states(id);
ALTER TABLE public.events ADD COLUMN state_id uuid REFERENCES public.events(id);
ALTER TABLE public.routes ADD COLUMN state_id uuid REFERENCES public.states(id);
ALTER TABLE public.passport_stamps ADD COLUMN state_id uuid REFERENCES public.states(id);

-- Atualizar dados existentes para apontar para MS
UPDATE public.destinations SET state_id = (SELECT id FROM public.states WHERE code = 'MS') WHERE state_id IS NULL;
UPDATE public.events SET state_id = (SELECT id FROM public.states WHERE code = 'MS') WHERE state_id IS NULL;
UPDATE public.routes SET state_id = (SELECT id FROM public.states WHERE code = 'MS') WHERE state_id IS NULL;
UPDATE public.passport_stamps SET state_id = (SELECT id FROM public.states WHERE code = 'MS') WHERE state_id IS NULL;

-- Expandir passport_stamps com sistema de pontos
ALTER TABLE public.passport_stamps ADD COLUMN points_earned integer DEFAULT 10;
ALTER TABLE public.passport_stamps ADD COLUMN activity_type text DEFAULT 'check_in';

-- Criar tabela para níveis de usuário (gamificação)
CREATE TABLE public.user_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  state_id uuid REFERENCES public.states(id),
  total_points integer DEFAULT 0,
  current_level text DEFAULT 'Iniciante',
  level_number integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, state_id)
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para states (público para leitura)
CREATE POLICY "States are publicly readable" 
ON public.states FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage states" 
ON public.states FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- Políticas RLS para user_levels
CREATE POLICY "Users can view own levels" 
ON public.user_levels FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own levels" 
ON public.user_levels FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own levels" 
ON public.user_levels FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para atualizar pontos do usuário
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id uuid,
  p_state_id uuid,
  p_points integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_total integer := 0;
  new_level text;
  new_level_number integer;
BEGIN
  -- Buscar pontos atuais
  SELECT total_points INTO current_total 
  FROM public.user_levels 
  WHERE user_id = p_user_id AND state_id = p_state_id;
  
  -- Se não existe registro, criar
  IF current_total IS NULL THEN
    current_total := 0;
    INSERT INTO public.user_levels (user_id, state_id, total_points)
    VALUES (p_user_id, p_state_id, p_points);
  ELSE
    -- Atualizar pontos
    current_total := current_total + p_points;
    
    -- Determinar novo nível
    CASE 
      WHEN current_total >= 2000 THEN 
        new_level := 'Mestre';
        new_level_number := 5;
      WHEN current_total >= 1001 THEN 
        new_level := 'Aventureiro';
        new_level_number := 4;
      WHEN current_total >= 501 THEN 
        new_level := 'Viajante';
        new_level_number := 3;
      WHEN current_total >= 101 THEN 
        new_level := 'Explorador';
        new_level_number := 2;
      ELSE 
        new_level := 'Iniciante';
        new_level_number := 1;
    END CASE;
    
    UPDATE public.user_levels 
    SET 
      total_points = current_total,
      current_level = new_level,
      level_number = new_level_number,
      updated_at = now()
    WHERE user_id = p_user_id AND state_id = p_state_id;
  END IF;
END;
$$;
