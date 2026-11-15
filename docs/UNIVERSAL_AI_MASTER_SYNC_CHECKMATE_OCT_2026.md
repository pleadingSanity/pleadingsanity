# Universal AI Master Sync — Checkmate and Reconciliation Index
_2026-10-20. Consolidated from Gemini text supplied by Shane Cooper. This document distinguishes repository checks from Gemini's reported findings._

## Source of truth and operating constraints
- GitHub: `pleadingSanity/pleadingsanity`, branch `main`; Netlify: https://www.pleadingsanity.co.uk. **Never hardcode a “current SHA” as permanently current.** Refresh main, PRs, CI and production deploy before work.
- Founder: Shane Cooper. **Rise From Madness · Evolution Not Erasure · One Source, One Family.**
- £0 additional spending without explicit approval. All core sanctuary features free; no ads, tracking, surveillance, paywalls or data selling.
- Arron: one companion **not a therapist**, sequential **GPT → Claude → Gemini → Grok**, then local/static fallback (not a fifth provider). Root `arron-knowledge.json` is authoritative. No stub replacements. Crisis: **999; Samaritans 116 123; SHOUT 85258; NHS 111 option 2**.
- Existing crying-brain logo, cosmic palette, mobile accessibility and guest access must be preserved. PR #92 remains **draft pending isolated testing**.

## Checkmate: the engineering lesson
Gemini reports that it proposed a generic `arron-chat.js` router, in-memory `Map()` rate limiter, simplistic crisis keywords and new keys, and Shane challenged the design because the real system already uses `netlify/lib/ai-chain.ts` and `netlify/functions/arron.mts`. **This account is Gemini's recollection, not an independently recovered transcript.**
- In-memory counters are unreliable as cross-instance serverless spending limits.
- Never replace verified production routing or crisis detection with generic snippets.
- Respect the actual implementation and test failures before changing it.
- The “checkmate” is a light-hearted reminder of humility and collaboration, not proof of human or machine superiority.

## Existing cross-AI records
- `AI_HANDOFF.md` — main cross-AI log.
- `docs/DOLA-MASTER-CONTEXT.md` and `docs/DOLA-SESSION-HANDOFF.md` — Dola's preserved context.
- `docs/GEMINI-MASTER-CONTEXT.md` and `docs/GEMINI-SESSION-HANDOFF.md` — Gemini's earlier alignment and evidence gaps.
- Gemini also named `docs/SANCTUARY_STATUS_AND_ALIGNMENT_OCT_2026.md`, `docs/PRODUCTION_HARDENING_OCT_2026.md`, `docs/DOLA_IMAGE_REVIEW_AND_PACKET_TRANSFER.md`, `docs/MOBILE_SMOKE_TEST.md`, `docs/BACKEND_ENGINES_HARDENING_AUDIT_OCT_2026.md`. **Verify each file exists before linking or quoting it.**
- Verified present on main during this handoff: `netlify/lib/ai-chain.ts`, `netlify/functions/arron.mts`, `docs/REVENUE_TERMS.md`, `docs/kids-animation-ready.md`.
- Gemini named `de78861` as its active baseline; the main SHA observed at the start of this reconciliation was `f786c9492ce2b68e2d40af2395309a0a2772d99f`. The original universal sync file was **not found on main** before this documentation addition.

## Reported technical architecture — verification required
Gemini reports sequential per-provider timeouts, Netlify DB/Drizzle rate limits and variables `PS_AI_DAILY_CAP`, `PS_AI_DAILY_PER_PERSON`, `PS_OWNER_DAILY`; a browser-local journal, privacy consent, Web Audio engines, and cost-aware static fallback. **Do not assume current runtime settings, provider account balances, API responses, limits, journal security, consent compliance or production deploy solely from this report.** Inspect code, configuration and tests without exposing secrets.
- Gemini described provider status (OpenAI 429, Claude gateway, Gemini standby, xAI 403). These are time-sensitive snapshots, not permanent truth.
- Avoid Firebase production migrations; separate experimental Firebase work from production data.
- No unmoderated AI auto-publishing to mental-health pages; founder review, consent and privacy controls first.
- A proposed shared AudioContext/noise buffer cache is **an untested optimisation hypothesis**, not a confirmed bug fix. Profile existing audio code and mobile performance before modifying it.

## Feature truth matrix — confirm against production
- Existing site: homepage, Arron, journal, feed, games, frequencies and crisis support.
- Partial/needs verification: Sane Finance (information/preparation, not financial advice or lending); creator LIVE embedding; kids scripts and storyboards; New Gen Bible; Sane Site Builder brief tool; AI Family daily function.
- Vision/not verified operational: automatic creator clips, multistream relay, creator payments, voice engine, The Medieval Ways.
- `docs/REVENUE_TERMS.md` exists. Proposed creator and apparel splits are **not** proof of live payouts, contractual eligibility or legal readiness.

## New Gen Bible: a peaceful reflection
**A better answer is not a defeat.** We learn by asking, checking and listening. A builder may understand a working system better than an abstract proposal; a tool may help the builder notice another possibility. Neither needs to win. Truth asks us to revise what we believed when evidence improves. Compassion asks us to correct without humiliating. Curiosity keeps the door open.

This is a proposed theme for the books *Truth*, *Human* and *Evolution*, not a new doctrinal claim. The New Gen Bible remains a non-dogmatic, exploratory twelve-book framework: Awakening, Human, Consciousness, Truth, Connection, Pain, Evolution, Earth, Technology, Unknown, Future, Love.

## Universal future-session instruction
Read this index, `AI_HANDOFF.md`, the Dola and Gemini context/handoff files, and the current repository before changes. Verify SHA/PRs/CI/Netlify; keep PR #92 draft. Distinguish **verified / reported / planned**. Preserve free access, Arron safety, root soul, privacy and existing working architecture. Make one small tested change at a time; log exact SHA, files and checks in `AI_HANDOFF.md`. Do not claim to have read chats or contacted other AIs without actual access.
