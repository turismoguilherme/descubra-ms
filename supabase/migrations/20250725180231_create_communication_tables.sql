CREATE TABLE public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject_or_topic TEXT,
    body TEXT NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('sent', 'received', 'failed', 'processing')),
    related_ticket_id UUID REFERENCES public.flowtrip_support_tickets(id) ON DELETE SET NULL,
    ai_generated_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables_json JSONB,
    purpose TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Opcional: Índices para otimização de busca
CREATE INDEX idx_communication_logs_channel ON public.communication_logs (channel);
CREATE INDEX idx_communication_logs_direction ON public.communication_logs (direction);
CREATE INDEX idx_communication_logs_timestamp ON public.communication_logs ("timestamp");
CREATE INDEX idx_message_templates_channel ON public.message_templates (channel);
