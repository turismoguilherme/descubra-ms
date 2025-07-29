ALTER TABLE public.knowledge_base_entries
ADD COLUMN context_type TEXT NOT NULL DEFAULT 'general';

ALTER TABLE public.knowledge_base_entries
ADD CONSTRAINT context_type_check CHECK (
  context_type IN ('general', 'administrative', 'technical', 'financial', 'customer_support', 'contract', 'faq')
);
