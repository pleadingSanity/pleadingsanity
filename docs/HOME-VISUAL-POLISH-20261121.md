# Home Visual Polish — 2026-11-21 (Phase 1C, additive)

Branch: `feat/home-visual-polish-20261121` off `b674d8e24f`.
Scope: make the home page feel alive and on-brand without deleting any existing
asset, route, text or paid AI call. Main was not merged from this branch.

## What changed

1. **Optimized hero imagery (local, free image processing)**
   - `assets/images/r2-2026/hero-cosmic.jpeg` (1.28 MB) now has WebP derivatives
     `assets/images/optimized/hero-cosmic-1600.webp` (156 KB) and
     `hero-cosmic-1200.webp` (99 KB) used via `<picture>`; the JPEG stays as
     fallback and was not deleted.
   - `images/sanctuary-aurora-cabin.jpg` (113 KB) gained
     `assets/images/optimized/sanctuary-cabin-1200.webp` (104 KB) with JPEG fallback.
2. **Palette regrade of the six showcase cards**
   - Source images under `assets/images/showcase/*.webp|jpg` carried purple/magenta
     casts against the locked palette (teal `#00fff0`, sky `#38bdf8`, amber
     `#f59e0b`, silver; no purple/pink/indigo).
   - New `assets/images/optimized/showcase/<name>-brand.webp` files map luminance
     through a navy → teal-slate → sky → teal → amber tritone and blend 45% with
     the original detail. Original files remain in place as fallbacks; revert the
     `<picture>` source or background URL to restore them exactly.
3. **Home markup, additive only**
   - `index.html`: six "What would help you today?" cards received inline SVG
     icons and the `hp-card` class; a three-item trust chip row (free forever,
     no account needed, UK crisis routes) sits under the hero actions.
   - New stylesheet `css/home-visual-polish.css`: card borders/lift, chip pills,
     framed Midland artwork, light-theme variants, `prefers-reduced-motion`
     disabled lift. No existing rule removed.
4. **No new dependencies, no network calls, no environment values.**

## Validation

- `python3 scripts/audit-site.py` — 89 pages, static targets and JS blocks pass.
- `node --test tests/prints.test.js` — 23/23 pass.
- `node --test tests/ps-studio-catalog.test.mjs` — 5/5 pass.
- Local headless screenshots at 1440px and 390px reviewed: cards iconified,
  artwork framed, no purple casts, no layout breakage.

## Reusable pipeline notes

- Regrade script logic (temporary, not committed): PIL HSV/L luminance LUT;
  stops `(0.00 #0b0f19) (0.42 #123a4a) (0.68 #38bdf8) (0.90 #00fff0)
  (0.965 #7de2de) (1.00 #f59e0b)`, blended 0.45 with the source, WebP q82.
- Future batches should keep originals in place and ship optimized/derivative
  files under `assets/images/optimized/`; never overwrite source art.

## Held for explicit approval (paid / external)

- AI-generated replacement hero art or new card illustrations require explicit
  approval before any paid image generation call.
- `legallyinsane.co.uk` hosting/TLS and provider keys remain owner-gated.
