-- Enable RLS and create policies for tables exposing sensitive data
-- This addresses the security finding about unprotected tables
-- Using IF NOT EXISTS to avoid conflicts with existing policies

-- 1. Communication Logs - Contains sensitive user communications
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them with proper security
DROP POLICY IF EXISTS "Admins can view all communication logs" ON public.communication_logs;
DROP POLICY IF EXISTS "System can create communication logs" ON public.communication_logs;

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