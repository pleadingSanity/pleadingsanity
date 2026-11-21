# Phase 1A — Orbital foundation notes (2026-11-20)

Branch: `feat/orbital-phase1a-20261120`. Additive first slice of the Phase 1
solar-system direction from `docs/MASTER-UPGRADE-BLUEPRINT.md`. No existing
section, route, data file or asset was removed or rewritten.

## What this slice adds
- `css/orbital-system.css`: design tokens, glass panels, five-planet grid,
  central sun card, chip links, hover micro-interactions, reduced-motion rules
  and Calmer View overrides. Palette stays dark teal/sky/amber/silver.
- `js/orbital-calmer.js`: persists `localStorage.ps-calm`, applies a static
  low-glow `calm-view` class, defaults on under `prefers-reduced-motion`, and
  makes no network calls.
- `index.html`: an additive "Move through the sanctuary" section above the
  footer with the central Sun (Arron + crisis) and five planet groups mapped to
  existing pages; the Calmer View toggle lives in that section header.
- This note document.

## Page mapping used in the planet chips
- Sanctuary: Arron, crisis, Journal Vault, frequencies, meditation, Kids.
- Sound & Studio: Insane Radio, Songs, Rap, Creator Hub, Live, Music Studio.
- Community & Philosophy: feed, Quote Wall, New Gen Bible, AI Social, Wisdom,
  Movement.
- Play & Mind: all games, Solitaire, Night Table, Truth Tag, AI Studio, Write.
- Practical & Studio: Shop, Prints, P.S Studio, Sane Finance, Insane Solar,
  Sanity Law.

All targets were verified as existing files before push.

## Validation
- `node --check js/orbital-calmer.js`
- `python3 scripts/audit-site.py` — 89 pages, static targets, duplicate IDs and
  script blocks pass.
- `node --test tests/prints.test.js` — 23 pass / 0 fail.
- `node --test tests/ps-studio-catalog.test.mjs` — 5 pass / 0 fail.
- Secret scan on added paths: no printer serial, LAN IP, token or account value.

## Accessibility and safety
- Toggle exposes `aria-pressed`, has a 48px target and visible focus ring.
- Every planet chip is a real existing link; the section does not duplicate or
  remove current navigation.
- Crisis entry remains in the central Sun card and on the existing crisis route.
- Animations are disabled under `prefers-reduced-motion` and in Calmer View.

## Deferred to Phase 1B (next approved slice)
- Roll the orbital shell into a shared dock across public pages rather than
  leaving the overview on the home page.
- Scroll-linked transitions and custom SVG orbital paths between planet views.
- Page-level landing refinements per planet; global image/`srcset` work belongs
  to Phase 2 and is not bundled here.
- No paid provider calls, external fonts, trackers or model APIs were added.

## Gate
Merge remains subject to the owner's explicit merge phrase. Production `main`
is untouched by this branch.
