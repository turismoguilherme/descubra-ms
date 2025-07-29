CREATE TABLE public.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name TEXT UNIQUE NOT NULL,
    description TEXT,
    definition JSONB NOT NULL, -- JSON que define a sequência de tarefas e condições
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_workflow_definitions_is_active ON public.workflow_definitions (is_active);

CREATE TABLE public.automated_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    executed_by_ai BOOLEAN DEFAULT TRUE,
    requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    related_workflow_id UUID REFERENCES public.workflow_definitions(id) ON DELETE SET NULL,
    task_parameters JSONB, -- Parâmetros específicos para a execução da tarefa
    task_results JSONB, -- Resultados ou logs da execução da tarefa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.automated_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_automated_tasks_status ON public.automated_tasks (status);
CREATE INDEX idx_automated_tasks_scheduled_at ON public.automated_tasks (scheduled_at);
CREATE INDEX idx_automated_tasks_requester_user_id ON public.automated_tasks (requester_user_id);
