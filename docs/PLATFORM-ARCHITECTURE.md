# Pleading Sanity — Human + AI Platform Architecture

Status: foundation specification, 8 October 2026.

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
