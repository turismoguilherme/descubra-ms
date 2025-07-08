
-- Criar tabela para armazenar as consultas feitas pelos atendentes
CREATE TABLE public.cat_ai_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attendant_name TEXT NOT NULL,
  cat_location TEXT,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  response_source TEXT, -- ex: "base_conhecimento", "documentos", "api_externa"
  feedback_useful BOOLEAN, -- true = útil, false = não útil, null = sem feedback
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para armazenar perguntas frequentes identificadas
CREATE TABLE public.cat_frequent_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_pattern TEXT NOT NULL,
  suggested_response TEXT,
  frequency_count INTEGER DEFAULT 1,
  category TEXT, -- ex: "atrações", "eventos", "acessibilidade"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.cat_ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_frequent_questions ENABLE ROW LEVEL SECURITY;

-- Políticas para cat_ai_queries
CREATE POLICY "Attendants can view their own queries" 
  ON public.cat_ai_queries 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = attendant_id);

CREATE POLICY "Attendants can insert their own queries" 
  ON public.cat_ai_queries 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = attendant_id);

CREATE POLICY "Attendants can update their own queries feedback" 
  ON public.cat_ai_queries 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = attendant_id);

CREATE POLICY "Managers can view all queries" 
  ON public.cat_ai_queries 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Políticas para cat_frequent_questions
CREATE POLICY "All authenticated users can view frequent questions" 
  ON public.cat_frequent_questions 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Only managers can modify frequent questions" 
  ON public.cat_frequent_questions 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Inserir algumas perguntas frequentes de exemplo
INSERT INTO public.cat_frequent_questions (question_pattern, suggested_response, category) VALUES
('horário funcionamento', 'Consulte os horários de funcionamento específicos de cada atração no app ou entre em contato diretamente.', 'informações'),
('acessibilidade', 'Verifique as opções de acessibilidade disponíveis em cada destino na descrição detalhada.', 'acessibilidade'),
('como chegar', 'Utilize o mapa interativo do app para obter direções e rotas para os destinos.', 'localização'),
('preços ingressos', 'Os preços podem variar. Recomendamos consultar diretamente com o estabelecimento.', 'informações'),
('eventos próximos', 'Consulte a seção de eventos do app para ver as programações atualizadas.', 'eventos');
