# Work Record — shard-imagery (dola/r2-imagery-20261112)

**Date:** 2026-11-12
**Shard:** Imagery + Solar/Shop/Home polish (full-polish round, pleadingsanity.co.uk)
**Branch:** `dola/r2-imagery-20261112` (from `main` @ `fd6df1d`)
**Scope (exclusive):** `index.html` (hero + top sections), `insane-solar.html`, `solar-ai-office.html`, `shop.html`, `support-us.html`, plus new additive asset `css/shard-imagery.css`.

## image_gen unavailable → mission-sanctioned fallback

`image_gen` was review-blocked for this session: 3/3 benign prompts rejected
(abstract cosmic aurora, AI-office handoff, sanctuary cabin) with
"pre bottom line review not pass". Per the mission fallback rule, all "imagery"
in this shard is **pure CSS gradient/radial-glow art + inline SVG illustration**,
honestly captioned. No generated raster images were created; no `assets/images/*-2026/`
directories were needed. No fake photos, no stock passed off as real, no hotlinks.

## Files changed (staged explicitly, never `git add -A`)

- `css/shard-imagery.css` — NEW, additive, loaded LAST on the 5 pages only.
  Cosmic hero glow (`.shard-hero-glow`, respects `prefers-reduced-motion`),
  honest `.shard-art-label` / `.shard-preview-badge` badges, `.shard-illustration`
  frame, `.shard-honest-strip` solar disclaimer, `.shard-reach` tappable tel/WA
  chip row, `.shard-impact` support CTA, `.collection-card` hover polish,
  `.shard-notify-form` + `#notify-thanks` for shop. Palette stays teal/amber/coral
  on `#0b0f19`; purple intentionally not used.
- `index.html` — added `shard-hero-glow` decorative layer in hero; LCP sanctuary
  image (`sanctuary-aurora-cabin.jpg`) kept `loading="eager"` + dims, now also
  `fetchpriority="high"`; figcaption gains honest `Illustration` label.
- `insane-solar.html` — added inline SVG "AI Office paperwork → human installer
  handoff" illustration (captioned `Illustration`) above estimator; added
  `Reach Shane` tappable `tel:+447711147663` + `wa.me/447711147663` chip; added
  honest strip above install gallery clarifying: fitted by trusted local
  MCS/NAPIT-registered installers, Shane organises/oversees (no longer fits),
  AI never certifies — humans sign. No roof/panel imagery implying Shane's crew
  was added.
- `solar-ai-office.html` — same handoff SVG illustration (captioned
  `Illustration`); `Reach Shane` tappable chip in `#contact`. AI-never-certifies
  was already stated repeatedly in copy (verified, left intact).
- `shop.html` — added inline SVG activewear flat-lay illustration captioned
  `Design preview — no stock yet`; added visible `Notify me` form that POSTs to
  the existing Netlify `shop-notify-me` form (hidden definition at page bottom
  left intact; visible form has no `name` attr so Netlify does not register a
  duplicate, posts via `form-name` hidden field); `#notify-thanks` confirmation.
  Collection card hover polish via CSS. Existing "not finished stock" labels
  left intact.
- `support-us.html` — added impact CTA section with inline SVG community-lights
  illustration (captioned `Illustration`). Config-slot rendering verified
  honest in `js/support-links.js` (read-only, not touched): filled → buttons,
  empty → dashed "Add your X → data/support-config.json" hint. No links invented.

## Validation (all pass)

- `npm run build` → exit 0 (static site, no build step).
- `npm test` → 243 tests, 10 fail. Compared against clean `main` (stash): the
  **same 10 fail** (all radio/music/YouTube-player tests, owned by radio shard).
  **0 new failures.**
- grep on my 6 files: 0 secrets/tokens, 0 "we fit solar"/"we install", 0 "glued",
  0 invented testimonials/reviews/guaranteed savings/unverified accreditations.
- Local server curl: all 5 pages + `css/shard-imagery.css` → 200.
- No image hotlinks: all `src=` imagery is local; only remote `src=` are
  pre-existing PayPal SDK script tags (PayPal unwired per mission, skipped) and
  font/Tailwind CDN.
- Crisis numbers remain tappable where present (verified intact on solar/shop
  footers; not modified).

## Shane-action gaps (flagged, not invented)

1. **Support slots all empty/disabled** in `data/support-config.json`:
   Buy Me a Coffee, Ko-fi, bank transfer, crypto, PayPal. All render as honest
   dashed "coming soon" hints. Email is the only live channel. Shane to fill in
   when ready; PayPal via Netlify env vars only (never hardcoded).
2. **Two phone numbers on solar pages**: CONFIG uses `+447711147663` (used by my
   tappable chips); a hardcoded `07999 899304` appears in the estimator-lead
   footer note. Shane to confirm which is current — I did not change either.
3. **Gallery captions** in `insane-solar.html` CONFIG.photos still include
   "Same-day fit" / "overseen by Shane" phrasing. An honest strip now sits
   above the gallery; copy shard may want to reword captions to consistently
   say "fitted by trusted local MCS/NAPIT-registered installers, organised by
   Shane". Left intact (copy scope).
4. **Shop remains pre-sample / no stock**: all design-preview labels preserved.
   Notify-me form is now live for Shane to collect interest.
5. `image_gen` blocked — if Shane wants raster hero art later, a future shard
   can generate and drop into `assets/images/hero-2026/` etc.; CSS/SVG art here
   is fully local and honest.

## Not touched (per scope rules)

`insane-radio.html`, `music/**`, `netlify/**`, `js/arron*`, `js/radio*`,
`js/music*`, `js/support-links.js`, `js/solar*`, `site.css`, `styles.css`,
`netlify.toml`, `package.json`, `data/*.json`, `AI_HANDOFF.md`, `DOLA_MEMORY.md`,
any other `.html`.
