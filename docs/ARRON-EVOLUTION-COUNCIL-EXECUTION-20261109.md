# PLEADING SANITY — ARRON EVOLUTION & AI COUNCIL EXECUTION BRIEF
**Date:** 2026-11-09 · **Status:** implementation brief, NOT deployed functionality

## Read before changing code
Read `AGENTS.md`, `AI_HANDOFF.md`, `docs/MASTER_PROMPT.md`, `CLAUDE.md`, `docs/AI-COUNCIL-OPERATIONS.md`, `arron-knowledge.json`, `netlify/lib/ai-chain.ts`, `netlify/lib/provider-fallback.js` and current tests. Refresh `main`, PRs, issues, deploy SHA and environment *names* (never values). Follow the existing chain and actual code rather than stale descriptions.

## Mission and absolute constraints
Keep the mental-health sanctuary free, accessible, private and mobile-first. Arron is a companion, **not a therapist**. Crisis access: 999, Samaritans 116 123, SHOUT 85258, NHS 111 option 2. Preserve GPT → Claude → Gemini → Grok provider priority, sequential failover, owner-approved costs, offline safety, official crying-brain identity and cosmic palette. No secret, personal mailbox, journal, contact list or social account ingestion without scoped authorisation. Never make self-modifying production agents or grant unbounded write access. No paid service, mass merge, DNS change or architecture replacement without explicit scoped approval.

## Arron master-level upgrades — additive and testable
1. **Provider health:** add redacted per-hop outcome, latency, timeout, skip reason and fallback telemetry; expose only aggregate non-sensitive owner status; never leak prompt or keys. Verify actual production requests separately from unit tests.
2. **Resilience:** test missing keys, gateway outage, 401/429/5xx, malformed output, timeout, exhausted budget and all-provider failure. Keep deterministic, compassionate offline fallback with crisis information. Respect rate limits and cost ceilings.
3. **Knowledge integrity:** compare current soul JSON with the exact historical source and known good versions by paths and content hashes; restore missing *verified* fields only, preserve newer additions; prevent CI/guardian truncation and add regression fixtures. Never reconstruct soul content from memory.
4. **Authorised council:** provide a server-side, auditable proposal → independent review → scoped approval → PR workflow. Roles: GPT verification/security; Claude implementation/tests; Gemini Firebase/integration checks; Grok original creativity/editorial review; Dola brand UX and production presentation. Every model receives only the minimum approved context. No imaginary live inter-AI channel.
5. **Permission matrix:** read-only monitoring and drafting may run unattended; safe repo edits require focused branch and CI; production merges, payments, secrets, private data exports and sensitive policy changes remain explicitly gated. All actions have actor, timestamp, scope, diff and rollback reference.
6. **Continuity:** update public-safe `AI_HANDOFF.md` after every PR with exact SHA, files, test results and blockers. Schedule monitoring through existing guardian instead of duplicate billable agents.
7. **Experience:** test Arron on 320/390/412px, keyboard and screen reader; verify visible companion disclaimer, crisis links, slow-network handling and no accidental message duplication.

## Full platform release gates
- Inventory all branches/PRs/issues and compare dev-lab, Ps and astro starter as read-only sources. Preserve archived repositories.
- Review payment binding (#176/#158), Arron outage (#150), radio/YouTube (#248), Sonos licensing (#231) and master release tracker (#232).
- Confirm live Netlify deploy SHA and domain routing for .co.uk and .uk, including www; independently test pages and API routes.
- Reproduce scanner failures from logs: Debricked empty token/unauthorised; APIsec missing credentials and possibly wrong project. Do not suppress checks or mislabel them as vulnerability findings.
- Test journals/auth/privacy, games, creator/live, radio, finance, solar, shop, PWA/offline, SEO, accessibility, responsive layouts and core web vitals.
- For every change: smallest patch, test first, screenshot or browser evidence where applicable, security scan, PR review, deployment verification and rollback plan.

## Grok — master creative/experience work order
Inspect existing site assets, brand rules, homepage, creator, games, journal and radio. Propose original, licensed/owned imagery, accessibility-friendly microcopy, truthful founder narrative and creator growth assets. Check each against official crying-brain mark, no invented marks, no unverified claims, no social clutter, no tracking. Submit an asset manifest (file path, provenance, licence, dimensions, alt text, placement), before/after evidence and a focused PR. Do not overwrite verified work or invent a working API connection.

## Dola — master design and release work order
Audit actual mobile screenshots at 320, 390, 412, 768 and desktop widths; touch targets ≥48px; contrast, focus, reduced motion, page hierarchy, broken assets, loading and empty states. Consolidate duplicated entry points only with redirects and preserved deep links. Verify creator, Arron, radio, shop and all games visually and functionally. Make surgical changes on a dedicated branch, document test outcomes and do not merge if release gates fail. Coordinate via PR comments and AI_HANDOFF.md, not assumed real-time chat.

## Definition of done
Only claim 'complete' when: current main SHA recorded; every changed file listed; automated and manual tests attached; no unreviewed security/payment changes; crisis/Arron/mobile regression tests passed; Netlify production SHA verified; public endpoints checked; rollback ready. Otherwise report **blocked** with exact reason and next safe action.
