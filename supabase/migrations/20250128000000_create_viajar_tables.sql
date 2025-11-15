-- Migration: Criar tabelas para funcionalidades ViaJAR
-- Data: 2025-01-28
-- Descrição: Tabelas para persistência de dados do setor privado e CATs

-- ============================================
-- SETOR PRIVADO - DIAGNÓSTICOS
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Respostas do questionário
  answers JSONB NOT NULL,
  
  -- Resultados da análise
  analysis_result JSONB,
  
  -- Métricas calculadas
  overall_score DECIMAL(5, 2),
  estimated_roi DECIMAL(5, 2),
  recommendations_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'archived')),
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETOR PRIVADO - DOCUMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações do arquivo
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Caminho no Supabase Storage
  file_size BIGINT,
  file_type TEXT,
  mime_type TEXT,
  
  -- Metadados
  title TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  
  -- Análise (quando disponível)
  analysis_result JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETOR PRIVADO - REVENUE OPTIMIZER
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_revenue_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da otimização
  date DATE NOT NULL,
  current_price DECIMAL(10, 2),
  suggested_price DECIMAL(10, 2),
  occupancy_rate DECIMAL(5, 2),
  
  -- Resultados
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  actual_revenue DECIMAL(10, 2),
  
  -- Metadados
  factors JSONB, -- Demanda, sazonalidade, competição
  notes TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETOR PRIVADO - MARKET INTELLIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados de mercado
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Origem dos turistas
  tourist_origins JSONB, -- { "SP": 45, "PR": 30, ... }
  
  -- Perfil demográfico
  demographic_profile JSONB, -- Idade, renda, transporte, etc.
  
  -- ROI de marketing
  marketing_roi JSONB, -- { "email": 7.5, "google_ads": 6.0, ... }
  
  -- Insights
  insights TEXT[],
  recommendations TEXT[],
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETOR PRIVADO - COMPETITIVE BENCHMARK
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_competitive_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Período da comparação
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métricas comparativas
  occupancy_rate DECIMAL(5, 2),
  market_occupancy_rate DECIMAL(5, 2),
  
  average_price DECIMAL(10, 2),
  market_average_price DECIMAL(10, 2),
  
  rating DECIMAL(3, 2),
  market_rating DECIMAL(3, 2),
  
  average_stay_days DECIMAL(4, 2),
  market_average_stay_days DECIMAL(4, 2),
  
  -- Comparação com concorrentes
  competitors_data JSONB, -- Array de dados anonimizados
  
  -- Insights
  gaps JSONB, -- Oportunidades identificadas
  recommendations TEXT[],
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETOR PRIVADO - RELATÓRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS viajar_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações do relatório
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('executive', 'market', 'financial', 'custom')),
  
  -- Arquivo gerado
  file_path TEXT, -- Caminho no Supabase Storage
  file_format TEXT DEFAULT 'pdf' CHECK (file_format IN ('pdf', 'excel', 'csv')),
  
  -- Parâmetros do relatório
  parameters JSONB, -- Período, filtros, etc.
  
  -- Agendamento
  scheduled BOOLEAN DEFAULT false,
  schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly')),
  next_generation_date DATE,
  
  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
  generated_at TIMESTAMPTZ,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATs - TURISTAS
-- ============================================

CREATE TABLE IF NOT EXISTS cat_tourists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID, -- Referência ao CAT (pode ser string também)
  attendant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dados do turista
  name TEXT,
  origin_country TEXT,
  origin_state TEXT,
  origin_city TEXT,
  
  -- Informações de contato (opcional)
  email TEXT,
  phone TEXT,
  
  -- Dados da visita
  visit_date DATE DEFAULT CURRENT_DATE,
  visit_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Interesses
  interests TEXT[],
  questions_asked TEXT[],
  
  -- Avaliação
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATs - REGISTROS DE ATENDIMENTO
-- ============================================

CREATE TABLE IF NOT EXISTS cat_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_id UUID, -- Referência ao CAT
  tourist_id UUID REFERENCES cat_tourists(id) ON DELETE SET NULL,
  
  -- Dados do atendimento
  attendance_date DATE DEFAULT CURRENT_DATE,
  attendance_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tipo de atendimento
  service_type TEXT CHECK (service_type IN ('information', 'guidance', 'emergency', 'translation', 'other')),
  
  -- Detalhes
  topic TEXT,
  duration_minutes INTEGER,
  language TEXT DEFAULT 'pt-BR',
  
  -- Resultado
  resolved BOOLEAN DEFAULT true,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  notes TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATs - CONVERSAS COM IA
-- ============================================

CREATE TABLE IF NOT EXISTS cat_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cat_id UUID,
  tourist_id UUID REFERENCES cat_tourists(id) ON DELETE SET NULL,
  
  -- Dados da conversa
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Categoria e contexto
  category TEXT,
  context JSONB,
  
  -- Qualidade da resposta
  confidence_score DECIMAL(3, 2),
  sources JSONB, -- Fontes utilizadas
  
  -- Feedback
  was_helpful BOOLEAN,
  feedback TEXT,
  
  -- Idioma
  language TEXT DEFAULT 'pt-BR',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATs - TRADUÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS cat_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cat_id UUID,
  tourist_id UUID REFERENCES cat_tourists(id) ON DELETE SET NULL,
  
  -- Dados da tradução
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  
  -- Contexto
  context TEXT,
  category TEXT,
  
  -- Qualidade
  confidence_score DECIMAL(3, 2),
  translation_provider TEXT DEFAULT 'mock' CHECK (translation_provider IN ('google', 'mock')),
  
  -- Feedback
  was_accurate BOOLEAN,
  feedback TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para viajar_diagnostic_results
