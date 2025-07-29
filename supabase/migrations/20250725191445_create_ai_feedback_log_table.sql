CREATE TABLE public.ai_feedback_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id UUID, -- Opcional: ID da interação ou insight da IA ao qual o feedback se refere
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'neutral')),
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comments TEXT,
    feedback_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_feedback_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_aifl_interaction_id ON public.ai_feedback_log (interaction_id);
CREATE INDEX idx_aifl_feedback_by_user_id ON public.ai_feedback_log (feedback_by_user_id);
CREATE INDEX idx_aifl_created_at ON public.ai_feedback_log (created_at);
