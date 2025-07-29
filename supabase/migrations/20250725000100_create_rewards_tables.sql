-- Tabela de recompensas criadas pelos gestores
CREATE TABLE IF NOT EXISTS public.rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text NOT NULL, -- badge, desconto, brinde, etc.
    criteria jsonb NOT NULL, -- critérios flexíveis (ex: {"checkins": 3, "route_id": "..."})
    active boolean DEFAULT true,
    created_by uuid REFERENCES user_profiles(user_id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    source text DEFAULT 'manual', -- para futura integração com APIs externas
    external_id text -- id externo, se vier de API
);

-- Tabela de recompensas recebidas pelos usuários
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES user_profiles(user_id),
    reward_id uuid REFERENCES rewards(id),
    received_at timestamp with time zone DEFAULT now(),
    reason text, -- opcional: motivo/contexto da atribuição
    source text DEFAULT 'system', -- para futura integração
    external_id text -- id externo, se vier de API
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(active);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_id ON public.user_rewards(reward_id); 