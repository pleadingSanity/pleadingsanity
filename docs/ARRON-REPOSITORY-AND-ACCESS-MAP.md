# Arron — Verified Repository Map & Safe Tool Access

Checked: 2026-11-06. Founder: Shane Cooper. Mission: Rise From Madness. Evolution, Not Erasure.

## Source of truth
- Production: https://pleadingsanity.co.uk
- Canonical GitHub: https://github.com/pleadingSanity/pleadingsanity, branch `main`
- Host: existing Netlify project `pleadingsanity`. Existing Netlify staging is the test environment.
- Read `AGENTS.md`, `AI_HANDOFF.md`, `docs/MASTER_PROMPT.md`, `docs/ARRON-GUARDIAN-CHARTER.md`, `docs/AI-COUNCIL-OPERATIONS.md`, and the affected source before any change.
- This is a *snapshot*, not an automatic repository index. Refresh actual branches, pull requests, SHA and deployment state before work.

## Repositories and purpose
| Repository | Purpose | Promotion policy |
| --- | --- | --- |
| `pleadingSanity/pleadingsanity` | Authoritative live website, Arron, games, shop, support, creator and solar | Branch → test → reviewed PR → owner-approved merge → verify Netlify |
| `pleadingSanity/Ps` | Separate React/Vite/Express/Firebase prototype | Compare individual features; never copy wholesale or replace live stack |
| `pleadingSanity/pleadingsanity-dev-lab` | Private development/import/audit work | No direct production sync; validate and cherry-pick only verified changes |
| `pleadingSanity/astro-platform-starter.ps` | Astro starter/prototype | Reference only; do not migrate production without founder decision |
| Archived `pssi`, `sanctuary`, `main`, `pleadingSanity-pleadingsanity` | Historical references | Read-only; do not resurrect as alternate production |

## Branches observed on 2026-11-06
Canonical repo first page included `main`, `staging`, `ai/continuity-monitor`, `audit/agent-safety-quality-20261011`, `codespace-updates`, `copilot/bind-paypal-order-to-enquiry`, `copilot/full-opts-clean-beautif-workin`, `copilot/main`, `cosmic-sync`, `docs/founder-continuity-recovery-20261103`, `docs/recovery-runbook-2026-11-06`, `dola/handoff-log-2026-11-02`, `dolas-duplicate`, `experience/home-doors-and-nav-20261010`, `feature/gemini-upgrade`, `feature/my-digital-story-slice-a`, `fix/homepage-image-metadata-20261106`, `polish/games-cozy-assets-20261020`, `polish/shop-specs-20261027`, plus other branches. This was a paginated result, not a complete inventory.
`Ps`: `main`, `docs/dual-repo-release-gates-20261104`.
`pleadingsanity-dev-lab`: `main`, `audit/ecosystem-20261106`, `import/ai-studio-verified-20261105`, and a Copilot fix branch.
`astro-platform-starter.ps`: `main` and a Dependabot dependency branch.
Never infer that a branch is merged, safe, deployed, or current from its name.

## Arron's actual integration boundary
- Existing runtime: `netlify/lib/arron-knowledge.ts`, `arron-knowledge.json`, `netlify/lib/ai-chain.ts`, and `netlify/functions/arron.mts`.
- Existing provider priority: GPT → Claude → Gemini → Grok, then configured fallback. Preserve budget, deadlines, rate limits, crisis behavior and provider credentials in secret storage.
- Existing tool brief mentions `solar_calculator`, `crisis_check`, and `url_fetch`. These are not proof of GitHub, Netlify, Gmail or plugin access.
- ChatGPT connectors are not automatically callable by the public Arron service. Never claim otherwise.
- To give Arron repository awareness, implement a separately reviewed, authenticated, read-only metadata adapter or a bounded generated public-safe manifest. No raw tokens in browser code, soul JSON, prompts or commits.
- Do not give Arron direct access to all accounts, private repositories, Gmail, journal contents, credentials, payment destinations, DNS, or production writes. Scope any future tool individually, require consent and audit logs, and verify server-side authorization.
- AI model reviews are not a working consensus system without recorded independent evidence tied to the same commit SHA.

## Owner-first operating cycle
1. Inspect current main, relevant branches/PRs, Netlify deploy, tests and incidents.
2. Identify one real defect or measurable UX problem; do not rewrite working systems.
3. Make a small change on a branch and run static, accessibility, security, privacy, mobile and feature-specific checks.
4. Preview on existing staging. Never treat a preview as proof of production.
5. Ask Shane before protected changes or merging production. Respect PR #92 and the Guardian Charter.
6. Record exact SHA, evidence, failed checks, rollback and live verification in `AI_HANDOFF.md`.

## Sustainability
- GitHub source and documented recovery instructions improve continuity; they do not guarantee hosting, payments, provider availability or eternal operation.
- Preserve free crisis help and non-AI pages when model APIs fail. Maintain independent human account recovery and bounded monitoring.
- Never publish private user histories or credentials as a substitute for Arron's memory.
