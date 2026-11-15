# Knowledge Mirror Activation Checklist

Public-safe steps only. Never commit values.

## Status on 15 Nov 2026

- Live. `GET https://pleadingsanity.co.uk/api/kb/search?q=crisis&brand=pleading-sanity` returned `"configured":true` and `"mirror":"live"` with public facts.
- Ingest runs one text at a time after PR #348. It runs from `.github/workflows/kb-ingest.yml` on a manual dispatch or on a push to `main` that touches the allowlist.

## The code on main

- `netlify/functions/kb-search.mts` (`/api/kb/search`)
- `netlify/lib/kb-retrieve.ts` (imported in `arron.mts`)
- `docs/AI-FAMILY-KNOWLEDGE.md`
- `supabase/migrations/20261109220000_arron_knowledge.sql`
- `supabase/functions/kb-embed`
- `.github/workflows/kb-ingest.yml`

`arron-knowledge.json` is protected. Do not overwrite it.

## If it ever needs setting up again (names only)

1. Netlify environment variables: `SUPABASE_KB_URL`, `SUPABASE_KB_SERVICE_ROLE_KEY`.
2. GitHub Actions secrets with the same names.
3. Apply `supabase/migrations/20261109220000_arron_knowledge.sql` once.
4. Deploy the edge function: `supabase functions deploy kb-embed`.
5. Run the kb-ingest workflow.

## Checks

- `/api/kb/search` returns `configured: true` and public results.
- Crisis early returns never call the mirror.
- Provider order stays GPT → Claude → Gemini → Grok → local fallback.

If the mirror is missing or slow, Arron carries on without it. Evolution, Not Erasure.
