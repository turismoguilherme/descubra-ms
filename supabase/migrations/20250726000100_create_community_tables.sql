-- Tabela para armazenar sugestões da comunidade
CREATE TABLE IF NOT EXISTS public.community_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    category text, -- 'atrativo', 'evento', 'melhoria', 'roteiro', etc.
    location text, -- Nome do local ou endereço
    coordinates point, -- { latitude, longitude }
    image_url text, -- URL da imagem (opcional)
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'implemented'
    votes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para armazenar votos em sugestões da comunidade
CREATE TABLE IF NOT EXISTS public.community_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (suggestion_id, user_id) -- Garante que um usuário só vota uma vez por sugestão
);

-- Tabela para armazenar comentários em sugestões da comunidade
CREATE TABLE IF NOT EXISTS public.community_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabela para log de moderação de sugestões da comunidade
CREATE TABLE IF NOT EXISTS public.community_moderation_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
    moderator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Quem moderou (pode ser admin, gestor, etc.)
    action text NOT NULL, -- 'approved', 'rejected', 'edited', 'archived', etc.
    reason text, -- Motivo da ação (opcional)
    created_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.community_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_votes_count ON public.community_suggestions(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_suggestion_id ON public.community_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_suggestion_id ON public.community_comments(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_suggestion_id ON public.community_moderation_log(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_moderation_moderator_id ON public.community_moderation_log(moderator_id); 