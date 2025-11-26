-- Migration: Create Plano Diretor de Turismo Tables
-- Description: Tables for digital tourism master plan management system

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