CREATE INDEX IF NOT EXISTS idx_diagnostic_user_id ON viajar_diagnostic_results(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_created_at ON viajar_diagnostic_results(created_at DESC);

-- Índices para viajar_documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON viajar_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON viajar_documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON viajar_documents(created_at DESC);

-- Índices para viajar_revenue_optimizations
CREATE INDEX IF NOT EXISTS idx_revenue_user_id ON viajar_revenue_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON viajar_revenue_optimizations(date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_applied ON viajar_revenue_optimizations(applied);

-- Índices para viajar_market_intelligence
CREATE INDEX IF NOT EXISTS idx_market_user_id ON viajar_market_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_market_period ON viajar_market_intelligence(period_start, period_end);

-- Índices para viajar_competitive_benchmarks
CREATE INDEX IF NOT EXISTS idx_benchmark_user_id ON viajar_competitive_benchmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_period ON viajar_competitive_benchmarks(period_start, period_end);

-- Índices para viajar_reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON viajar_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON viajar_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON viajar_reports(created_at DESC);

-- Índices para cat_tourists
CREATE INDEX IF NOT EXISTS idx_tourists_cat_id ON cat_tourists(cat_id);
CREATE INDEX IF NOT EXISTS idx_tourists_attendant_id ON cat_tourists(attendant_id);
CREATE INDEX IF NOT EXISTS idx_tourists_visit_date ON cat_tourists(visit_date DESC);

-- Índices para cat_attendance_records
CREATE INDEX IF NOT EXISTS idx_attendance_attendant_id ON cat_attendance_records(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_cat_id ON cat_attendance_records(cat_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tourist_id ON cat_attendance_records(tourist_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON cat_attendance_records(attendance_date DESC);

-- Índices para cat_ai_conversations
CREATE INDEX IF NOT EXISTS idx_conversations_attendant_id ON cat_ai_conversations(attendant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON cat_ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON cat_ai_conversations(created_at DESC);

-- Índices para cat_translations
CREATE INDEX IF NOT EXISTS idx_translations_attendant_id ON cat_translations(attendant_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON cat_translations(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE viajar_diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajar_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajar_revenue_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajar_market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajar_competitive_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajar_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_tourists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_translations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários só veem seus próprios dados (setor privado)
CREATE POLICY "Users can view own diagnostic results"
  ON viajar_diagnostic_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic results"
  ON viajar_diagnostic_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic results"
  ON viajar_diagnostic_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents"
  ON viajar_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON viajar_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON viajar_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON viajar_documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own revenue optimizations"
  ON viajar_revenue_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revenue optimizations"
  ON viajar_revenue_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own market intelligence"
  ON viajar_market_intelligence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own market intelligence"
  ON viajar_market_intelligence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own benchmarks"
  ON viajar_competitive_benchmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own benchmarks"
  ON viajar_competitive_benchmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports"
  ON viajar_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON viajar_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: Atendentes veem dados do seu CAT
CREATE POLICY "Attendants can view tourists from their CAT"
  ON cat_tourists FOR SELECT
  USING (
    auth.uid() = attendant_id OR
    EXISTS (
      SELECT 1 FROM cat_attendance_records
      WHERE cat_attendance_records.tourist_id = cat_tourists.id
      AND cat_attendance_records.attendant_id = auth.uid()
    )
  );

CREATE POLICY "Attendants can insert tourists"
  ON cat_tourists FOR INSERT
  WITH CHECK (auth.uid() = attendant_id);

CREATE POLICY "Attendants can update their tourists"
  ON cat_tourists FOR UPDATE
  USING (auth.uid() = attendant_id);

CREATE POLICY "Attendants can view their attendance records"
  ON cat_attendance_records FOR SELECT
  USING (auth.uid() = attendant_id);

CREATE POLICY "Attendants can insert their attendance records"
  ON cat_attendance_records FOR INSERT
  WITH CHECK (auth.uid() = attendant_id);

CREATE POLICY "Attendants can view their conversations"
  ON cat_ai_conversations FOR SELECT
  USING (auth.uid() = attendant_id OR attendant_id IS NULL);

CREATE POLICY "Attendants can insert their conversations"
  ON cat_ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = attendant_id OR attendant_id IS NULL);

CREATE POLICY "Attendants can view their translations"
  ON cat_translations FOR SELECT
  USING (auth.uid() = attendant_id OR attendant_id IS NULL);

CREATE POLICY "Attendants can insert their translations"
  ON cat_translations FOR INSERT
  WITH CHECK (auth.uid() = attendant_id OR attendant_id IS NULL);

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_viajar_diagnostic_results_updated_at
  BEFORE UPDATE ON viajar_diagnostic_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajar_documents_updated_at
  BEFORE UPDATE ON viajar_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajar_revenue_optimizations_updated_at
  BEFORE UPDATE ON viajar_revenue_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajar_market_intelligence_updated_at
  BEFORE UPDATE ON viajar_market_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajar_competitive_benchmarks_updated_at
  BEFORE UPDATE ON viajar_competitive_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajar_reports_updated_at
  BEFORE UPDATE ON viajar_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cat_tourists_updated_at
  BEFORE UPDATE ON cat_tourists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cat_attendance_records_updated_at
  BEFORE UPDATE ON cat_attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


