# Pleading Sanity — Human + AI Platform Architecture

Status: architecture specification plus Site Brain operating index, updated 25 October 2026. Older feature classifications below are source inventories, not current end-to-end certification.

## Site Brain — start here

This is the existing central operating map, not a second handoff. Read `../AGENTS.md` and the newest `../AI_HANDOFF.md` entry first. The public repository must never contain passwords, recovery codes, private exports, government IDs or user records.

| System | Source of truth | Recovery / verification |
|---|---|---|
| Source | `pleadingSanity/pleadingsanity`, main | Branch + reviewed PR; exact commit and deployment SHA, never force push |
| Production | Netlify `pleadingsanity`, site `31c56935-32d5-4932-8a63-2db881842090` | Root publish directory; `../netlify.toml`, `../_redirects`; [release checklist](DEPLOYMENT-CHECKLIST.md) |
| Domains | `.co.uk` canonical; `.uk` independent backup | Registrar/DNS ownership and renewal details in private vault; inspect live records before changes |
| Login | `../js/auth.js`, Netlify Identity | Preserve existing identity IDs and sessions; synthetic test users only |
| Data | `../db/schema.ts`, `../netlify/database/migrations`, Netlify Blobs | Provider backups and restore exercise required; source rollback does not restore data |
| Firebase sidecar | `../js/firebase.js`, `../js/firebase-config.js`, `../netlify/functions/firebase-public-config.mts` | [config checklist](FIREBASE-SETUP.md); optional, no auth migration; console service status unverified |
| Arron | `../netlify/functions/arron.mts`, `../netlify/lib/ai-chain.ts`, `../arron-knowledge.json` | Keep configured GPT → Claude → Gemini → Grok order; crisis fallback independent of provider |
| Journals / games | `../journal-vault.html` inline code, `../js/progress.js`, `../js/guest-progress.js` | Inspect each route for actual local/server persistence; never call all journals local or encrypted |
| PWA | `../sw.js`, root manifests, `../get-the-app.html` | Preserve IDs/start URLs/scope, private-route exclusions; [install spec](ARRON-APP-STORES.md) |
| Checks | `../scripts/audit-site.py`, `../scripts/test-*.mjs`, `../.github/workflows/` | [maintenance protocol](AI-COUNCIL-OPERATIONS.md), [backups](BACKUP-STRATEGY.md) |
| Founder history | [social audit](SOCIAL-CONTENT-AUDIT.md) | Private evidence ledger and approved excerpts; raw archives stay outside repo |
| Stewardship / money | [family plan](FAMILY-LEGACY-PLAN.md), [UK governance draft](LEGAL-GOVERNANCE-FRAMEWORK.md) | Proposals only; solicitor/accountant and named human custodians required |
| Images / games | [asset preservation](ASSET-PRESERVATION.md), [game inventory](GAME-INVENTORY.md), [art brief](GAME-ART-MASTER-BRIEF.md) | Reuse existing assets/routes before adding anything |

### Private vault register — locations, never credentials

Shane must choose a password manager with emergency access and record its name/location privately with his executor. This has not been provisioned. Create separate vault entries for GitHub owner/2FA recovery, Netlify owner/Identity/database backups, registrar/DNS/domain renewals, Firebase/Google project ownership, provider API keys, social OAuth access, banking, and any future signing keys. Each entry needs owner, second authorised human, recovery method, renewal date, access scope, last recovery test and revocation procedure. Do not use a single shared login or paste secrets into an AI prompt.

The public register lists service and responsible role only. The private executor pack contains actual contact details, legal names, vault locator and authorised recovery instructions. Current named owner: Shane Cooper. Executor, deputy, accountant, solicitor, successor and independent reviewers: **not appointed or verified here**. Public project contact: `pleadingsanity1@gmail.com`; delivery/monitoring not verified in this audit. Do not assume older security/emergency aliases are staffed.

### Taking over without breaking the house

1. Establish lawful account authority through the executor/provider processes; do not impersonate Shane or reuse a deceased person’s login.
2. Read current handoff; inventory domains, deploys, billing/quotas, data locations, providers and open incidents. Preserve an independent source/asset backup and separately protected data backups.
3. Freeze optional features if resources are low; keep static support and existing local tools available. Never paywall core help to cover an unexpected bill.
4. Run checks and restore a backup into an isolated approved environment before claiming recoverability. Use the existing host; no duplicate public site.
5. Publish only aggregate operational facts. Resume scoped PRs with human review and an exact-SHA production check.

