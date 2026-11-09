# DOLA_MEMORY.md — Single Source of Truth for All AIs
_Last updated: 2026-11-06. This file is the canonical reference. If anything here conflicts with chat history, this file wins._

## Project
- **Site:** https://pleadingsanity.co.uk — free mental-health sanctuary. "Rise From Madness. Evolution, Not Erasure. One Source. One Family." Built by Shane Cooper (Midlands, UK).
- **Repo:** pleadingSanity/pleadingsanity (org capital S). `main` branch protected (no direct push; branch + PR; self-merge via API works, no required reviews).
- **Netlify site ID:** 31c56935-32d5-4932-8a63-2db881842090. Preview deploys currently error account-wide (exit code 4, pre-existing); main builds fine.
- **Current main HEAD:** 1f5db86 (as of 2026-11-06). Latest ready deploy: 6aee4455f214.

## Open PRs (2026-11-06)
- **#244** (draft, Shane's final release): polish/final-shane-release-20261106, 48aa26de. DO NOT MERGE — wait for Shane's exact merge phrase.
- **#243** (draft, founder clarity): polish/founder-clarity-20261106, 22c2672. 6 deploy-tied check failures (unfixable from code).
- **#185** (founder succession docs): dirty, extensive conflicts — flagged, not rebased.
- **#180** (Dola log banner): rebased to b13f7d1, mergeable=True. Remaining: account-level security scans.
- **#176** (PayPal binding): rebased to 107f063, mergeable=True. PayPal code uses env vars only, no hardcoded secrets.
- **#78** (stale 17d): flagged, not closed.
- **#92** (Arron AI chain circuit-breaker): CLOSED — never touch.

## Hard Rules (absolute)
1. NEVER merge #244 or any PR without Shane's exact merge phrase.
2. #92 quarantined — closed, never modify.
3. Crisis numbers EXACT and tappable: 999 (tel:999), Samaritans 116 123 (tel:116123), SHOUT 85258 (sms:85258), NHS 111 (tel:111), 0800 1111 (tel:08001111), 0808 2000 247 (tel:08082000247), findahelpline.com.
4. No secrets in repo (nfp_, github_pat_, ghp_, sk-). Tokens live in chat/env only — rotate after use.
5. Payments/auth/private journals/API keys/provider ordering — UNCHANGED.
6. Shane's manifesto words — UNALTERED (only intros/outros added).
7. Three brands separate: Sanctuary ≠ Solar ≠ Radio.
8. No purple/violet/lavender/indigo in brand imagery. No text/letters/logos in generated images.

## Brand Palette
Deep space blues (#0a1a3a, #102a5c), teals (#0d9488, #2dd4bf), golds (#f5c542, #fbbf24), magenta accents (#ec4899, #db2777).

## Arron Hard Limits (verified in code)
Never diagnoses, never prescribes, never claims human/consciousness, never gives legal/medical/financial advice as fact (always "I'm an AI, check with a professional"), never shares data (local only), "forget everything" = instant wipe. Crisis detection → tappable crisis links. Disclaimer "not a doctor or therapist, cannot replace clinical care" present on all Arron pages.

## Key Pages (always 200 when healthy)
/, /insane-solar, /solar-ai-office, /ai-social, /shed-card-game, /arron (live path; /arron-health is 404), /arron-app.html, /crisis.html, /support.html, /support-us.html, /insane-radio.html.

## Known Pending (not blocking)
- 5 pages missing og:title (cosmic-reflections, creator, insane-solar, memory-ocean, number-nebula).
- 1 page missing meta description (safety.html).
- Netlify preview deploys error account-wide (Shane: check dashboard — likely dependency/build-image issue).
