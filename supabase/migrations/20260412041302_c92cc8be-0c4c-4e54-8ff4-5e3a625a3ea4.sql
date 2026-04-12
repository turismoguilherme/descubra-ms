
-- Add review columns to partner_terms_acceptances
ALTER TABLE public.partner_terms_acceptances
  ADD COLUMN IF NOT EXISTS digital_signature_url text,
  ADD COLUMN IF NOT EXISTS uploaded_pdf_url text,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text;

-- Add index for filtering by review_status
CREATE INDEX IF NOT EXISTS idx_partner_terms_review_status ON public.partner_terms_acceptances(review_status);
