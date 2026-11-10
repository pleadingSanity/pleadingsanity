# Knowledge Mirror Activation Checklist

Public-safe steps only. Never commit values.

The code already exists on main:
- `netlify/functions/kb-search.mts`
- `netlify/lib/kb-retrieve.ts` (imported in `arron.mts`)
- `docs/AI-FAMILY-KNOWLEDGE.md`
- `supabase/migrations/20261109220000_arron_knowledge.sql`
- `.github/workflows/kb-ingest.yml`

Soul file `arron-knowledge.json` is protected. Do not overwrite it.

## Shane actions (names only)

1. In Netlify site settings → Environment variables, set:
   - `SUPABASE_KB_URL`
   - `SUPABASE_KB_SERVICE_ROLE_KEY`

2. In GitHub Actions secrets (same names):
   - `SUPABASE_KB_URL`
   - `SUPABASE_KB_SERVICE_ROLE_KEY`

3. Apply the migration once in the Supabase SQL editor or with `supabase db push`:
   `supabase/migrations/20261109220000_arron_knowledge.sql`

4. Deploy the edge function:
   `supabase functions deploy kb-embed`

5. Trigger the workflow manually or push a change that touches the allowlist.

## Verification (not proven until done)

- `GET /api/kb/search?q=crisis&brand=pleading-sanity` returns `configured: true` and public results.
- Crisis early returns never call the mirror.
- Provider order remains GPT → Claude → Gemini → Grok → local fallback.

If the mirror is missing or slow, Arron continues exactly as today. Evolution Not Erasure.
