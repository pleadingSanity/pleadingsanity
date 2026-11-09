# AI family knowledge

How GPT, Claude, Gemini, Grok, Dola, and Arron share one verified picture of this house.

This is not a live connection. Reading this file, or calling the search endpoint, does not mean another model is in the room. There is no shared chat and no always-on agent. Each AI learns the house by reading the repository. The knowledge base is a searchable copy of those public files, nothing more.

## Source of truth

The files in `pleadingSanity/pleadingsanity` are the source of truth:

- `AGENTS.md` is the operating contract.
- `AI_HANDOFF.md` is the append-only status log.
- `docs/MASTER_PROMPT.md` is the charter.
- `system_blueprint.json` is a snapshot, not a running hivemind.
- `arron-knowledge.json` is Arron's soul file when it is real JSON. On main `1c68181` that file is the word `PLACEHOLDER`. The restored copy is on `grok/audit-radio-2026-11-09` at commit `b652635` (PR #254). Ingest reads that copy in memory when the working tree is a placeholder. It does not write the file.
- `netlify/lib/arron-knowledge.ts` and `netlify/lib/solar-knowledge.ts` are the knowledge modules Arron and the solar desk already use.

If a mirror row and a file disagree, the file wins.

## What the mirror is

Supabase stores three tables, created by `supabase/migrations/20261109220000_arron_knowledge.sql`:

- `kb_documents` — one row per public file or page card (`path`, `title`, `source_sha`, `brand`, `updated_at`).
- `kb_chunks` — chunks of that text, with a 384-dimension embedding.
- `kb_facts` — short locked facts: palette, crisis numbers, VAT, EPC and SEG, MCS/NAPIT, "typically" on savings, and free sanctuary.

Brands stay apart: `pleading-sanity`, `insane-solar`, `sanity-law`, and `shared`. A search for one brand also returns `shared`. It does not return the other brands.

Row level security is on for every table. There is no policy for `anon` or `authenticated`. Only the service role, used by Netlify Functions and the ingest job, can read and write.

No journal entry, chat message, profile, enquiry, email archive, or key is an allowed source. `docs/SHANE_CREATOR_IDENTITY.md` is excluded. The ingest scanner refuses a file that contains a key or token pattern, and it drops any paragraph with an email or phone that is not one of the published house lines (`pleadingsanity1@gmail.com`, `07711147663`, `447711147663`, `07999 899304`, and the published helplines already in Arron's safety text).

## How each AI reads it

1. Read the repository files listed above. That is the required step.
2. Optionally call the public search below for a short extract. Treat the extract as a hint and check the file it names.
3. Do not claim you asked another model, and do not claim the mirror is live, until you have called it and seen a response.

Arron, on the website, may prepend a block titled `Verified Pleading Sanity facts` before the existing provider chain. The chain stays GPT, then Claude, then Gemini, then Grok, then the local fallback. Retrieval only adds context. If the mirror is missing, slow, or wrong, Arron answers the way it does today.

Crisis behaviour does not use the mirror. A crisis reply still carries 999, Samaritans 116 123, text SHOUT to 85258, and NHS 111, including when every model and the knowledge base are down. Arron is a companion. He does not diagnose and he is not a therapist.

## Search

`GET /api/kb/search?q=...&brand=pleading-sanity&k=5`

`POST /api/kb/search` with JSON `{ "q": "...", "brand": "insane-solar", "k": 5 }`.

No login. The body is public text. The response has `facts` and `results` (`path`, `title`, `brand`, `chunk_index`, `content`, `similarity`). It does not return embeddings. It is rate-limited. A query that looks like a key, a private email, or a private phone is refused. If the mirror is not configured the status is 503 and `configured` is false.

`brand` is `pleading-sanity`, `insane-solar`, `sanity-law`, or `shared`. Omit it and the question picks a brand. Shared rows come back with that brand.

## Embeddings

Model: Supabase Edge Runtime built-in `gte-small`. Dimension: **384**.

Code: `supabase/functions/kb-embed`. It checks the service-role bearer that Supabase injects as `SUPABASE_SERVICE_ROLE_KEY`. No OpenAI, Gemini, or other paid embedding call is used. A different model would not match this column.

Deploy the function before ingest can write vectors:

```
supabase functions deploy kb-embed
```

That deploy is not done by this repository on its own.

## Ingest

`node scripts/kb-ingest.mjs --dry-run` prints counts and does not call the network.

`node scripts/kb-ingest.mjs` upserts by path and `source_sha`, replaces chunks when the file changed, and deletes documents that left the allowlist. A placeholder or invalid JSON file is not ingested, and its previous good copy is left in place. A secret, a private contact, or a denylisted file is not ingested, and an older copy of that path is removed.

If `SUPABASE_KB_URL` or `SUPABASE_KB_SERVICE_ROLE_KEY` is unset, the script exits 0 and writes nothing. The GitHub Action `.github/workflows/kb-ingest.yml` does the same. It runs on a manual dispatch and on a push to `main` that touches the allowlist. It tries to fetch the restored soul file first. Fetching that branch does not edit it.

## What Shane sets

Names only. Never commit the values.

Netlify (the Arron function and `/api/kb/search`):

- `SUPABASE_KB_URL`
- `SUPABASE_KB_SERVICE_ROLE_KEY`

GitHub Actions secrets (ingest):

- `SUPABASE_KB_URL`
- `SUPABASE_KB_SERVICE_ROLE_KEY`

`SUPABASE_KB_SERVICE_ROLE_KEY` is the Supabase service role key for this knowledge project. It must match the key the edge function already sees as `SUPABASE_SERVICE_ROLE_KEY`. It stays on the server. The browser never receives it.

Apply this file once, in the Supabase SQL editor or with `supabase db push`:

`supabase/migrations/20261109220000_arron_knowledge.sql`

## Not proven

The migration has not been applied to a live Supabase project from this change. The edge function has not been deployed from this change. No live embedding call was made. `/api/kb/search` has not been called on a deployed site. Arron has not been exercised against a real mirror. A green ingest still depends on Shane setting the two secrets and applying the migration.
