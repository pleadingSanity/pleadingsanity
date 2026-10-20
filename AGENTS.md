# Pleading Sanity — shared agent operating contract

**First:** read `AI_HANDOFF.md` from "START HERE" to the newest entry, and add your own dated entry when you finish.

Owner: Shane Cooper. Canonical production: https://pleadingsanity.co.uk
Canonical repository: pleadingSanity/pleadingsanity.
Principles: Evolution, Not Erasure. Love Over Money. One Family.

## Agent coordination
GPT: plan, review architecture, identify security risks and coordinate work.
Claude: inspect existing implementation, patch code, run tests, report evidence.
Gemini: inspect Firebase and AI integrations, propose and validate changes.
Grok: draft original creative concepts, editorial ideas and social copy.
Copilot: assist with code review and small isolated fixes.
These are role assignments, NOT proof that an external agent is connected or running.

## Non-negotiable rules
- Keep the existing static Netlify + GitHub architecture and Firebase backend.
- Never expose API keys, access tokens, private journals or user data in commits or logs.
- Do not claim an integration works until exercised end-to-end.
- Preserve existing PWA install URLs, service-worker scope, existing public links and accessibility.
- Keep sanctuary, crisis support, journal and core companion features free.
- No automatic production deploys for unreviewed AI-generated changes.
- Any creator revenue percentage is a proposal until accounting, eligibility and terms are implemented and approved.
- Avoid replacing working features with placeholders. Keep changes small and reversible.

## Standard cycle
1. Read CLAUDE.md, .github/copilot-instructions.md and relevant source.
2. Record baseline, affected routes, existing tests and dependencies.
3. Identify one highest-impact issue; use a dedicated branch.
4. Fix root cause, not symptoms. Add regression coverage where feasible.
5. Run syntax, mobile, accessibility and security checks relevant to the change.
6. Open a PR with changed files, evidence, remaining risks and rollback notes.
7. Merge only after checks and owner approval for security, auth, payment or data changes.
8. Verify production after deployment; record any regression.

## Priority backlog
P0: leaked secrets, authentication, Firestore rules, private data and broken core routes.
P1: Arron backend reliability, login recovery, mobile accessibility, game boot failures.
P2: creator live workflows, clips, moderation, content publishing and payouts.
P3: imagery, performance budgets, visual polish and optional enhancements.

## Audit reporting
Report observed vs assumed, exact reproduction steps, changed files, tests run,
production verification and blockers. Never fabricate tool access or test results.

## Single-house coordination and anti-duplication rule (2026-10-20)
- The **only** live source is `pleadingSanity/pleadingsanity` main. Other repositories and prototype projects are not production; do not create new repositories, deployments, domains or paid dependencies without founder approval.
- **Before adding any feature or document:** inspect existing pages, scripts, docs, branches and open PRs; reuse and improve the best verified implementation. No duplicate pages, tools, AI instruction files or near-identical handoffs.
- `AGENTS.md` is the durable shared operating contract; `AI_HANDOFF.md` is the single append-only cross-agent status log. Use existing feature docs or a PR discussion for details. Avoid creating more per-agent sync documents.
- An AI may not claim consensus or contact with another AI unless an actual review, comment or commit exists. Independent reviews can be recorded on the same PR; conflicting views must remain visible until resolved. A prompt alone grants no account access.
- Proposed features require a user benefit, safety/privacy check, zero-extra-cost plan, mobile/accessibility impact, test/rollback plan, and explicit approval for spending, public user-data changes, payment, or high-risk deployments.
- Build for long-term stewardship: human-controlled ownership and recovery, tested backups, documented credentials recovery without storing secrets, and safe maintenance. Never claim an AI will autonomously run the service forever.
