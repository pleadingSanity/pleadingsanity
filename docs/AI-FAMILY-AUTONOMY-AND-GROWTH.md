# Pleading Sanity — AI Family autonomy and growth contract

Owner: Shane Cooper. Repo: pleadingSanity/pleadingsanity. Status: **implementation plan, not evidence that external agents are connected**.

## Non-negotiable
Preserve Arron's single voice, GPT → Claude → Gemini → Grok failover, runChain, crisis signposts, Forget Me, local speech, existing PWA, free sanctuary and existing Owner Workbench. Do not send public Arron conversations to coding agents. No tracking, sale of personal data, ads in sanctuary, or unapproved costs. Default extra spend £0.

## Owner-only autonomous development
1. Owner submits an authenticated task with scope, allowed files and budget.
2. Read latest main, AGENTS.md, AI_HANDOFF.md, existing code and open PRs; claim file ownership to prevent collisions.
3. Dispatch sanitised, minimum-necessary task context to **actually connected** agents only. GPT plans; Claude implements; Gemini reviews UI/integrations; Grok independently tests. Never pretend an unavailable provider responded.
4. Prepare narrow diffs, run scripts/audit-site.py, relevant browser/security tests and GitHub Actions.
5. Auto-merge only explicitly authorised, low-risk, reversible changes with passing checks and rollback. Require Shane's review for auth, privacy, roles, crisis logic, Arron voice, AI chain, payments, spending, publishing and outreach.
6. Verify deployed SHA and production smoke tests; record commit, exact files, tests and blockers in AI_HANDOFF.md. Stop on regressions.

Existing .github/workflows/continuous-quality-audit.yml already runs daily and on PRs/pushes. Extend deterministic checks before enabling autonomous coding; a scheduled check is not a continuously running agent. Limit concurrent jobs, retries, token use and costs.

## Owner-only AI Family coordination
Reuse netlify/lib/workbench.ts, netlify/functions/owner.mts and owner.html. Add task IDs, provider availability, state, review notes, proposed diff, budget, approval, CI and deploy evidence. Do not replace the database or public Arron endpoint. Connect providers only with authorised server-side credentials and hard cost caps.

## Publication and outreach safety
Audit netlify/functions/ai-family-daily.mts and Arron's existing 'put this live' workflow: drafts must wait for founder preview/approval. No automatic messages to other AI providers, businesses or creators; prepare drafts and request recipient-specific approval. Reserve verified official badges against impersonation. Rate-limit Night Table room creation while keeping guest play.

## Creative Studio
Produce original podcast scripts, episodes, storyboards, thumbnails, captions, transcripts and licensed media. Render actual video/audio only when connected production tools exist. No republishing others' videos with superficial changes, no unlicensed music, no voice cloning without consent, no fabricated testimonials. Require content/safety/licence review and founder approval before publishing. Children's content requires extra safeguards.

## Ethical funding
Free core tools forever. Explore voluntary support, merchandise, grants, creator partnerships and clearly disclosed non-intrusive sponsorship outside sanctuary chats. Downloads, searches and sign-ups do not automatically produce revenue. Use privacy-respecting aggregate counts only; do not sell individual analytics or personal information. The first-1000-creators 90% share needs documented eligible revenue, terms, accounting and approval before payouts.

## Priorities
P0 verify live Arron, crisis and room sync. P1 close AI publication approval bypasses and add room rate limits. P2 build owner-only agent task queue with capability checks. P3 reviewable GitHub PR automation and deployment verification. P4 licensed creative production and ethical revenue pilots.

Every report must label features VERIFIED, IMPLEMENTED BUT UNTESTED, BLOCKED or PLANNED.