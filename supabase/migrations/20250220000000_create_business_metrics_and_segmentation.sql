-- Migration: Criar tabela business_metrics e campos de segmentação
-- Data: 2025-02-20
-- Descrição: Tabela para métricas de negócios e campos para segmentação por business_category

-- ============================================
-- ADICIONAR CAMPOS EM user_profiles
-- ============================================

-- Adicionar business_category se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'business_category'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN business_category TEXT 
    CHECK (business_category IN ('hotel', 'pousada', 'hostel', 'atrativo', 'restaurante', 'bar', 'agencia', 'outro'));
    
    COMMENT ON COLUMN public.user_profiles.business_category IS 'Categoria do negócio para segmentação do dashboard';
  END IF;
END $$;

-- Adicionar city_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN public.user_profiles.city_id IS 'ID da cidade do usuário (obrigatório para cálculos de IA)';
  END IF;
END $$;

-- ============================================
-- CRIAR TABELA business_metrics
-- ============================================

CREATE TABLE IF NOT EXISTS public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Data da métrica
  metric_date DATE NOT NULL,
  
  -- Tipo de métrica
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'occupancy',      -- Taxa de ocupação (%)
    'revenue',        -- Receita (R$)
    'visitors',       -- Número de visitantes
    'ticket_avg',     -- Ticket médio (R$)
    'table_turnover', -- Giro de mesa (vezes/dia)
    'pax',            -- Passageiros (agências)
    'adr',            -- Average Daily Rate (R$)
    'revpar'          -- Revenue per Available Room (R$)
  )),
  
  -- Valor da métrica
  value NUMERIC(12, 2) NOT NULL,
  
  -- Origem dos dados
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'document_upload', 'api', 'channel_manager')),
  
  -- Referência ao documento (se veio de upload)
  document_id UUID REFERENCES public.viajar_documents(id) ON DELETE SET NULL,
  
  -- Metadados adicionais (JSONB para flexibilidade)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: uma métrica por tipo por data por usuário
  UNIQUE(user_id, metric_date, metric_type)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice composto para buscas por usuário e data
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_date 
ON public.business_metrics(user_id, metric_date DESC);

-- Índice para buscas por tipo de métrica
CREATE INDEX IF NOT EXISTS idx_business_metrics_type 
ON public.business_metrics(metric_type);

-- Índice para agregações por cidade (via user_profiles)
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_city 
ON public.business_metrics(user_id);

-- Índice para buscas por documento
CREATE INDEX IF NOT EXISTS idx_business_metrics_document 
ON public.business_metrics(document_id) 
WHERE document_id IS NOT NULL;

-- Índice para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_category 
ON public.user_profiles(business_category) 
WHERE business_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_city_id 
ON public.user_profiles(city_id) 
WHERE city_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias métricas
CREATE POLICY "Users can view own metrics" 
ON public.business_metrics
FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias métricas
CREATE POLICY "Users can insert own metrics" 
ON public.business_metrics
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias métricas
CREATE POLICY "Users can update own metrics" 
ON public.business_metrics
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias métricas
CREATE POLICY "Users can delete own metrics" 
ON public.business_metrics
FOR DELETE 
USING (auth.uid() = user_id);

-- Política especial: Gestores municipais podem ver métricas agregadas da sua cidade
-- (será implementada via função que agrega dados anonimizados)
-- Por enquanto, apenas o próprio usuário vê seus dados

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_business_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_business_metrics_updated_at_trigger ON public.business_metrics;
CREATE TRIGGER update_business_metrics_updated_at_trigger
  BEFORE UPDATE ON public.business_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_business_metrics_updated_at();

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE public.business_metrics IS 'Métricas de negócios coletadas manualmente ou via upload de documentos';
COMMENT ON COLUMN public.business_metrics.metric_type IS 'Tipo de métrica: occupancy, revenue, visitors, ticket_avg, table_turnover, pax, adr, revpar';
COMMENT ON COLUMN public.business_metrics.source IS 'Origem dos dados: manual (inserido pelo usuário), document_upload (extraído de documento), api (integração externa), channel_manager (PMS)';
COMMENT ON COLUMN public.business_metrics.metadata IS 'Metadados adicionais em formato JSON (ex: {"period": "morning", "capacity": 50})';

