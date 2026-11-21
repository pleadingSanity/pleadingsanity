# legallyinsane.co.uk — offline scaffold spec (AI test sandbox + second studio brain)

Status 2026-11-20: DNS live on Porkbun nameservers, parked HTTP 200, no TLS, no
host project, no repository on this account yet (fine-grained token cannot
create repositories). This spec prepares every file contract and dashboard
step so the site can be built without guessing. It complements
`LEGALLYINSANE-BRINGUP-20261120.md` (DNS facts) and Phase 6 of
`MASTER-UPGRADE-BLUEPRINT.md`.

## 1. Purpose and hard boundaries

- Purpose: always-on AI test bench, prompt and agent laboratory, second studio
  presence, safe place to run experiments that must never disturb the free
  sanctuary site.
- Separation rules:
  - Own repository and host project; no monorepo sharing with production pages.
  - Separate environment variables, prefixed `LI_`; never reuse production
    Supabase, PayPal, identity or mailing lists.
  - Separate privacy, crisis and consent copy; the lab must not imply clinical
    care. A visible note states experiments are AI tools, not therapy.
  - No commercial customer records shared with the sanctuary feed or journal.
  - Archive superseded prompts under `archive/prompts/YYYY-MM-DD/`; never
    delete prompt history; keep a changelog at the root.
- Evolution rule: every module has a `README.md` and a version field; changes
  land in small PRs with tests; the registry JSON lists every prompt, owner
  date, status (`draft`, `testing`, `active`, `archived`) and safety summary.

## 2. Proposed repository layout (to be created when hosting access exists)

```
legallyinsane/
  README.md
  CHANGELOG.md
  netlify.toml                  # isolated build; publish "." with its own headers
  index.html                    # lab landing: sandbox status, modules, safe entry
  safety/
    ethics.md                   # consent, no medical claims, escalation copy
    crisis-uk.html              # UK crisis numbers, separate from sanctuary page
  ai-core/
    README.md
    providers/
      chain.md                  # OpenAI -> Anthropic -> Gemini -> Grok order, fail closed
      config.schema.json        # required LI_* names, no secrets in file
    prompts/
      registry.json             # every prompt: id, version, status, date, tags
      sandbox/                  # active experimental prompt modules
      archive/YYYY-MM-DD/       # superseded prompts, never deleted
    memory/
      contract.md               # local-only memory, wipe button, no cross-site sync
    tools/
      fetch-bounds.md           # bounded fetch rules ported from lab patch
  sandbox/
    prompt-playground.html
    agent-test-runner.html
    reward-experiment.html      # opt-in, non-monetary badge experiments only
  functions/                    # isolated serverless endpoints, LI_ secrets
    probe.mts
    prompt-run.mts
  public/
    css/lab.css
    assets/                    # generated art labelled synthetic where required
  tests/
    registry.test.mjs
    env-contract.test.mjs
    safety-copy.test.mjs
  docs/
    dashboard-checklist.md
    migration-notes.md
```

## 3. Environment contract (dashboard-only values)

| Variable | Purpose | Notes |
|---|---|---|
| `LI_OPENAI_API_KEY` | Optional provider probe | Paid calls only after explicit approval |
| `LI_ANTHROPIC_API_KEY` | Optional provider probe | Same approval gate |
| `LI_GEMINI_API_KEY` | Optional provider probe | Same approval gate |
| `LI_GROK_API_KEY` / `LI_XAI_API_KEY` | Optional provider probe | Runs on owner's approved client |
| `LI_SUPABASE_URL` / `LI_SUPABASE_ANON_KEY` / `LI_SERVICE_ROLE_KEY` | Separate lab database | Never the production pair |
| `LI_SITE_URL` | `https://legallyinsane.co.uk` | Used for CSP and canonical tags |
| `LI_ADMIN_EMAILS` | Owner/gate list | Separate from sanctuary owner list if desired |

Test contract: `tests/env-contract.test.mjs` asserts code reads only `LI_*`
names and never references production env names or credentials.

## 4. Build order (each step verifiable before the next)

1. Owner dashboard actions: create new GitHub repository (or grant repo-create),
   attach host project (Netlify/Vercel), point DNS (Cloudflare or Porkbun A/CNAME),
   issue TLS, add `www` redirect and 404 page.
2. Commit the scaffold above; local tests `registry`, `env-contract`,
   `safety-copy` pass; no secrets committed.
3. Port reviewed modules from the private lab (`guardian/arron-fetch-bounds`,
   AI Studio snapshots, provider config history) behind PRs; production
   sanctuary untouched.
4. Switch on provider probes one at a time with owner approval; record spend in
   the lab changelog; default offline mode works with no keys.
5. Publish experiments (prompt registry, playground, badge experiments) as
   opt-in pages; public safety copy present on every AI entry view.
6. Connect only after approval: optional music/licensing experiments; keep
   production shop and radio as the canonical commercial surfaces.

## 5. Dashboard blocker checklist (cannot be completed from this environment)

- [ ] Repo creation or grant for the second repository (token currently scoped
      to existing repositories).
- [ ] Host project creation and deploy settings; TLS certificate issuance.
- [ ] DNS records at Porkbun/Cloudflare for apex and `www`.
- [ ] `LI_*` secret values entered in the host dashboard; nothing committed.
- [ ] Paid provider key approval before any model call; offline default first.
- [ ] Separate privacy/crisis/consent pages reviewed by the owner.

## 6. Relationship to production

- The sanctuary remains the free, ad-free, paywall-free public surface.
- `legallyinsane.co.uk` is a laboratory; links between them are clearly
  labelled and do not share sessions, carts, donations or personal records.
- When a lab module proves stable, it graduates to a production PR through the
  master blueprint phases; the lab copy stays archived for history.
