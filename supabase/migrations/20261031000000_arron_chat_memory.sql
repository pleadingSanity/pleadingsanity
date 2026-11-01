-- Arron Phase 2: optional Supabase copy of chat memory.
-- Run once in the Supabase SQL editor (or `supabase db push`).
-- This is NOT a Netlify DB migration; those live in netlify/db/migrations.
--
-- Security: RLS is ON and no policy is granted to anon/authenticated,
-- so the public anon key cannot read, write or delete anyone's memory.
-- The Netlify functions should use SUPABASE_SERVICE_KEY (server-only),
-- which bypasses RLS. If only SUPABASE_ANON_KEY is set, Supabase calls
-- fail closed and Arron carries on with Netlify DB memory.

create table if not exists public.arron_chat_memory (
  id         bigint generated always as identity primary key,
  memory_id  text not null,
  role       text not null check (role in ('user','assistant','tool')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists arron_chat_memory_memory_id_idx
  on public.arron_chat_memory (memory_id, created_at desc);

alter table public.arron_chat_memory enable row level security;
alter table public.arron_chat_memory force row level security;

revoke all on public.arron_chat_memory from anon, authenticated;
