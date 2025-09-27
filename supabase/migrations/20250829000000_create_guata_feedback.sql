-- Tabela de feedback do Guatá
create table if not exists public.guata_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  session_id text null,
  question text not null,
  answer text null,
  positive boolean not null,
  correction text null,
  source_title text null,
  url text null,
  domain text null,
  meta jsonb null
);

-- Índices úteis
create index if not exists guata_feedback_created_at_idx on public.guata_feedback (created_at desc);
create index if not exists guata_feedback_domain_idx on public.guata_feedback (domain);
create index if not exists guata_feedback_positive_idx on public.guata_feedback (positive);
