ALTER TABLE public.institutional_partners
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.institutional_partners
ADD CONSTRAINT institutional_partners_status_check CHECK (
  status IN ('pending', 'approved', 'rejected')
);