No framework guarantees perpetual hosting, free API availability or legal ownership transfer. A useful static archive and recoverable human stewardship are the fallback.


## Non-negotiables
- Evolution, Not Erasure.
- Human dignity and consent.
- AI assists; humans remain in control.
- No provider is described as connected unless the deployed system actually has the required API/key/permission.
- No feature is called private, encrypted, anonymous or local-only unless the implementation proves it.
- No financial feature becomes regulated broking/advice without the required legal infrastructure.
- Working games, Sane Finance and existing sanctuary features are preserved.

## Current classification

### A — existing and working
- Home / Heal / Play / Community navigation foundations.
- Arron companion and multi-provider server-side chain.
- Journal Vault and account/profile infrastructure.
- Feed, profiles, visibility controls, moderation/reporting and Guardian tooling.
- AI Studio, AI Stories, creative tools.
- Games hub, game cards, Solitaire, sky theme and reduced-motion work already audited.
- Sane Finance GBT and its explicit limitations.
- PWA/service worker and install manifests.

### B — exists but needs completion
- Sanity Passport: profile exists, but the richer voluntary passport and AI-memory consent model is not yet end-to-end.
- Truth Lab: three legacy tags exist; five-part taxonomy is now the target and legacy values remain readable.
- Human/AI/Together labelling: principles exist, but platform-wide provenance needs consistent UI/data fields.
- AI Family: roles are documented; provider availability must remain runtime truth.
- Guardians: moderation infrastructure exists; community-role UX and boundaries need expansion.

### C — needs redesign/integration
- Contribution-based reputation: current positive hearts/milestones should evolve toward contribution signals without creating mental-health status rankings.
- Sanity Arena: creative infrastructure exists, but transparent competition/judging needs a dedicated model.
- Kids: separate page exists; stronger child-safe boundary and age-aware architecture remain required.

### D — genuinely missing
- Full Sanity Passport with enforceable AI-memory permissions.
- Platform-wide provenance fields: human-created / AI-assisted / AI-generated / human+AI.
- Dedicated Survivors Wall story workflow with safety-aware consent.
- Full Guardian role and escalation UX.
- Dedicated developer/partner operating area.

### E — requires infrastructure
- Multi-user real-time social at scale.
- Durable authentication/session hardening beyond current Netlify Identity setup.
- Rich media processing/storage.
- Push notifications at production scale.
- Provider-specific AI APIs beyond the connections actually configured.
- Any paid finance lead generation, credit broking or regulated advice.

## Truth Lab contract
KNOWN = evidence-backed information.
EXPERIENCE = personal experience.
THOUGHT = idea/hypothesis.
BELIEF = personal/philosophical belief.
UNKNOWN = unresolved.

This is a classification aid, not an authority or fact-checking oracle.

## AI provenance contract
Every future creation object should carry:
- origin: human | ai | collaborative
- model/provider when AI is involved
- assisted: boolean
- humanReviewed: boolean
- timestamp

Do not infer provenance from prose.

## Required next implementation order
1. Finish the five-tag Truth Lab migration and UI across all creation surfaces.
2. Add provenance to AI Studio, posts and stories.
3. Implement Sanity Passport fields and enforceable AI-memory permissions.
4. Build Survivors Wall with consent, redaction and reporting.
5. Build Guardian role UX and transparent moderation actions.
6. Build Arena judging model.
7. Harden Kids boundary.
8. Only then consider richer real-time/social scaling.

## Infrastructure gates
### Required now
- Netlify environment variables must be reviewed against actual code.
- Remove obsolete public-key templates and stale documentation that suggests private keys belong in browser builds.
- Keep production API keys server-side.

### Optional
- Licensed provider feed for finance.
- FCA Register API credentials.
- YouTube API key for richer current video feeds.

### Future
- Auth/database migration only when scale demands it.
- Dedicated media pipeline.
- Independent security/privacy review.

## What should not be built yet
- Hidden popularity algorithms.
- Mental-health scores.
- AI that impersonates Shane.
- Automated diagnosis.
- A universal truth score.
- Financial application/lead broking before regulatory readiness.
- A giant page-per-feature expansion before the core platform contracts are enforced.
