-- Enable RLS and create policies for tables exposing sensitive data
-- This addresses the security finding about unprotected tables

-- 1. Communication Logs - Contains sensitive user communications
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all communication logs" 
ON public.communication_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech', 'municipal_manager', 'gestor_igr', 'diretor_estadual')
));

CREATE POLICY "System can create communication logs" 
ON public.communication_logs 
FOR INSERT 
WITH CHECK (true);

-- 2. Automated Tasks - Contains internal system operations
ALTER TABLE public.automated_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automated tasks" 
ON public.automated_tasks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

CREATE POLICY "Users can view their own requested tasks" 
ON public.automated_tasks 
FOR SELECT 
USING (requester_user_id = auth.uid());

-- 3. AI Feedback Log - Contains user feedback data  
ALTER TABLE public.ai_feedback_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI feedback" 
ON public.ai_feedback_log 
FOR ALL 
USING (feedback_by_user_id = auth.uid());

CREATE POLICY "Admins can view all AI feedback" 
ON public.ai_feedback_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- 4. RAG Query Logs - Contains search queries and usage patterns
-- Note: This table is created by the RAG setup function
ALTER TABLE public.rag_query_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RAG queries" 
ON public.rag_query_logs 
FOR SELECT 
USING (user_id = auth.uid()::text);

CREATE POLICY "System can create RAG query logs" 
ON public.rag_query_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all RAG queries" 
ON public.rag_query_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- 5. RAG Source Logs - Contains source attribution data
ALTER TABLE public.rag_source_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can create RAG source logs" 
ON public.rag_source_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view RAG source logs" 
ON public.rag_source_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'tech')
));

-- Additional security: Enable RLS on other sensitive tables that might exist
-- Only enable if tables exist, otherwise this will fail silently

-- Check and secure workflow-related tables if they exist
DO $$
BEGIN
  -- Secure workflow_definitions if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workflow_definitions') THEN
    EXECUTE 'ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Admins can manage workflows" ON public.workflow_definitions FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''tech'')))';
  END IF;

  -- Secure message_templates if it exists  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    EXECUTE 'ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Admins can manage message templates" ON public.message_templates FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''tech'')))';
  END IF;

  -- Secure platform_performance_metrics if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_performance_metrics') THEN
    EXECUTE 'ALTER TABLE public.platform_performance_metrics ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Admins can view performance metrics" ON public.platform_performance_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''tech'')))';
  END IF;
END
$$;