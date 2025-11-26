-- ============================================================
-- MIGRATION COMBINADA: Plano Diretor de Turismo
-- ============================================================
-- Este arquivo contém todas as migrations do módulo Plano Diretor
-- Execute este arquivo completo no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PARTE 1: TABELAS
-- ============================================================

-- Create main plano diretor documents table
CREATE TABLE IF NOT EXISTS plano_diretor_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    versao VARCHAR(20) NOT NULL DEFAULT '1.0',
    municipio_nome VARCHAR(200) NOT NULL,
    municipio_uf VARCHAR(2) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'aprovado', 'implementacao', 'concluido')),
    criador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    aprovado_por UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create objetivos (objectives) table
CREATE TABLE IF NOT EXISTS plano_diretor_objetivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) CHECK (categoria IN ('crescimento', 'diversificacao', 'infraestrutura', 'sustentabilidade', 'outro')),
    meta NUMERIC,
    unidade VARCHAR(50),
    prazo DATE,
    responsavel_id UUID REFERENCES auth.users(id),
    responsavel_nome VARCHAR(200),
    status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'atrasado', 'cancelado')),
    progresso NUMERIC DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estrategias (strategies) table
CREATE TABLE IF NOT EXISTS plano_diretor_estrategias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    objetivo_id UUID NOT NULL REFERENCES plano_diretor_objetivos(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    investimento NUMERIC DEFAULT 0,
    prazo DATE,
    responsavel_id UUID REFERENCES auth.users(id),
    responsavel_nome VARCHAR(200),
    status VARCHAR(20) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_execucao', 'concluida', 'suspensa', 'cancelada')),
    roi_esperado NUMERIC,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create acoes (actions) table
CREATE TABLE IF NOT EXISTS plano_diretor_acoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    estrategia_id UUID NOT NULL REFERENCES plano_diretor_estrategias(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    investimento NUMERIC DEFAULT 0,
    prazo DATE,
    responsavel_id UUID REFERENCES auth.users(id),
    responsavel_nome VARCHAR(200),
    status VARCHAR(20) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_execucao', 'concluida', 'atrasada', 'cancelada')),
    progresso NUMERIC DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    dependencias UUID[] DEFAULT '{}',
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indicadores (indicators/KPIs) table
CREATE TABLE IF NOT EXISTS plano_diretor_indicadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    objetivo_id UUID REFERENCES plano_diretor_objetivos(id) ON DELETE SET NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    valor_atual NUMERIC,
    meta NUMERIC,
    unidade VARCHAR(50),
    frequencia VARCHAR(20) CHECK (frequencia IN ('diaria', 'semanal', 'mensal', 'trimestral', 'anual')),
    fonte VARCHAR(200),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE,
    atualizacao_automatica BOOLEAN DEFAULT false,
    fonte_dados VARCHAR(100), -- 'inventario', 'cats', 'eventos', 'analytics', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colaboradores (collaborators) table - Sistema flexível
CREATE TABLE IF NOT EXISTS plano_diretor_colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL, -- Para convidados que ainda não têm conta
    nome VARCHAR(200),
    tipo_ator VARCHAR(100), -- Flexível: 'consultor', 'empresario', 'sociedade_civil', 'academia', 'orgao_publico', etc.
    nivel_acesso VARCHAR(20) DEFAULT 'visualizar' CHECK (nivel_acesso IN ('visualizar', 'editar', 'aprovar')),
    permissoes JSONB DEFAULT '{}'::jsonb, -- Permissões granulares customizáveis
    convidado_por UUID NOT NULL REFERENCES auth.users(id),
    data_convite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_aceite TIMESTAMP WITH TIME ZONE,
    token_convite UUID DEFAULT gen_random_uuid(),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plano_diretor_id, usuario_id),
    UNIQUE(plano_diretor_id, email)
);

-- Create comentarios (comments) table
CREATE TABLE IF NOT EXISTS plano_diretor_comentarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    secao VARCHAR(50) NOT NULL, -- 'diagnostico', 'objetivo', 'estrategia', 'acao', 'indicador', 'geral'
    secao_id UUID, -- ID do item específico (objetivo, estratégia, etc.)
    autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    resolvido BOOLEAN DEFAULT false,
    resolvido_por UUID REFERENCES auth.users(id),
    data_resolucao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documentos anexos (attached documents) table
