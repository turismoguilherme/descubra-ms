import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DDL = `
create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  source text,
  category text,
  state_code text check (char_length(state_code) = 2),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  tenant_id uuid,
  last_fetched_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  state_code text check (char_length(state_code) = 2),
  embedding vector(384),
  created_at timestamptz default now()
);

create index if not exists idx_documents_state on public.documents (state_code);
create index if not exists idx_chunks_state on public.document_chunks (state_code);
create index if not exists idx_chunks_doc on public.document_chunks (document_id);
create index if not exists idx_chunks_created_at on public.document_chunks (created_at desc);

create index if not exists idx_chunks_fts on public.document_chunks using gin (to_tsvector('portuguese', content));
create index if not exists idx_chunks_vec on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists public.rag_query_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  state_code text,
  strategy text,
  top_k int,
  confidence numeric,
  processing_time_ms int,
  created_at timestamptz default now(),
  user_id text,
  session_id text
);

create table if not exists public.rag_source_logs (
  log_id uuid references public.rag_query_logs(id) on delete cascade,
  title text,
  url text,
  domain text,
  relevance numeric,
  freshness_ts timestamptz,
  chunk_id uuid,
  primary key (log_id, chunk_id)
);

alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.rag_query_logs enable row level security;
alter table public.rag_source_logs enable row level security;

create policy if not exists p_docs_read on public.documents for select using (state_code is not null);
create policy if not exists p_chunks_read on public.document_chunks for select using (state_code is not null);
create policy if not exists p_rag_logs_ins on public.rag_query_logs for insert with check (true);
create policy if not exists p_rag_sources_ins on public.rag_source_logs for insert with check (true);
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'config_error', message: 'SUPABASE_URL or SERVICE_ROLE_KEY missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Execute DDL via RPC (single transaction)
    const { error } = await supabase.rpc('http_execute_sql', { sql: DDL });
    // If helper function not exists, fallback to direct query using fetch() to PostgREST is not possible for DDL; return instructions.
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message, note: 'rpc http_execute_sql ausente. Aplicar DDL manualmente via migração.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'internal_error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
