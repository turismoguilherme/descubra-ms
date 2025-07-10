-- Fase 2: Coleta de Dados Comportamentais
-- Cria a tabela para rastrear interações dos usuários na plataforma.

BEGIN;

-- Tabela para armazenar as interações dos usuários
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID, -- Para agrupar interações de uma mesma sessão de uso
    
    interaction_type TEXT NOT NULL, -- Ex: 'page_view', 'click', 'search', 'share', 'form_submission'
    target_id TEXT, -- Ex: ID do destino, ID do evento, ID do roteiro
    target_name TEXT, -- Ex: "Bonito", "Festival de Inverno"
    path TEXT, -- URL da página onde a interação ocorreu
    
    duration_seconds INT, -- Para medir tempo de permanência em uma página
    details JSONB, -- Para metadados adicionais (ex: termos de busca, filtros aplicados)

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_interactions IS 'Registra as interações dos usuários para análise de comportamento e insights estratégicos.';
COMMENT ON COLUMN public.user_interactions.session_id IS 'Permite agrupar todas as ações de uma única visita do usuário.';
COMMENT ON COLUMN public.user_interactions.interaction_type IS 'O tipo de ação que o usuário realizou.';
COMMENT ON COLUMN public.user_interactions.target_id IS 'O identificador do item com o qual o usuário interagiu.';
COMMENT ON COLUMN public.user_interactions.details IS 'Um campo flexível para armazenar detalhes contextuais da interação.';

-- Índices para otimizar as consultas da IA
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_id ON public.user_interactions(target_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);

COMMIT; 