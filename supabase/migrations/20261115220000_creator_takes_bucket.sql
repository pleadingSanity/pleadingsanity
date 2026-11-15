-- Creator Music Studio: private storage bucket for Shaney C voice takes.
-- Private bucket (public = false): no public URLs. Row level security on storage.objects
-- stays on; the only policies below let a signed-in Supabase user reach objects they own.
-- The site signs in with Netlify Identity, so in practice only the server (service role,
-- held in Netlify env vars, never in code) reads or writes here, after the
-- /api/creator-studio gate has confirmed the creator role. Anonymous access: none.
-- Idempotent: safe to run more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-takes',
  'creator-takes',
  false,
  4500000,
  array['audio/webm', 'audio/ogg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/mpeg', 'audio/aac']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "creator_takes_owner_select" on storage.objects;
drop policy if exists "creator_takes_owner_insert" on storage.objects;
drop policy if exists "creator_takes_owner_update" on storage.objects;
drop policy if exists "creator_takes_owner_delete" on storage.objects;

create policy "creator_takes_owner_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'creator-takes' and owner = (select auth.uid()));

create policy "creator_takes_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'creator-takes' and owner = (select auth.uid()));

create policy "creator_takes_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'creator-takes' and owner = (select auth.uid()))
  with check (bucket_id = 'creator-takes' and owner = (select auth.uid()));

create policy "creator_takes_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'creator-takes' and owner = (select auth.uid()));