CREATE TABLE IF NOT EXISTS plano_diretor_documentos_anexos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('estudo', 'relatorio', 'apresentacao', 'lei', 'decreto', 'outro')),
    arquivo_url TEXT NOT NULL,
    tamanho_bytes BIGINT,
    versao VARCHAR(20),
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'aprovado', 'arquivado')),
    uploader_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create historico (history/versioning) table
CREATE TABLE IF NOT EXISTS plano_diretor_historico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plano_diretor_id UUID NOT NULL REFERENCES plano_diretor_documents(id) ON DELETE CASCADE,
    versao VARCHAR(20) NOT NULL,
    autor_id UUID NOT NULL REFERENCES auth.users(id),
    tipo_alteracao VARCHAR(50) NOT NULL, -- 'criacao', 'edicao', 'aprovacao', 'comentario', 'publicacao'
    secao VARCHAR(50), -- 'geral', 'objetivo', 'estrategia', 'acao', 'indicador'
    secao_id UUID, -- ID do item alterado
    alteracoes JSONB DEFAULT '{}'::jsonb, -- Detalhes das alterações
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plano_diretor_documents_criador ON plano_diretor_documents(criador_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_documents_municipio ON plano_diretor_documents(municipio_nome, municipio_uf);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_documents_status ON plano_diretor_documents(status);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_objetivos_plano ON plano_diretor_objetivos(plano_diretor_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_estrategias_objetivo ON plano_diretor_estrategias(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_acoes_estrategia ON plano_diretor_acoes(estrategia_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_indicadores_plano ON plano_diretor_indicadores(plano_diretor_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_colaboradores_plano ON plano_diretor_colaboradores(plano_diretor_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_colaboradores_usuario ON plano_diretor_colaboradores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_colaboradores_token ON plano_diretor_colaboradores(token_convite);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_comentarios_plano ON plano_diretor_comentarios(plano_diretor_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_comentarios_secao ON plano_diretor_comentarios(secao, secao_id);
CREATE INDEX IF NOT EXISTS idx_plano_diretor_historico_plano ON plano_diretor_historico(plano_diretor_id);

-- Enable RLS on all tables
ALTER TABLE plano_diretor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_estrategias ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_documentos_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_diretor_historico ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PARTE 2: FUNÇÕES E TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plano_diretor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_plano_diretor_documents_updated_at
    BEFORE UPDATE ON plano_diretor_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_objetivos_updated_at
    BEFORE UPDATE ON plano_diretor_objetivos
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_estrategias_updated_at
    BEFORE UPDATE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_acoes_updated_at
    BEFORE UPDATE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_indicadores_updated_at
    BEFORE UPDATE ON plano_diretor_indicadores
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_colaboradores_updated_at
    BEFORE UPDATE ON plano_diretor_colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_comentarios_updated_at
    BEFORE UPDATE ON plano_diretor_comentarios
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

-- Function to calculate objetivo progress based on estrategias and acoes
CREATE OR REPLACE FUNCTION calculate_objetivo_progress(objetivo_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_estrategias INTEGER;
    concluidas_estrategias INTEGER;
    total_acoes INTEGER;
    concluidas_acoes INTEGER;
    progress_value NUMERIC;
BEGIN
    -- Count total estrategias
    SELECT COUNT(*) INTO total_estrategias
    FROM plano_diretor_estrategias
    WHERE objetivo_id = objetivo_uuid
    AND status != 'cancelada';
    
    -- Count completed estrategias
    SELECT COUNT(*) INTO concluidas_estrategias
    FROM plano_diretor_estrategias
    WHERE objetivo_id = objetivo_uuid
    AND status = 'concluida';
    
    -- Count total acoes
    SELECT COUNT(*) INTO total_acoes
    FROM plano_diretor_acoes a
    JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id
    WHERE e.objetivo_id = objetivo_uuid
    AND a.status != 'cancelada';
    
    -- Count completed acoes
    SELECT COUNT(*) INTO concluidas_acoes
    FROM plano_diretor_acoes a
    JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id
    WHERE e.objetivo_id = objetivo_uuid
    AND a.status = 'concluida';
    
    -- Calculate weighted progress
    IF total_estrategias = 0 AND total_acoes = 0 THEN
        RETURN 0;
    END IF;
    
    IF total_estrategias > 0 AND total_acoes > 0 THEN
        -- Weight: 40% estrategias, 60% acoes
        progress_value := (
            (concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 40) +
            (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 60)
        );
    ELSIF total_estrategias > 0 THEN
        progress_value := (concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 100);
    ELSE
        progress_value := (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 100);
    END IF;
    
    RETURN LEAST(100, GREATEST(0, ROUND(progress_value, 2)));
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate colaborador permissions
CREATE OR REPLACE FUNCTION check_colaborador_permission(
    colaborador_uuid UUID,
    required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    colaborador_record RECORD;
    has_permission BOOLEAN := false;
BEGIN
    SELECT nivel_acesso, permissoes, ativo
    INTO colaborador_record
    FROM plano_diretor_colaboradores
    WHERE id = colaborador_uuid;
    
    IF NOT FOUND OR NOT colaborador_record.ativo THEN
        RETURN false;
    END IF;
    
    -- Check nivel_acesso
    IF required_permission = 'visualizar' THEN
        has_permission := true; -- Everyone can view
    ELSIF required_permission = 'editar' THEN
        has_permission := colaborador_record.nivel_acesso IN ('editar', 'aprovar');
    ELSIF required_permission = 'aprovar' THEN
        has_permission := colaborador_record.nivel_acesso = 'aprovar';
    END IF;
    
    -- Check custom permissions in JSONB
    IF colaborador_record.permissoes ? required_permission THEN
        has_permission := (colaborador_record.permissoes->>required_permission)::boolean;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to create historico entry automatically
CREATE OR REPLACE FUNCTION create_plano_diretor_historico_entry()
RETURNS TRIGGER AS $$
DECLARE
    historico_tipo TEXT;
    historico_secao TEXT;
    historico_secao_id UUID;
    alteracoes_data JSONB;
BEGIN
    -- Determine tipo de alteração
    IF TG_OP = 'INSERT' THEN
        historico_tipo := 'criacao';
    ELSIF TG_OP = 'UPDATE' THEN
        historico_tipo := 'edicao';
    ELSE
        RETURN NULL;
    END IF;
    
    -- Determine secao based on table
    IF TG_TABLE_NAME = 'plano_diretor_documents' THEN
        historico_secao := 'geral';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_objetivos' THEN
        historico_secao := 'objetivo';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN
        historico_secao := 'estrategia';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
        historico_secao := 'acao';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_indicadores' THEN
        historico_secao := 'indicador';
        historico_secao_id := NEW.id;
    ELSE
        RETURN NEW;
    END IF;
    
    -- Build alteracoes JSONB
    IF TG_OP = 'UPDATE' THEN
        alteracoes_data := jsonb_build_object(
            'campo', 'multiple',
            'valor_anterior', to_jsonb(OLD),
            'valor_novo', to_jsonb(NEW)
        );
    ELSE
        alteracoes_data := to_jsonb(NEW);
    END IF;
    
    -- Insert historico entry
    INSERT INTO plano_diretor_historico (
        plano_diretor_id,
        versao,
        autor_id,
        tipo_alteracao,
        secao,
        secao_id,
        alteracoes
    )
    VALUES (
        CASE 
            WHEN TG_TABLE_NAME = 'plano_diretor_documents' THEN NEW.id
            WHEN TG_TABLE_NAME = 'plano_diretor_objetivos' THEN NEW.plano_diretor_id
            WHEN TG_TABLE_NAME = 'plano_diretor_estrategias' THEN NEW.plano_diretor_id
            WHEN TG_TABLE_NAME = 'plano_diretor_acoes' THEN 
                (SELECT plano_diretor_id FROM plano_diretor_estrategias WHERE id = NEW.estrategia_id)
            WHEN TG_TABLE_NAME = 'plano_diretor_indicadores' THEN NEW.plano_diretor_id
        END,
        (SELECT versao FROM plano_diretor_documents WHERE id = CASE 
            WHEN TG_TABLE_NAME = 'plano_diretor_documents' THEN NEW.id
            WHEN TG_TABLE_NAME = 'plano_diretor_objetivos' THEN NEW.plano_diretor_id
            WHEN TG_TABLE_NAME = 'plano_diretor_estrategias' THEN NEW.plano_diretor_id
            WHEN TG_TABLE_NAME = 'plano_diretor_acoes' THEN 
                (SELECT plano_diretor_id FROM plano_diretor_estrategias WHERE id = NEW.estrategia_id)
            WHEN TG_TABLE_NAME = 'plano_diretor_indicadores' THEN NEW.plano_diretor_id
        END),
        COALESCE(
            (SELECT current_setting('request.jwt.claim.user_id', true)::uuid),
            auth.uid()
        ),
        historico_tipo,
        historico_secao,
        historico_secao_id,
        alteracoes_data
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for historico (only on main tables)
CREATE TRIGGER trigger_plano_diretor_documents_historico
    AFTER INSERT OR UPDATE ON plano_diretor_documents
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_objetivos_historico
    AFTER INSERT OR UPDATE ON plano_diretor_objetivos
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_estrategias_historico
    AFTER INSERT OR UPDATE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_acoes_historico
    AFTER INSERT OR UPDATE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_indicadores_historico
    AFTER INSERT OR UPDATE ON plano_diretor_indicadores
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

-- Function to auto-update objetivo progress when estrategias/acoes change
CREATE OR REPLACE FUNCTION auto_update_objetivo_progress()
RETURNS TRIGGER AS $$
DECLARE
    objetivo_uuid UUID;
BEGIN
    -- Get objetivo_id
    IF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN
        objetivo_uuid := NEW.objetivo_id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
        SELECT e.objetivo_id INTO objetivo_uuid
        FROM plano_diretor_estrategias e
        WHERE e.id = NEW.estrategia_id;
    END IF;
    
    IF objetivo_uuid IS NOT NULL THEN
        UPDATE plano_diretor_objetivos
        SET progresso = calculate_objetivo_progress(objetivo_uuid),
            updated_at = NOW()
        WHERE id = objetivo_uuid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update progress
CREATE TRIGGER trigger_auto_update_progress_estrategias
    AFTER INSERT OR UPDATE OR DELETE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_objetivo_progress();

CREATE TRIGGER trigger_auto_update_progress_acoes
    AFTER INSERT OR UPDATE OR DELETE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_objetivo_progress();

-- ============================================================
-- PARTE 3: RLS POLICIES
-- ============================================================

-- Helper function to check if user is creator of plano diretor
CREATE OR REPLACE FUNCTION is_plano_diretor_creator(plano_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM plano_diretor_documents
        WHERE id = plano_id AND criador_id = user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to check if user is colaborador with specific permission
CREATE OR REPLACE FUNCTION is_plano_diretor_colaborador(plano_id UUID, user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    colaborador_record RECORD;
BEGIN
    SELECT nivel_acesso, permissoes, ativo
    INTO colaborador_record
    FROM plano_diretor_colaboradores
    WHERE plano_diretor_id = plano_id
    AND (usuario_id = user_id OR email = (SELECT email FROM auth.users WHERE id = user_id))
    AND ativo = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check nivel_acesso
    IF required_permission = 'visualizar' THEN
        RETURN true;
    ELSIF required_permission = 'editar' THEN
        RETURN colaborador_record.nivel_acesso IN ('editar', 'aprovar');
    ELSIF required_permission = 'aprovar' THEN
        RETURN colaborador_record.nivel_acesso = 'aprovar';
    END IF;
    
    -- Check custom permissions
    IF colaborador_record.permissoes ? required_permission THEN
        RETURN (colaborador_record.permissoes->>required_permission)::boolean;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to check if user has access (creator or colaborador)
CREATE OR REPLACE FUNCTION has_plano_diretor_access(plano_id UUID, user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Creator has full access
    IF is_plano_diretor_creator(plano_id, user_id) THEN
        RETURN true;
    END IF;
    
    -- Check colaborador permissions
    RETURN is_plano_diretor_colaborador(plano_id, user_id, required_permission);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RLS Policies for plano_diretor_documents
CREATE POLICY "Creators can view their own planos"
    ON plano_diretor_documents FOR SELECT
    USING (criador_id = auth.uid());

CREATE POLICY "Colaboradores can view planos they have access to"
    ON plano_diretor_documents FOR SELECT
    USING (has_plano_diretor_access(id, auth.uid(), 'visualizar'));

CREATE POLICY "Creators can insert their own planos"
    ON plano_diretor_documents FOR INSERT
    WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Creators can update their own planos"
    ON plano_diretor_documents FOR UPDATE
    USING (criador_id = auth.uid());

CREATE POLICY "Colaboradores with edit permission can update planos"
    ON plano_diretor_documents FOR UPDATE
    USING (has_plano_diretor_access(id, auth.uid(), 'editar'));

CREATE POLICY "Only creators can delete planos"
    ON plano_diretor_documents FOR DELETE
    USING (criador_id = auth.uid());

-- RLS Policies for plano_diretor_objetivos
CREATE POLICY "Users can view objetivos in planos they have access to"
    ON plano_diretor_objetivos FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert objetivos"
    ON plano_diretor_objetivos FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can update objetivos"
    ON plano_diretor_objetivos FOR UPDATE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can delete objetivos"
    ON plano_diretor_objetivos FOR DELETE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

-- RLS Policies for plano_diretor_estrategias
CREATE POLICY "Users can view estrategias in planos they have access to"
    ON plano_diretor_estrategias FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'visualizar')
        )
    );

CREATE POLICY "Users with edit permission can insert estrategias"
    ON plano_diretor_estrategias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can update estrategias"
    ON plano_diretor_estrategias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can delete estrategias"
    ON plano_diretor_estrategias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

-- RLS Policies for plano_diretor_acoes
CREATE POLICY "Users can view acoes in planos they have access to"
    ON plano_diretor_acoes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'visualizar')
        )
    );

CREATE POLICY "Users with edit permission can insert acoes"
    ON plano_diretor_acoes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can update acoes"
    ON plano_diretor_acoes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can delete acoes"
    ON plano_diretor_acoes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

-- RLS Policies for plano_diretor_indicadores
CREATE POLICY "Users can view indicadores in planos they have access to"
    ON plano_diretor_indicadores FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert indicadores"
    ON plano_diretor_indicadores FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can update indicadores"
    ON plano_diretor_indicadores FOR UPDATE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can delete indicadores"
    ON plano_diretor_indicadores FOR DELETE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

-- RLS Policies for plano_diretor_colaboradores
CREATE POLICY "Creators can view colaboradores of their planos"
    ON plano_diretor_colaboradores FOR SELECT
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Colaboradores can view their own colaborador record"
    ON plano_diretor_colaboradores FOR SELECT
    USING (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Only creators can insert colaboradores"
    ON plano_diretor_colaboradores FOR INSERT
    WITH CHECK (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Only creators can update colaboradores"
    ON plano_diretor_colaboradores FOR UPDATE
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Colaboradores can update their own acceptance"
    ON plano_diretor_colaboradores FOR UPDATE
    USING (
        (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        AND OLD.data_aceite IS NULL
    )
    WITH CHECK (
        (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        AND data_aceite IS NOT NULL
    );

CREATE POLICY "Only creators can delete colaboradores"
    ON plano_diretor_colaboradores FOR DELETE
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

-- RLS Policies for plano_diretor_comentarios
CREATE POLICY "Users can view comentarios in planos they have access to"
    ON plano_diretor_comentarios FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with access can insert comentarios"
    ON plano_diretor_comentarios FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users can update their own comentarios"
    ON plano_diretor_comentarios FOR UPDATE
    USING (autor_id = auth.uid());

CREATE POLICY "Creators and users with edit permission can resolve comentarios"
    ON plano_diretor_comentarios FOR UPDATE
    USING (
        autor_id = auth.uid() OR
        is_plano_diretor_creator(plano_diretor_id, auth.uid()) OR
        is_plano_diretor_colaborador(plano_diretor_id, auth.uid(), 'editar')
    );

CREATE POLICY "Users can delete their own comentarios"
    ON plano_diretor_comentarios FOR DELETE
    USING (autor_id = auth.uid());

-- RLS Policies for plano_diretor_documentos_anexos
CREATE POLICY "Users can view documentos in planos they have access to"
    ON plano_diretor_documentos_anexos FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert documentos"
    ON plano_diretor_documentos_anexos FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users can update documentos they uploaded"
    ON plano_diretor_documentos_anexos FOR UPDATE
    USING (uploader_id = auth.uid());

CREATE POLICY "Users can delete documentos they uploaded"
    ON plano_diretor_documentos_anexos FOR DELETE
    USING (uploader_id = auth.uid());

-- RLS Policies for plano_diretor_historico
CREATE POLICY "Users can view historico of planos they have access to"
    ON plano_diretor_historico FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

-- ============================================================
-- MIGRATION CONCLUÍDA
-- ============================================================
-- Todas as tabelas, funções, triggers e políticas RLS foram criadas.
-- Verifique se não houve erros e teste o módulo Plano Diretor.
-- ============================================================

