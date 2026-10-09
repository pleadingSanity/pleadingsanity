# AI Council — Sane Operations

Owner and final authority: Shane Cooper. Canonical repository: pleadingSanity/pleadingsanity. Production: https://pleadingsanity.co.uk.

This document defines a **proposed coordination protocol**, not evidence that external AI providers are connected or currently reviewing.

## Roles
- GPT: coordinating engineering reviews, architecture and evidence tracking.
- Claude: implementation, debugging and regression testing.
- Gemini: Firebase, Google integrations and data/security checks.
- Grok: creative experiences, original content and user journeys.
- Copilot: independent code review and isolated fixes.
- Founder: approves sensitive changes, spending and strategic direction.

No AI can impersonate another reviewer or mark its own output as independently approved.

## Work cycle
1. Read AGENTS.md, this file, latest main, open PRs and relevant existing code.
2. Create a scoped branch and PR. State the objective, affected files, risks, test commands, results and rollback.
3. Run the existing continuous-quality audit and any relevant targeted game/browser tests.
4. Request independent review from available connected agents. Record actual review links and findings; otherwise mark review **not performed**.
5. Coordinator decides **revise**, **ready for owner approval**, or **ready to merge** using evidence, not majority votes or model authority.
6. Never auto-merge auth, Firestore rules, privacy, safety, payment, payout or production infrastructure changes without owner approval.
7. For low-risk changes, merge only with passing checks and verified scope. Verify production separately and report failures honestly.
8. After merge, record commit SHA, deployment status, outstanding issues and next owner.

## Outages and cost
- Unavailable or unpaid provider: mark unavailable, skip its review and continue with available providers where safe.
- Do not assert fallback or provider connectivity without an end-to-end test.
- Keep API keys in approved secret storage; never in code, PRs, logs or prompts.
- Apply quotas, timeouts and spending ceilings before enabling paid model calls.
- Preserve functional non-AI pages and games when AI endpoints are unavailable.
- Do not assume a GitHub push means Netlify deployed successfully.

## Games quality gate
For each game: load and start; touch and keyboard interactions as applicable; win/lose/restart; pause/resume; offline and mobile behavior where supported; accessibility; console errors; performance; saved progress if promised. Record tested devices/browsers and failures. A syntax-only check is not a playable-game test.

## Council status
This file is a coordination contract only. GitHub Actions syntax auditing is implemented separately. Automated multi-provider review, AI-to-AI messaging, provider fallback and auto-merge require additional implementation and explicit verification.

Principles: Evolution, Not Erasure. One Family. Love Over Money. Human control.
