-- Migration: Adicionar campos para PDF do termo de consentimento
-- Data: 2025-02-01
-- Descrição: Adiciona campos para armazenar PDF assinado e metadados da assinatura

-- Adicionar campo para URL do PDF
ALTER TABLE data_sharing_consents 
ADD COLUMN IF NOT EXISTS terms_pdf_url TEXT;

-- Adicionar campo para metadados da assinatura (JSONB)
ALTER TABLE data_sharing_consents 
ADD COLUMN IF NOT EXISTS signature_data JSONB DEFAULT '{}'::jsonb;

-- Comentários
COMMENT ON COLUMN data_sharing_consents.terms_pdf_url IS 'URL do PDF do termo assinado armazenado no Supabase Storage';
COMMENT ON COLUMN data_sharing_consents.signature_data IS 'Metadados da assinatura: signed_name, signed_at, ip_address, user_agent, document_hash';

