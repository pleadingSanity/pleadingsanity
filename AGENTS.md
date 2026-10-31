# Pleading Sanity — shared agent operating contract

**First:** read `AI_HANDOFF.md` from "START HERE" to the newest entry, and add your own dated entry when you finish. The paste-ready connector for every AI and every builder is `docs/MASTER_PROMPT.md`. It points here. It is not a second brain and it does not prove any model is connected.

Owner: Shane Cooper. Canonical production: https://pleadingsanity.co.uk
Canonical repository: pleadingSanity/pleadingsanity.
Principles: Evolution, Not Erasure. Love Over Money. One Family.

## Agent coordination
GPT: plan, review architecture, identify security risks and coordinate work.
Claude: inspect existing implementation, patch code, run tests, report evidence.
Gemini: inspect Firebase and AI integrations, propose and validate changes.
Grok: draft original creative concepts, editorial ideas and social copy. On the website, Grok is the fourth Arron provider in `netlify/lib/ai-chain.ts` (order unchanged: GPT, Claude, Gemini, Grok). The function looks for `GROK_API_KEY`, then `xAI_KEY`, then `XAI_API_KEY`, and calls `https://api.x.ai/v1` with model `grok-4.7`. A consumer Grok subscription does not by itself set that key, grant deployment access, or share this chat with Arron. If no key is present, Grok is skipped and the chain continues. Do not print key values or make a paid call unless Shane explicitly approves the spend.
Dola: organise design structure, brand presentation and creative proposals; cross-check the current approved brief with GPT and Grok using source evidence.
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

## One house only (2026-10-28)
- The one app is Netlify site `pleadingsanity` at https://pleadingsanity.co.uk (www redirects there) from GitHub `pleadingSanity/pleadingsanity`. Do not create another Grok app, Netlify site, Vercel project, or repository for this site unless Shane says so in that chat.
- Spare door, not a second house: Vercel `html-starter-pleadinsanity-2179` serves pleadingsanity.uk. Vercel `html-starter-pleadinsanity` only redirects www.pleadingsanity.uk to the house. Do not delete those two unless Shane says the spare domain can go.
- Netlify `pleadingsanitystaging` is the test door of this same house, not a new site.
- Archived and not the house: `sanctuary`, `main`, `pleadingSanity-pleadingsanity`. `pssi` is a separate optimizer, not this website. Do not revive them as the public site.


## Shared session handoff — Dola, Grok and every contributor
- Start each session by refreshing main, AGENTS.md, AI_HANDOFF.md and the relevant open PRs. State the source commit and actual tools/access. Public read access does not grant write, account or deployment access.
- Reuse existing feature documents and status records. Before editing, record the bounded task and affected files in the PR or existing log; check whether another contributor is already changing them. Do not create a second master brain or per-agent status system.
- Dola may propose structure, design and clear copy. Grok may draft voice, social content and partnership messages. GPT checks accuracy, specifications, architecture and verification. Roles do not certify an independent review; record the real reviewer and evidence when one occurs.
- Keep approved factory specs authoritative. Campaign renders are not production artwork. Do not turn proposed features, edition examples, revenue percentages or performance targets into live promises.
- Finish with changed files, exact commit/PR, checks actually run, preview/live status, unresolved issues and the next responsible person. Append public-safe findings to AI_HANDOFF.md; preserve concurrent entries rather than overwriting them.
- Shane reviews changes before they go live. Sending a prompt is not a technical connection or background service. If access is absent, return a reviewable handoff and identify the missing capability. Keep private personal history, family contact details, exports and credentials out of this public repository.
