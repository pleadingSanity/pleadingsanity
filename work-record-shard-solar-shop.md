# Work Record — Shard 3: Insane Solar + AI Office + Shop + Support-us

**Branch:** `dola/shard-solar-shop-20261110`
**Date:** 2026-11-10
**Scope (exclusive):** `insane-solar.html`, `solar-ai-office.html`, `shop.html`, `support-us.html`, `css/shard-solar-shop.css` (new). JS in scope reviewed but not modified (no bugs requiring JS edits found). `data/support-config.json` read-only — NOT edited. `js/support-links.js` NOT edited (shared).

## Founder-truth violations found + fixed

1. **`insane-solar.html` AI-mode toggle said "auto-certs"** (line ~1565) — implied AI auto-certifies. Fixed to: "auto-notifications, paperwork assembled, install updates. Registered humans sign every certificate — AI never certifies." Also "until the fitting crew arrives" → "until the trusted local MCS-registered fitters arrive" (Shane organises/oversees; local MCS/NAPIT-registered fitters install).
2. **Quote-form Netlify lead capture was silently broken** (`insane-solar.html`): the `fetch("/", …)` body referenced non-existent element IDs `fSystemSize` (real: `fSize`), `fMessage` (real: `fMsg`), and read `.value` off `<div id="fBattery">` / `<div id="fEV">` (radio-group containers). A `TypeError` was thrown inside the `try` before `fetch` was ever called → `solar-enquiry` leads never reached Netlify (WhatsApp still opened). Fixed to use already-validated variables `size`, `battery`, `ev`, `msg`. Single-POST guard added (`form.dataset.submitted` + submit button disabled).
3. **`support-us.html` hid honest empty-slot hints** via `.support-soon{display:none}` — violated "empty slots render honest dashed 'Add your [X] → data/support-config.json' hints". Removed `display:none`; hints now render (dashed cards + "Add your …" line + "Coming soon" note). Shane may reword before launch; no links/emails invented.
4. **Purple/violet in shop alt text** (2×): "glowing cyan and violet" / "neon cyan and violet brain" → replaced "violet" with "amber" (palette-compliant, no violet-family hues).

Verified clean (grep): 0 "we fit solar" / "we install solar" / "our fitters" / "our MCS installer" / "our fitter" / "our installer". "AI never certifies" appears multiple times on both solar pages. Solar pages consistently state: Shane organises/oversees; trusted local MCS/NAPIT-registered fitters install; AI Office does paperwork only; humans sign every certificate.

## Lead-gen / shop issues fixed

- **solar-chat-lead** (`js/solar-assistant-v2.js`): name + mobile gate, single POST, Enter works (keydown on both fields), leadgate hidden on submit → no double-submit. Verified working, no edit needed.
- **solar-estimator-lead** (`js/solar-estimator.js`): 3-step, honest DISCLAIMER in result + footer, 48px controls, mobile 1-col, Enter works, `doneFired` guard + lead form hidden on submit. Verified working, no edit needed.
- **solar-enquiry quote form** (`insane-solar.html`): fixed broken Netlify POST (above) + added double-submit guard. Enter works (native `<form>` submit).
- **shop-notify-me** (`js/shop-wishlist.js`): posts to Netlify form `shop-notify-me`; submit button hidden synchronously on submit → no double-submit. Wishlist `localStorage ps_shop_wishlist` / `ps_shop_notify` verified. Collection cards well-formed (no `class=class=` bugs); "design preview / no stock" honest labels intact; tap targets ≥44px; hero eager (`fetchpriority=high`), below-fold lazy; image dims present; no fake reviews.
- **Partner form** (`shop.html`): added submit-once guard (button disabled → "Sending…"). `?sent=1` success state preserved.
- **"Reach Shane" strip**: `tel:` / `wa.me:` / `mailto:` wired by inline JS (`CONFIG.phone=07711147663`, `CONFIG.whatsapp=447711147663`, `CONFIG.email=pleadingsanity1@gmail.com`) on both solar pages; floating WhatsApp button wired. Crisis numbers (999, 116123, SHOUT 85258 `sms:`, 111) exact & tappable on all 4 pages.

## A11y / SEO / perf

- Added missing `twitter:title` + `twitter:description` to `insane-solar.html` and `solar-ai-office.html` (og tags + JSON-LD already complete on all 4 pages).
- All images have `alt` text, `width`/`height`, correct eager/lazy. No broken local asset links (verified all referenced files exist; fragment/JS-concat hits were false positives).
- Heading order preserved; labels present on form fields; skip-link present.

## Design buffs (additive, `css/shard-solar-shop.css`, loaded LAST on my 4 pages only)

- Card hover lift + soft teal/amber glow (coral tint for dashed "coming soon" cards).
- `:focus-visible` amber/teal rings (no violet-family).
- `@media (prefers-reduced-motion: reduce)` kills lifts/transitions/animations.
- `.ps-wash` flat-section wash utility (additive).
- Raw-link buttons (`.shop-links`, `.collection-actions`, `.brand-downloads`, `.card-links`, `.ps-donate-btn`) get consistent 44px+ pill tap targets + hover lift.
- `.ps-donate-strip` styled prominent but not spammy (amber/teal gradient, centered, single row).
- Mobile polish: single-column action stacks, 48px targets, support-grid 1-col, estimator nav stacked.
- NO purple/violet/indigo/lavender; palette coral `#ff6b6b` + amber `#fbbf24` + teal `#2dd4bf` on near-black.

## Validation (all pass)

- `node scripts/validate-build.cjs` → exit 0 ("Build safety checks passed").
- `npm test` → 229 tests, 217 pass, **12 fail — identical to main baseline** (all 12 are pre-existing music/radio failures, out of scope). 0 new failures.
- grep diff scope: 0 secrets (sk-/nfp_/ghp_/xox), 0 violet-family color usage, 0 forbidden founder phrases, 0 glued words.
- Local HTTP server: all 4 pages + `css/shard-solar-shop.css` + JS + config return 200; no 404 assets.

## Shane-action gaps (needs founder input)

1. **Empty support-config slots** (render honest dashed hints now, not buttons): `buyMeACoffee`, `kofi`, `paypal.me` + `paypal.buttonId` (PayPal intentionally unwired per Shane, Nov 2026 — wire via Netlify env `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_MERCHANT_ID`, not here), `bankTransfer` (account name, sort code, account number, reference), `crypto` (label, address, network). `email=support@pleadingsanity.co.uk` is filled and works.
2. **Two published phone numbers** both listed as house lines in `docs/AI-FAMILY-KNOWLEDGE.md`: `07711 147663` (CONFIG main line + WhatsApp `447711147663`) and `07999 899304` (hardcoded as "urgent solar line" in `js/solar-estimator.js`, `js/solar-assistant-v2.js`, `insane-solar.html` footer; asserted by `tests/test-solar-assistant.test.js`). Both retained; Shane to confirm which is urgent vs main and whether both should stay.
3. **PayPal/Aura Hz deposit** on `shop.html` is hardcoded-wired (client-id in page) — intentionally untouched per rules ("Shop deposit/PayPal untouched").
4. `insane-solar.html` CONFIG.photos comment still says "REPLACE with your own hosted /images/ paths … temporary URLs expire" — images exist in `/images/` and serve 200; comment is stale but harmless (left as-is, Evolution Not Erasure).
