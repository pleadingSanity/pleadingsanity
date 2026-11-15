-- Shared public knowledge mirror for Arron and the AI family.
-- Run once in the Supabase SQL editor (or `supabase db push`) on the
-- knowledge project. This is NOT a Netlify DB migration.
--
-- The repository files stay the source of truth. These tables are a
-- searchable copy of public-safe docs only. No journals, messages,
-- profiles, enquiries, or keys belong here.
--
-- Embeddings are 384 dimensions: Supabase Edge Runtime gte-small
-- (supabase/functions/kb-embed). Do not point this column at a
-- different model without a new migration.
--
-- Security: RLS is ON and forced. No policy is granted to anon or
-- authenticated, so the public anon key cannot read or write. Netlify
-- and the ingest job use the service role (SUPABASE_KB_SERVICE_ROLE_KEY),
-- which bypasses RLS. The match function is security definer with a
-- fixed search_path and execute revoked from anon/authenticated.

create extension if not exists vector with schema extensions;

create table if not exists public.kb_documents (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,
  title       text not null default '',
  source_sha  text not null,
  brand       text not null check (brand in ('pleading-sanity', 'insane-solar', 'sanity-law', 'shared')),
  updated_at  timestamptz not null default now()
);

create table if not exists public.kb_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.kb_documents (id) on delete cascade,
  chunk_index  integer not null,
  content      text not null,
  embedding    extensions.vector(384) not null,
  tokens       integer not null default 0,
  unique (document_id, chunk_index)
);

create index if not exists kb_chunks_document_idx
  on public.kb_chunks (document_id, chunk_index);

create index if not exists kb_chunks_embedding_hnsw
  on public.kb_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

create table if not exists public.kb_facts (
  key          text primary key,
  value        text not null,
  source_path  text not null,
  verified_on  date not null
);

alter table public.kb_documents enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.kb_facts enable row level security;

alter table public.kb_documents force row level security;
alter table public.kb_chunks force row level security;
alter table public.kb_facts force row level security;

revoke all on table public.kb_documents from public, anon, authenticated;
revoke all on table public.kb_chunks from public, anon, authenticated;
revoke all on table public.kb_facts from public, anon, authenticated;

grant all on table public.kb_documents to service_role;
grant all on table public.kb_chunks to service_role;
grant all on table public.kb_facts to service_role;

-- Locked public facts. Safe to re-run.
insert into public.kb_facts (key, value, source_path, verified_on) values
  (
    'palette',
    'Deep space #0b0f19, teal #00fff0 and #38bdf8, amber #f59e0b, silver #cbd5e1. No purple, indigo, or pink.',
    'docs/MASTER_PROMPT.md',
    '2026-11-09'
  ),
  (
    'crisis-numbers',
    'On every crisis reply, even if every model and this knowledge base are down: 999, Samaritans 116 123, text SHOUT to 85258, NHS 111. Arron is a companion, not a therapist, and never diagnoses.',
    'docs/MASTER_PROMPT.md',
    '2026-11-09'
  ),
  (
    'vat-solar',
    '0% VAT on qualifying solar and battery installations runs to 31 March 2027, subject to eligibility. 5% applies from 1 April 2027. Never promise a tax outcome.',
    'netlify/lib/solar-knowledge.ts',
    '2026-11-09'
  ),
  (
    'epc-seg',
    'An EPC is not required for the Smart Export Guarantee. Some suppliers may ask for one as their own extra. That request is not an Ofgem requirement to join the scheme.',
    'netlify/lib/solar-knowledge.ts',
    '2026-11-09'
  ),
  (
    'mcs-napit',
    'Humans sign MCS and NAPIT. The assistant never certifies, never signs, and never gives a binding quote.',
    'netlify/lib/solar-knowledge.ts',
    '2026-11-09'
  ),
  (
    'savings-typically',
    'Say typically for savings and costs. A figure is a guide, not a promise and not a quote.',
    'netlify/lib/solar-knowledge.ts',
    '2026-11-09'
  ),
  (
    'free-sanctuary',
    'Sanctuary, crisis support, the journal, and the core companion stay free.',
    'AGENTS.md',
    '2026-11-09'
  )
on conflict (key) do update
  set value = excluded.value,
      source_path = excluded.source_path,
      verified_on = excluded.verified_on;

create or replace function public.match_kb_chunks(
  query_embedding extensions.vector(384),
  match_count integer default 5,
  brand_filter text default null
)
returns table (
  id uuid,
  document_id uuid,
  path text,
  title text,
  brand text,
  chunk_index integer,
  content text,
  tokens integer,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select
    c.id,
    c.document_id,
    d.path,
    d.title,
    d.brand,
    c.chunk_index,
    c.content,
    c.tokens,
    (1 - (c.embedding <=> query_embedding))::double precision as similarity
  from public.kb_chunks c
  join public.kb_documents d on d.id = c.document_id
  where brand_filter is null
     or brand_filter = ''
     or d.brand = brand_filter
     or d.brand = 'shared'
  order by c.embedding <=> query_embedding
  limit least(greatest(coalesce(match_count, 5), 1), 20);
$$;

do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'match_kb_chunks'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end $$;
