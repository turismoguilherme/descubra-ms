-- URL do PDF oficial por política (admin / termos de parceiros, etc.)
ALTER TABLE public.platform_policies
  ADD COLUMN IF NOT EXISTS terms_pdf_url TEXT;

COMMENT ON COLUMN public.platform_policies.terms_pdf_url IS
  'URL pública do PDF oficial no Storage (bucket documents), ex.: policy-pdfs/...';
