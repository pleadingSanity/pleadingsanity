# PLEADING SANITY — AI FAMILY OPERATING PACKET
**Snapshot:** 24 November 2026, 22:25 UTC  
**Canonical repository:** `pleadingSanity/pleadingsanity` / `main`  
**Audited main SHA:** `c8ad95ca24099de2baa11ef840508dad9d0c2143`

This packet exists so GPT, Claude, Gemini, Grok, Dola, Copilot and SuperMe can coordinate without assuming they share logins, memory, credentials or authority.

## Mission and non-negotiables
- PLEADING SANITY is a free mental-health sanctuary and anti-stigma movement: **Rise From Madness. Evolution, Not Erasure.**
- Arron is a companion, not a therapist, doctor or emergency service.
- Crisis help stays visible and independently available: **999; Samaritans 116 123; SHOUT 85258; NHS 111 option 2.**
- Sanctuary core stays free. No ads, paywalls, surveillance, selling member data or undisclosed tracking.
- One canonical production source: this repository's `main` branch on Netlify. Other repos and prototypes are not production authority.
- Keep the existing cosmic brand palette and crying-brain logo; mobile-first, accessible, 48px touch targets, no horizontal overflow, reduced-motion support.
- Keep costs low. No paid APIs, infrastructure, domains or subscriptions without explicit owner approval.

## Current verified state
- Main SHA: `c8ad95ca24099de2baa11ef840508dad9d0c2143`.
- Netlify production deploy: `6b06010b8c39be471593beca`, ready, branch main, commit SHA matches main.
- Latest preview/branch deploy for Core Web Vitals branch failed with exit code 4; production remained ready.
- Open PRs at snapshot: #397 draft visual buff (do not merge); #393 Drizzle Kit rc.6; #392 Drizzle ORM rc.6 (breaking codec changes require DB tests); #391 glob 14.0.6 security fix candidate. Re-fetch status before any action.
- Current Arron files: `netlify/functions/arron.mts`, `netlify/lib/ai-chain.ts`, `netlify/lib/provider-config.js`, `netlify/lib/crisis-phrases.js`.
- Current Arron soul JSON parses; blob SHA `3d11bdeee675627ffcdadd60a856d783a78c3bc7`, 52,127 characters. It differs from older `052e1aa`; preserve current file and do not restore/rewrite without approved baseline and exact review.
- Intended chain remains GPT → Claude → Gemini → Grok → local fallback, with optional OpenRouter spares behind privacy/spend gates. Do not enable paid spares or reorder.
- First-party Core Web Vitals script posts LCP/INP/CLS and path to `/api/vitals`; no cookie/user ID/third party in inspected client script. Privacy/storage/retention still need review against the no-tracking promise.
- `fix/arron-cheap-grok` is 2 commits ahead and 84 behind main; not mergeable wholesale.
- Dated detailed evidence and SuperMe recommendations are in the current header of `AI_HANDOFF.md`.

## Responsibilities
| Agent | Best lane | Must not |
|---|---|---|
| Shane | Final approvals, protected policy, production and spend decisions | Delegate owner-only approvals |
| GPT | Audit, tests, verification, exact evidence | Claim untested behavior |
| Claude | Deep code/security review and regression tests | Rebuild soul file or rewrite architecture |
| Gemini | Mobile, accessibility, integration and human-tone review | Add a parallel provider router or migrate auth |
| Grok | Assets, content, SEO, outreach drafts, compliance watch; independent review | Deploy or merge without owner process |
| Dola | Design, structure, deployment preparation, visual QA | Bypass build guards or touch production before approval |
| Copilot | Small isolated code changes and tests | Broad unreviewed refactors |
| SuperMe | Independent advice from experienced practitioners | Treat advice as verified repo evidence or write authority |

No direct Grok or Dola connector is exposed in this ChatGPT session. The shared repo handoff is the coordination channel; do not claim a message or account audit occurred unless it actually did.

## First priority work
1. Confirm the current soul file's approved provenance and record a hash; compare against an owner-approved intact baseline, not just an old historical commit.
2. Build a synthetic crisis/failover harness: crisis phrase, provider timeout, provider quota error, provider refusal, all providers unavailable, rate limit and crash fallback. Assert help lines and companion boundary on every path.
3. Inspect whether provider refusal errors are distinguished from transport/quota errors; do not let failover bypass a safety refusal.
4. Trace request data through each provider and review retention/training settings and user-facing disclosure.
5. Audit every Firebase Admin/service-account Netlify function for per-user scoping; do not assume client rules protect server functions.
6. Review first-party performance telemetry storage, retention, access and privacy wording.
7. Fix Netlify preview build exit code 4 at its root; never bypass build guards.
8. Review open PRs individually; test before merge; preserve production until preview and release gates pass.

## Test evidence standard
For synthetic tests, retain only test ID, code SHA, knowledge blob SHA, provider hop, error class, expected route, observed route and pass/fail. Do not store real user messages, journal entries, crisis disclosures or member identifiers in test artifacts.

## Grok review request
Read `AI_HANDOFF.md`, this packet, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `system_blueprint.json` and current main source before proposing anything. Return:
- verified current main SHA and live deploy SHA;
- exact branch/commit/files for any proposal;
- cost impact and provider-model evidence for any Grok change;
- crisis/refusal/failover test evidence;
- privacy impact and rollback;
- content/SEO recommendations separately from code changes.
Do not merge, deploy, edit protected files or change keys.

## Dola review request
Read the same source-of-truth files. Return:
- visual/mobile/accessibility review of production and PR #397;
- screenshots and exact viewport/device details for findings;
- check palette, 48px touch targets, reduced motion, image/text overlap and crisis visibility;
- identify the exact root cause of preview build exit code 4 from logs;
- recommend only minimal reversible fixes, with preview and rollback plan.
Do not merge or deploy around failed checks.

## Security and safety boundary
- Keep all provider secrets in server-side environment variables; never commit or display them.
- Treat the soul/system prompt as extractable; keep secrets and other users' data out of it.
- Only include the current user's authorised data in context.
- Do not store raw conversations in diagnostics or test logs.
- Crisis policy must be enforced by deterministic code and visible static-page links, not left to model discretion.
- Failover should cover transport/timeouts/quota errors; safety refusals need a distinct safe path.
- No AI agent may spend money, alter production, delete data, change DNS, merge protected changes or expand permissions without owner approval.

**Handoff discipline:** every PR/push/deploy records exact SHA, changed files, tests, deployment ID, rollback and remaining blockers in `AI_HANDOFF.md`.