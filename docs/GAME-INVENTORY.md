# Pleading Sanity — Game Inventory
Updated: 2026-10-20. Source-inspection status, **not** production/browser certification.

## Existing games
| Experience | Source | Status | Next validation |
|---|---|---|---|
| Sanity Solitaire | `sanity-solitaire.html` | ⚠️ NEEDS REVIEW | TriPeaks, FreeCell and Pyramid interaction, wins, undo, mobile and keyboard |
| Night Table (play-chip poker) | `poker.html` | ⚠️ NEEDS REVIEW | Hand ranking, chip accounting, opponent turns, progress and keyboard |
| Brain Games hub | `games.html` | ⚠️ NEEDS REVIEW | All card destinations, thumbnails, mobile layout and statuses |
| Other game experiences | Linked from `games.html` | ⚠️ NEEDS REVIEW | Enumerate all pages and run full browser tests |

## Concepts
| Experience | Status | Scope |
|---|---|---|
| The Medieval Ways | 💡 IDEA / DESIGN REVIEW | Existing context mentions concept; no playable route verified. Preserve Village → Sanctuary → Journey proposal until lore and design reviewed |

## Changes committed
- `sanity-solitaire.html` — accessible, visible 48px Brain Games return link; commit `1841944`.
- `poker.html` — matching return link; commit `2baa4ba`.
- `poker.html` — restrict level progression to log messages identifying You as a pot winner; commit `4bc9729`. Source fix, runtime testing pending.
- This file records verification boundaries; it does not claim games are complete.

## Owner-editable controls
Navigation label, border colour and spacing are in the new labelled HTML navigation blocks near the opening `body` tag. Existing mechanics and scoring were not changed.

## Outstanding tests
- Desktop and small-screen interactive play, keyboard-only, screen-reader announcements, reduced motion and contrast.
- All card/hand outcomes, restart and save/load behaviour.
- Loading/error states and cross-page navigation.
- Compare deployed versions against main and confirm Netlify publication.

**No real-money gambling, ads, tracking or paid services added. PR #92 untouched.**

## 2026-10-20 — usability rebuild, phase 1
- Competitive reference review: TriPeaks titles emphasize one-tap rank matching, visible streaks and map progress; mobile poker titles emphasize a clearly explained Fold / Check / Call / Raise flow and readable seat layout. Use original PS art and code; do not copy proprietary assets or source.
- `sanity-solitaire.html`: first-visit, four-step interactive onboarding; persistent How to Play replay button; accessible dialog and Escape; commit `6b6e26f`.
- `poker.html`: first-visit, four-step Hold'em onboarding; persistent How to Play replay button; accessible dialog and Escape; commit `de1207f`.
- Status: ⚠️ NEEDS REVIEW. No browser-device validation completed yet. Further work: full-screen app-shell design, card/table art direction, richer non-flashing rewards, gameplay engine regression tests, mobile tap-target tests, install and offline verification.

## 2026-10-20 — approved art direction / original PS game skins
- Approved two-game reference artwork retained in conversation; **not** uploaded to production as a bitmap. The website uses original, lightweight, editable SVG environment art instead.
- `assets/games/ps-starlake.svg` — original mountain, lake, night sky illustration (`fca8e68`). `sanity-solitaire.html` — premium PS skin, readable light face-up cards, larger visual contrast (`c1c103f`).
- `assets/games/ps-night-tavern.svg` — original firelit tavern and poker table illustration (`2db5c15`). `poker.html` — premium tavern skin and differentiated betting actions (`7e3b616`).
- Preserve the source gameplay engines, 4 Solitaire modes, play chips, local storage, accessibility and support links. These are **visual updates**, not certified game-engine upgrades.
- **Review required:** open both pages on Android and desktop; inspect cards, overlap, contrast, mobile viewport, tutorial, undo, all-in, winning and losing; verify Netlify publish and PWA offline assets. The generated reference composition is not a literal in-game screenshot. Further design passes needed for avatars, rewards and full app-shell UI.

## 2026-10-20 — original character assets and game integration
- Added six new original vector character illustrations under `assets/games/characters/`: Ollie the Owl, Zara the Squirrel, Bruno the Bulldog, Blinky the Robot, Max and Mia. All six are source-controlled SVGs; concept raster image was not committed.
- `poker.html`: added character portrait art to all four existing seats; `3925e5f`. Seat labels remain the original bot names; portraits are decorative and not a claim of new AI opponents.
- `sanity-solitaire.html`: added Ollie and Zara companion tips; `fc66348`. No gameplay engine changes.
- **Pending:** real Android screenshots of deployed changes, avatar legibility, narrow-screen overlap, automated playthroughs, and production deploy verification. Full reference-art fidelity requires further original illustration work; do not label as finished.

## 2026-10-20 — shared original card-back asset integration
- `assets/games/ps-cosmic-card-back.svg` — original lightweight starfield card-back illustration (240×336 vector); commit `15848213c10a3b02e3254e6d103b86d20a506aa9`.
- `sanity-solitaire.html` — changed **only** the `.k-card.back` background URL to the shared local SVG; commit `89e3b67467387beff67089b0f2c578767164996a`.
- `poker.html` — changed **only** `.card.back` background URL to the same SVG; commit `9ffe58133a15e334fcc1b93fb51c37bc1a54f48f`.
- No card engine, scoring, user data, betting, routes or Arron code changed. The reference promotional concept image is **not** a production game screenshot and has not been used as an in-game bitmap.
- **Verification needed:** CI, Netlify deploy SHA, image load, card legibility on 360px mobile, full interactive gameplay and offline caching. These changes are not certified playthroughs. Remaining art: consistent character expression sets, original world backgrounds, accessible HUD and game-hub artwork route by route.
