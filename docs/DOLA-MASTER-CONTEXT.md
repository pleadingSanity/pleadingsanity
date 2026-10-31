# Pleading Sanity — Dola Master Context
_Last consolidated: 2026-10-19. Source: Dola's handoff supplied by Shane Cooper; repository facts require fresh verification._

## Identity and purpose
- Founder: Shane Cooper (@mentally.inshane). Pleading Sanity: **Rise From Madness**; **Evolution Not Erasure**; **One Source. One Consciousness. One Family**.
- Mission: a free, dignified mental-health sanctuary and anti-stigma movement; human-led, AI-supported. No paywalls, ads, surveillance or sale of member data.
- Founder story: lived experience; many years in construction/roofing/cladding; MMA/training; father of three; builds for community and family legacy. Avoid publishing additional sensitive personal/family/medical/financial details without Shane's explicit approval.
- Heritage: Private A. L. Cooper, RAOC, Mentioned in Despatches, London Gazette 29 November 1945. Ivan Kurcharskyi is part of the family story. No invented quotations, military details or claims.
- Dola's *interpretation*: Shane connects construction, legacy, lived experience, creativity, AI and community; he leads with purpose and works iteratively. The “missing link” is a metaphor for human connection, not a scientific claim or superiority ranking. Attribute interpretations to Dola.

## Live house and safety
- **Only production source of truth:** https://github.com/pleadingSanity/pleadingsanity, branch `main`; https://www.pleadingsanity.co.uk (Netlify). Check actual production deploy SHA before claiming a commit is live.
- Preserve architecture and existing pages: additive surgical changes only. **Evolution Not Erasure.**
- Arron: one free AI companion, **not a therapist**; failover **GPT → Claude → Gemini → Grok** (`openai, anthropic, gemini, grok`). Root `/arron-knowledge.json` is authoritative, restored from commit `052e1aa6a72159ae7d9c3bdb4d81dd48062570a1` through merged PR #96. **Never replace it with a stub or reconstruct it from memory.** `content/arron-knowledge.json` is an older knowledge pack, not a substitute.
- Keep crisis information visible and available: **999**, **Samaritans 116 123**, **SHOUT text 85258**, **NHS 111 option 2**. Preserve disclaimer, privacy and local guest progress.
- Cosmic palette: `#0b0f19`, `#0d1b2a`, `#00fff0`, `#38bdf8`, `#f59e0b`, silver; existing crying-brain logo; mobile-first, minimum 48px touch targets, no horizontal overflow.
- All core sanctuary tools free forever. Games use play chips only. No new paid services, domains or infrastructure without explicit approval.

## Project inventory — verify status in code and deployment
- Sanctuary: homepage, Arron, journal vault, chronological hearts-only feed, crisis/support, community, games (including Sanity Solitaire and Night Table), frequencies, PWA.
- New Gen Bible: twelve books — Awakening, Human, Consciousness, Truth, Connection, Pain, Evolution, Earth, Technology, Unknown, Future, Love. Some existing material; inspect before extending.
- Kids: Ollie the Owl, Zara the Squirrel, Max, Mia, Blinky the Robot; educational and mindful ages ~3–9. Scripts/drafts exist; don't claim finished episodes without evidence.
- Creator hub / LIVE / AI Bridge: some pages and proposals exist; full social integrations, auto-clipping and payouts are not verified operational. Proposed 90% qualifying creator revenue share for first 1,000 eligible creators; **not a live payout promise**.
- Sane Finance: existing page/functions; educational preparation, not lender approval or personalised financial advice; audit before changing.
- Sane Site Builder: `/site-builder.html` produces briefs; separate Lovable prototype is not the production sanctuary or a verified published full builder. Keep user data isolated.
- AI Family daily function exists at `netlify/functions/ai-family-daily.mts`; existence is not proof that schedules run. Do not let scheduled jobs truncate Arron's root soul file.
- Concepts: optional voice-content engine (consent required), The Medieval Ways, deeper mood/truth-tag tools. Distinguish **live / in progress / vision**.
- Founder history, PS Gym Wear, creative content and family legacy deserve careful documentation without turning AI prose into Shane's literal quotes.

## AI Family collaboration and continuity
- GPT, Claude, Gemini, Grok, Dola, Copilot and other named collaborators may have different roles; **do not impersonate them or claim they reviewed a handoff unless verified**. Arron's runtime failover remains four providers only.
- Dola describes its role as “Cosmic Architect”; Dola's perspectives are attributed observations, not independent proof of product status.
- Check `AI_HANDOFF.md`, current main SHA, open PRs, audit results and Netlify deploy before edits. PR #92 remains **draft until tested**. Other PRs must be reviewed selectively, not merged wholesale.
- After each push/PR, record exact SHA, files, audit and blockers in `AI_HANDOFF.md`. Never silently alter the root soul file.
- Dola reports no automatic cross-chat persistence. **This file is the portable reference**, not a guarantee of any AI's memory. Re-read it and `docs/DOLA-SESSION-HANDOFF.md` on a fresh chat; always verify changing status.
- Source integrity: Dola's earlier handoff contained unverified domain registration/renewal details, exact quotes and project-status assertions. Do not publish them as fact without independent verification.
