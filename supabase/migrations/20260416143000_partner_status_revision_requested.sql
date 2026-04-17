-- Permite status "revision_requested" (devolução para ajuste de documentos/cadastro)
-- e garante "suspended" na constraint (já usado no admin).
ALTER TABLE public.institutional_partners
  DROP CONSTRAINT IF EXISTS institutional_partners_status_check;

ALTER TABLE public.institutional_partners
  ADD CONSTRAINT institutional_partners_status_check CHECK (
    status IN (
      'pending',
      'approved',
      'rejected',
      'suspended',
      'revision_requested'
    )
  );
