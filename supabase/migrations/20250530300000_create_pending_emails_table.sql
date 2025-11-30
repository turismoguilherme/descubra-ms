-- Tabela para armazenar emails pendentes (quando Resend não está configurado)
CREATE TABLE IF NOT EXISTS public.pending_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_pending_emails_status ON public.pending_emails(status);
CREATE INDEX IF NOT EXISTS idx_pending_emails_created_at ON public.pending_emails(created_at DESC);

-- RLS - Apenas admin pode ver
ALTER TABLE public.pending_emails ENABLE ROW LEVEL SECURITY;

-- Policy para service role (Edge Functions)
CREATE POLICY "Service role pode gerenciar emails"
ON public.pending_emails
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentário na tabela
COMMENT ON TABLE public.pending_emails IS 'Armazena emails pendentes para envio quando Resend não está configurado';

