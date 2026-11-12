# Work Record — Shard 2: Sanctuary / Home / Games / Finance / Journal Audit

**Branch:** `dola/shard-sanctuary-20261110`
**Date:** 2026-11-10
**Scope (exclusive):** index.html, about.html, crisis.html, sanctuary.html, aura-hz.html, my-digital-story.html, cosmic-reflections.html, new-gen-bible.html, journal-vault.html, journal-vault-viewer.html, notes.html, games.html, finance.html, poker.html, sanity-solitaire.html, 404.html, offline.html, manifest*.json, twa*.json, css/shard-sanctuary.css (new).
**Not touched (out of scope):** functions, solar, shop, radio, music, live, social, arron*, app.html, movement.html (see gap note), netlify/**, js shared files, site.css/styles.css, AI_HANDOFF.md, DOLA_MEMORY.md.

---

## Issues Found + Fixed

### Crisis numbers (Hard Rule #2 — all tappable)
- **10 pages** with `ps-crisis-footer` sticky bar were missing **Childline `tel:08001111`**, **National Domestic Abuse Helpline `tel:08082000247`**, and **findahelpline.com**. Normalized all to the full 7-number tappable set: 999 / 116123 / SHOUT 85258 (sms:) / 111 / 08001111 / 08082000247 / findahelpline.com.
- **7 pages** had `SHOUT to 85258` as plain text (no `sms:` link): journal-vault-viewer, notes, finance, 404, games, poker, sanity-solitaire → fixed to `sms:85258`.
- **games.html** crisis bar was missing NHS 111 entirely → added.
- **index.html** hero: "Call **999**" was plain `<strong>`, not tappable → wrapped in `tel:999`.
- **index.html** had no full crisis strip → added `ps-crisis-strip` with all 7 tappable numbers in footer area.
- **offline.html** support-lines `<ul>` missing 3 numbers → added 3 `<li>` tappable entries.
- **journal-vault.html** inline "Need someone to listen?" only had Samaritans + SHOUT → expanded to all 7.
- **about.html** emergency section deferred Childline/domestic-abuse "remains on crisis page" (cop-out, no tappable numbers) → replaced with full tappable list, kept Crisis page button.
- **crisis.html** (dedicated page) missing findahelpline.com → added as a `.number` link in the help-card.
- **my-digital-story.html + cosmic-reflections.html** `crisis-strip` missing 3 numbers → normalized.
- **Result:** all 17 scope HTML pages now contain all 7 tappable crisis references (verified by grep).

### Healing frequencies (Hard Rule #6)
- **aura-hz.html** verified: only 174 / 285 / 432 / 528 Hz present (all within allowed set 174/285/432/528/741/963). No invalid frequencies. No fix needed.

### SEO / JSON-LD
- **4 pages missing JSON-LD** → added Organization + WebSite blocks: sanctuary.html, my-digital-story.html, cosmic-reflections.html, 404.html.
- All 17 pages already had og:title / og:description / og:image / twitter:card. Verified present.

### A11y
- **tap-targets.css ordering test failure introduced + fixed:** shard CSS must load *before* `css/tap-targets.css` on index.html (test requires tap-targets layer last, sizing-only). Swapped order on index.html. All 4 tap-target tests pass.
- All `<img>` have alt (verified 0 missing). All inputs/selects/textarea are implicitly labeled via wrapping `<label>` (verified). Skip-link present + target exists on all pages.
- shard CSS enforces `min-height:44px` floor on nav links, buttons, summary, social icons, footer links (mobile tap target floor).

### Content / copy
- **Glued words:** 0 real glued words. 3 grep hits (`</span>L`) were JS `innerHTML` strings (`<span class="live-dot"></span>LIVE`) — not copy, left intact.
- **"we fit solar":** 0 hits. about.html correctly states Shane "spent years fitting solar panels, but has recently gone back to full-time roofing" (stopped — correct per Hard Rule #4). Left intact.
- **Invented reviews/savings:** none found in scope.
- **Secrets:** 0 in diff (sk-/nfp_/ghp_/xox). **Purple/violet/indigo/lavender:** 0 in diff (one pre-existing alt-text mention "violet nebula-like pages" in journal-vault describes image content, not palette — left).

### Manifests / TWA
- manifest.json, manifest-finance.json, manifest-solitaire.json, twa-manifest.json, twa-finance-manifest.json — all valid JSON, no secrets. No edits needed.

---

## Buffs Added (additive only)

1. **`css/shard-sanctuary.css`** (new, loaded last on all 17 scope pages; loaded *before* tap-targets.css on index.html per test):
   - Card hover lift + teal glow + border-color shift on `.ps-home-note`, `.card`, `.panel`, `.feature`, `.sx-card`, `.help-card`, `.entry`, finance/game/tool cards.
   - `:focus-visible` teal outline ring on cards-as-links, buttons, crisis-strip links, footer links.
   - Raw-link-as-button → proper button affordance (`min-height:44px`, inline-flex, centered).
   - Mobile tap-target floor (≥44px) on nav, buttons, summary, social icons, footer links; crisis-footer font-size shrink at ≤600px.
   - `@media (prefers-reduced-motion: reduce)` kills all lifts/glow/transitions.
   - `.ps-wash` utility reuse note (class already exists in site.css — background-image only, zero layout shift).
   - `.ps-support-strip` + `.ps-crisis-strip` styling (amber/teal, coral-free palette: #ff6b6b coral var defined, #fbbf24 amber, #2dd4bf teal on #070a12/#0b0f19). No purple.

2. **Support strip** ("Keep the AIs online & the movement free" → /support-us + /shop) added to 9 appropriate pages (reusing existing `ps-donate-strip` markup, already styled; `js/support-links.js` untouched): aura-hz, my-digital-story, cosmic-reflections, new-gen-bible, journal-vault, journal-vault-viewer, notes, finance, sanity-solitaire. **Skipped** crisis.html, 404.html, offline.html (sensitive / error pages — support strip not appropriate there).

---

## Validation Evidence

- `node scripts/validate-build.cjs` → exit 0 ("Build safety checks passed.").
- `npm test` → 229 tests, 217 pass, **12 fail** — identical to main baseline (all 12 are pre-existing music/radio failures, out of scope). **0 new failures.** (One transient new failure "tap-target layer loads last" was introduced by shard-CSS order on index.html and fixed before final.)
- `git diff` grep: 0 secrets, 0 purple/indigo/violet/lavender, 0 "we fit solar", 0 glued words in added lines.
- Local static server (`python3 -m http.server`): all 17 changed pages + `css/shard-sanctuary.css` return **HTTP 200**. Broken-internal-ref scan: 0 real broken links (1 false positive: JS string concat in poker.html).
- 23 files changed, +144 / −19 lines (deletions are replacements of incomplete crisis-bar inner content with complete content — no working hook/class/ID removed).

---

## Shane-Action Gaps (for Shane, not blocking)

1. **`data/support-config.json` empty slots** (buyMeACoffee, kofi, bankTransfer, crypto) — currently render honest dashed hints. If Shane wants those buttons live, fill in the JSON; PayPal stays unwired by design (Nov 2026 call).
2. **movement.html** — named in the shard scope title ("home + movement + …") but **not** in the explicit exclusive-file list. Left untouched to avoid shard collision; confirm ownership.
3. Crisis numbers verified current as of 2026-11-10 (UK standard: 999, 116123, 85258, 111, 08001111, 08082000247, findahelpline.com). Re-verify if any service changes.
4. `css/shard-sanctuary.css` loaded on 17 pages; if future shared pages want the buff, add the `<link>` (before tap-targets.css on index/arron-app only).
