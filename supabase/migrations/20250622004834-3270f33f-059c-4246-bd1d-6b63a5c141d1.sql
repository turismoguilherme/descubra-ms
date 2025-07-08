
-- Criar tabela cat_ai_queries para o sistema de IA do CAT
CREATE TABLE public.cat_ai_queries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id uuid NOT NULL,
  attendant_name text NOT NULL,
  cat_location text,
  question text NOT NULL,
  response text NOT NULL,
  response_source text,
  feedback_useful boolean,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela cat_frequent_questions
CREATE TABLE public.cat_frequent_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_pattern text NOT NULL,
  suggested_response text NOT NULL,
  frequency_count integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar coluna wants_to_collaborate na tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS wants_to_collaborate boolean DEFAULT false;

-- Ativar RLS nas novas tabelas
ALTER TABLE public.cat_ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_frequent_questions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cat_ai_queries
CREATE POLICY "Users can view their own queries" 
  ON public.cat_ai_queries 
  FOR SELECT 
  USING (auth.uid() = attendant_id);

CREATE POLICY "Users can create their own queries" 
  ON public.cat_ai_queries 
  FOR INSERT 
  WITH CHECK (auth.uid() = attendant_id);

CREATE POLICY "Users can update their own queries" 
  ON public.cat_ai_queries 
  FOR UPDATE 
  USING (auth.uid() = attendant_id);

-- Políticas RLS para cat_frequent_questions (apenas leitura para usuários autenticados)
CREATE POLICY "Authenticated users can view frequent questions" 
  ON public.cat_frequent_questions 
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

-- Políticas RLS para user_route_checkins (CRÍTICA - estava faltando)
ALTER TABLE public.user_route_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkins" 
  ON public.user_route_checkins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
  ON public.user_route_checkins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para institutional_partners
ALTER TABLE public.institutional_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved partners" 
  ON public.institutional_partners 
  FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Anyone can submit partner requests" 
  ON public.institutional_partners 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas RLS para tourism_intelligence_documents
ALTER TABLE public.tourism_intelligence_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage intelligence documents" 
  ON public.tourism_intelligence_documents 
  FOR ALL 
  USING (public.is_admin_or_tech(auth.uid()));
