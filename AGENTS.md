# Pleading Sanity — shared agent operating contract

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
