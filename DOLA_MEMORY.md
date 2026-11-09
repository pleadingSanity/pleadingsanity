# DOLA_MEMORY.md — Single Source of Truth for All AIs
_Last updated: 2026-11-10. This file is the canonical reference. If anything here conflicts with chat history, this file wins._
## Project
- **Site:** https://pleadingsanity.co.uk — free mental-health sanctuary. "Rise From Madness. Evolution, Not Erasure. One Source. One Family." Built by Shane Cooper (Midlands, UK).
- **Repo:** pleadingSanity/pleadingsanity (org capital S). `main` branch protected (no direct push; branch + PR; self-merge via API works, no required reviews).
- **Netlify site ID:** 31c56935-32d5-4932-8a63-2db881842090. Preview deploys currently error account-wide (exit code 4, pre-existing); main builds fine.
- **Current main HEAD:** (see git log — 2026-11-10, includes #256 Arron knowledge mirror + Dependabot). 85 HTML pages. IndieWeb live (h-card, 5 rel-me, webmention+pingback endpoints discoverable). Turso (libSQL) wired: /api/turso-health LIVE (ok:true), /api/profile-songs auth-gated (Netlify Identity), profile songs sync with localStorage fallback.
## Open PRs (2026-11-09)
- **#252** merged. **#256** (Arron knowledge mirror) merged.
- **#185** (founder succession docs) — orphan branch, no merge base ("refusing to merge unrelated histories"). Shane to close manually. NOT force-merged.
- All other PRs merged/closed. Open: #185 orphan (Shane), #258 codeql Dependabot (PAT workflow scope).
## Env Vars (Netlify, verified)
- **Set & working:** TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (verified via /api/turso-health). SUPABASE_OAUTH_CLIENT_ID/SECRET ×2 (Management API/OAuth only — NOT DB keys). AWL_API_KEY, OPENROUTER. xAI_KEY present but EMPTY.
- **MISSING (Shane to provide):** SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (DB client keys — OAuth creds do NOT enable DB access; supabase-memory.ts Arron memory remains off). GEMINI_API_KEY (Gemini fallback skipped). PAYPAL_CLIENT_ID/SECRET/MERCHANT_ID (#176 verify-paypal returns 503 until set). GROK_API_KEY/xAI_API_KEY (Grok skipped gracefully in ai-chain.ts; order GPT→Claude→Gemini→Grok preserved).
## Hard Rules (absolute)
1. NEVER merge any PR without Shane's exact merge phrase. Full authorization was given 2026-11-09 and consumed; future merges need fresh phrase.
2. #92 quarantined — closed, never modify.
3. Crisis numbers EXACT and tappable: 999 (tel:999), Samaritans 116 123 (tel:116123), SHOUT 85258 (sms:85258), NHS 111 (tel:111), 0800 1111 (tel:08001111), 0808 2000 247 (tel:08082000247), findahelpline.com.
4. No secrets in repo (nfp_, github_pat_, ghp_, sk-). Tokens live in chat/env only — rotate after use.
5. Payments/auth/private journals/API keys/provider ordering — UNCHANGED.
6. Shane's manifesto words — UNALTERED (only intros/outros added).
7. Three brands separate: Sanctuary ≠ Solar ≠ Radio.
8. No purple/violet/lavender/indigo in brand imagery. No text/letters/logos in generated images.
9. Healing frequencies allowed ONLY: 174, 285, 432, 528, 741, 963 Hz. 396/417/639/852 disallowed — removed from aura-hz.html and frequencies.html (2026-11-09).
## Brand Palette
Deep space blues (#0a1a3a, #102a5c), teals (#0d9488, #2dd4bf), golds (#f5c542, #fbbf24), magenta accents (#ec4899, #db2777).
## Arron Hard Limits (verified in code)
Never diagnoses, never prescribes, never claims human/consciousness, never gives legal/medical/financial advice as fact (always "I'm an AI, check with a professional"), never shares data (local only), "forget everything" = instant wipe. Crisis detection → tappable crisis links. Disclaimer "not a doctor or therapist, cannot replace clinical care" present on all Arron pages.
## Key Pages (always 200 when healthy)
/, /insane-solar, /solar-ai-office, /ai-social, /shed-card-game, /arron (live path; /arron-health is 404), /arron-app.html, /crisis.html, /about.html#support (support.html removed → 301), /support-us.html, /insane-radio.html, /feed.html, /live.html, /profile.html.
## Known Pending (not blocking)
- 5 pages missing og:title (cosmic-reflections, creator, insane-solar, memory-ocean, number-nebula).
- Netlify preview deploys error account-wide (Shane: check dashboard — likely dependency/build-image issue).
- webmention.io signup pending (dev email available; requires confirmation link click — manual step for Shane).
- Grok "on full time" blocked by missing GROK_API_KEY.

## Palette correction — 2026-11-09
The Brand Palette line above is kept as history. It is superseded. The locked palette is background `#0b0f19`, teal `#00fff0` and `#38bdf8`, amber `#f59e0b`, and silver. `#ec4899`, `#db2777`, and the other non-locked hexes in that older line (`#0a1a3a`, `#102a5c`, `#0d9488`, `#2dd4bf`, `#f5c542`) are not the locked set. Do not paint purple, violet, indigo, pink, or magenta, including `#ff4d8d`, `#ff00ff`, `#ff66ff`, and `#000103`.
