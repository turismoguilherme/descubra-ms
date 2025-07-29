ALTER TABLE public.institutional_partners
ADD COLUMN cnpj TEXT,
ADD COLUMN contact_person TEXT,
ADD COLUMN partnership_interest TEXT NOT NULL DEFAULT 'outro';

ALTER TABLE public.institutional_partners
ADD CONSTRAINT partnership_interest_check CHECK (
  partnership_interest IN ('destaque_plataforma', 'patrocinio_evento', 'conteudo_colaborativo', 'outro')
);
