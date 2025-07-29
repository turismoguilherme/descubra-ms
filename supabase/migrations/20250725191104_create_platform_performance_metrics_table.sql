CREATE TABLE public.platform_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit TEXT,
    context_info JSONB, -- Ex: { "client_id": "uuid", "state_id": "uuid" }
    source TEXT, -- Ex: "system", "api_gateway", "database"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.platform_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ppm_timestamp ON public.platform_performance_metrics (timestamp);
CREATE INDEX idx_ppm_metric_name ON public.platform_performance_metrics (metric_name);
CREATE INDEX idx_ppm_context_info_client_id ON public.platform_performance_metrics ((context_info->>'client_id'));
