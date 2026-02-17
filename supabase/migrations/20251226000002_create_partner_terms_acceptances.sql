-- Migration: Criar tabela para rastrear aceites de termos de parceria
-- Tabela: partner_terms_acceptances
-- Objetivo: Armazenar histórico completo de aceites de termos com PDFs e metadados para segurança jurídica

-- Remover constraint se já existir (caso de execução parcial anterior)
ALTER TABLE IF EXISTS public.partner_terms_acceptances 
  DROP CONSTRAINT IF EXISTS partner_terms_acceptances_partner_id_fkey;

-- Criar tabela de aceites de termos
CREATE TABLE IF NOT EXISTS public.partner_terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  terms_version INTEGER NOT NULL,
  pdf_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  document_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar foreign key constraint separadamente (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'partner_terms_acceptances_partner_id_fkey'
  ) THEN
    ALTER TABLE public.partner_terms_acceptances
      ADD CONSTRAINT partner_terms_acceptances_partner_id_fkey 
      FOREIGN KEY (partner_id) 
      REFERENCES public.institutional_partners(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Comentários
COMMENT ON TABLE public.partner_terms_acceptances IS 'Histórico de aceites de termos de parceria com PDFs e metadados para segurança jurídica';
COMMENT ON COLUMN public.partner_terms_acceptances.partner_id IS 'ID do parceiro que aceitou o termo';
COMMENT ON COLUMN public.partner_terms_acceptances.terms_version IS 'Versão do termo que foi aceita';
COMMENT ON COLUMN public.partner_terms_acceptances.pdf_url IS 'URL do PDF assinado no Supabase Storage';
COMMENT ON COLUMN public.partner_terms_acceptances.ip_address IS 'Endereço IP de onde o termo foi aceito';
COMMENT ON COLUMN public.partner_terms_acceptances.user_agent IS 'User agent do navegador usado para aceitar';
COMMENT ON COLUMN public.partner_terms_acceptances.document_hash IS 'Hash do documento para verificação de integridade';
COMMENT ON COLUMN public.partner_terms_acceptances.signed_at IS 'Data e hora exata do aceite';

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_partner_terms_acceptances_partner_id 
  ON public.partner_terms_acceptances(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_terms_acceptances_terms_version 
  ON public.partner_terms_acceptances(terms_version);
CREATE INDEX IF NOT EXISTS idx_partner_terms_acceptances_signed_at 
  ON public.partner_terms_acceptances(signed_at DESC);

-- RLS Policies
ALTER TABLE public.partner_terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem (caso de execução parcial anterior)
DROP POLICY IF EXISTS "Admins can view all term acceptances" ON public.partner_terms_acceptances;
DROP POLICY IF EXISTS "Partners can view their own term acceptances" ON public.partner_terms_acceptances;
DROP POLICY IF EXISTS "System can insert term acceptances" ON public.partner_terms_acceptances;

-- Política: Admins podem ver todos os aceites
CREATE POLICY "Admins can view all term acceptances"
  ON public.partner_terms_acceptances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'tech')
    )
  );

-- Política: Parceiros podem ver apenas seus próprios aceites
CREATE POLICY "Partners can view their own term acceptances"
  ON public.partner_terms_acceptances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.institutional_partners
      WHERE institutional_partners.id = partner_terms_acceptances.partner_id
      AND institutional_partners.contact_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Política: Sistema pode inserir aceites (via service role ou função)
CREATE POLICY "System can insert term acceptances"
  ON public.partner_terms_acceptances
  FOR INSERT
  WITH CHECK (true); -- Permitir inserção via função ou service role

-- Política: Ninguém pode atualizar ou deletar aceites (imutável para segurança jurídica)
-- Aceites são imutáveis para garantir integridade jurídica

