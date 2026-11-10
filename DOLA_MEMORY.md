# DOLA_MEMORY.md — Single Source of Truth for All AIs
_Last updated: 2026-11-10. This file is the canonical reference. If anything here conflicts with chat history, this file wins._

## 2026-11-10 — PR CLEANUP (ready for GPT + Claude at 4:35am)
- **PR #185 CLOSED** (founder succession docs, orphan branch): all 5 docs already exist on main (FOUNDER_CONTINUITY_AND_RECOVERY, FAMILY-LEGACY-PLAN, FOREVER-MOVEMENT-BLUEPRINT, LEGAL-GOVERNANCE-FRAMEWORK, BRAND-IP-SECURITY-PLAN). Orphan branch only added stale HTML pages that would break 301 redirects. Nothing to merge. Comment left.
- **PR #269 still DRAFT** ("Fix solar chat repeat submissions and keyboard controls"): API would not convert draft→ready. Minor polish to js/solar-assistant-v2.js + tests. **Claude at 4:35am: mark Ready for review + merge (one tap).** Safe — builds on Dola's lead-gate.
- **Open PRs: only #269.** Everything else merged/closed.
- **GPT back in the loop** (Shane confirmed). Resume prompt in chat (claude-resume-prompt-5h.md) applies to GPT too — paste it.
- **PayPal: skip for now** (Shane said). PAYPAL_CLIENT_ID/SECRET still unset → verify-paypal returns 503 (graceful).
- **Deploy still blocked** (Netlify not picking up main). Trigger: app.netlify.com → Deploys → Trigger deploy, or Claude Netlify MCP at 4:35am.

## 2026-11-10 — FOUNDER IDENTITY UPDATE (all AIs must use this)
- **Shane Cooper = builder, roofer, visionary (Midlands).** He RECENTLY STOPPED fitting solar panels and is BACK TO FULL-TIME ROOFING. Focus is the Pleading Sanity movement; end goal = peace and unity for all.
- **Insane Solar repositioned:** NOT "we fit solar". Shane organises + oversees; trusted local crews fit; AI Office handles paperwork. Copy softened from "we fit/our crew/installer-led" to "we specify/we organise/trusted local fitters/roofer-led". Do NOT revert to "we fit solar" — it is factually wrong.
- **feed.html buff:** fixed `class=class=` malformed attribute on all feed items (they were unstyled), added 3 image feed items using real roof photos (images/solar01/03/05.jpg).
- **Deploy still blocked (Netlify not picking up main pushes).** Trigger manually in app.netlify.com → Deploys → Trigger deploy, or via Claude Netlify MCP.

## 2026-11-10 — LATEST (Dola buff pass while Claude offline — read this FIRST)
- **Code merged & verified on GitHub main:** PR #266 (cache fix), #267 (solar chat lead-gate: name+mobile before AI answers, posts to Netlify form `solar-chat-lead`), #268 (js/solar-assistant.js → solar-assistant-v2.js cache-bust). Plus empty commit 7811498 to retrigger deploy.
- **DEPLOY BLOCKED (Netlify-side):** production still serves old build (no leadgate, /js/* still immutable). Tried: workflow_dispatch on deploy.yml → no run created (fine-grained PAT lacks Actions:write scope). Empty-commit push to main → Netlify Git integration not firing. Known account-wide preview-deploy error (exit 4) may also affect main. **Fix: Shane triggers in app.netlify.com → Deploys → Trigger deploy, OR Claude (Netlify MCP) triggers when back.** Once deployed, verify: insane-solar.html contains `ai-chat-leadgate` + `solar-assistant-v2.js`, js file contains `captureLead`, /js/* Cache-Control = must-revalidate.
- **Site audit (all clean):** 14 key pages all 200. No broken internal links (support.html/kids-series.html/transparency.html all have 301s in _redirects). 5 pages previously missing og:title now all have og:title+og:description. 0 secrets in repo (Netlify secret scan).
- **Claude now has: Netlify MCP + GitHub connector (full powers).** When back, it can: trigger deploy, set env vars (PAYPAL_CLIENT_ID/SECRET/MERCHANT_ID missing → verify-paypal 503; MAX_TOKENS_ARRON 1000→1600; check Firebase prod vars; Gemini/Grok model slugs — verify OpenRouter slug before changing), read solar form submissions (solar-enquiry + solar-chat-lead). Resume prompt is in this chat (claude-resume-prompt-5h.md).
- **SECURITY — still pending Shane:** revoke (1) OpenRouter key pasted in Claude chat (openrouter.ai/keys), (2) GitHub PAT pasted in Dola chat (still valid as of this session). PAT is Contents:Read/Write only — no Actions, no Admin.
- **Do NOT re-build:** insane-solar.html, ai-social.html, js/solar-assistant-v2.js, verify-paypal.mts — done & verified. Add around them only. Evolution, Not Erasure.

## 2026-11-10 — Dola session: cache-header fix, PayPal audit, security rotation (read this first)
- **FIXED (PR open):** `netlify.toml` had DUPLICATE `/js/*` + `/css/*` cache headers — a 1-year `immutable` block overrode the `must-revalidate` rules, so pushed fixes never reached visitors. Removed immutable js/css blocks (kept `/data/*.json` 3600). JS/CSS now always fresh. Merge PR to deploy.
- **PayPal audit (verify-paypal.mts):** Code is SAFE — server-side checks `status===COMPLETED` AND `50.00 GBP`, rate-limited, replay-protected, returns 503 gracefully. **Only gap:** returns 503 until Shane sets `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (+`PAYPAL_MERCHANT_ID`) in Netlify env. Not a code bug.
- **SECURITY — ROTATE NOW:** (1) OpenRouter key Shane pasted into Claude chat — revoke at openrouter.ai/keys. (2) GitHub PAT pasted in this Dola chat (still valid 2026-11-10) — revoke at GitHub → Settings → Developer settings → Tokens after this PR pushes.
- **Insane Solar chat widget (~line 1778):** No lead-gate — fires `/api/arron/chat` directly. Claude proposed name+number capture before widget fires — open enhancement, not a bug. No Google Maps API key/box exists on main's solar pages (Claude likely saw a draft); nothing to remove.
- **Claude social pack:** `insane-solar-social-pack.html` built as chat artifact (5 TikTok scripts, 4 FB posts, 4 WhatsApp statuses, 4-week calendar + audit) — NOT in repo. Shane to film Script 1 (60s roof/doorstep) for first leads.
- **Live:** `/insane-solar.html`, `/ai-social.html`, `/images/solar01-08.jpg` all 200. Repo pleadingSanity/pleadingsanity, main protected (branch + PR only).

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
