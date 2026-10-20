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

## 2026-10-20 — Dola full characters/levels/extras brief, implemented as honest previews
- **Poker** `94ffd7e06e1434f2eb02aa13d608a4d208accd61`: under the existing H1, added the existing local `assets/games/ps-night-tavern.svg` as a responsive hero and an optional, keyboard-native expandable panel with **7 character concepts** (Ollie, Zara, Bruno, Blinky, Max, Mia, The Host), **5 proposed table worlds**, and **6 extras**. Portraits reuse `assets/games/characters/` where present; roster is explicitly *not* seven playable seats. Future world unlock requirements and leaderboards/tournaments/chat are **COMING SOON**, not functional. Existing table, friend-room buttons, guide, chips and game engine preserved. No invented 960/1020 chip values or hourly reward logic.
- **Solitaire** `4d92bda64f9ad82cce5e9eaff6fbab53f7e8f1a9`: under the H1, added local `assets/games/ps-starlake.svg` responsive hero and optional expandable panel showing **5 proposed worlds (levels 1–70)**, the **four existing playable modes** (TriPeaks, Klondike, FreeCell, Pyramid), **Spider marked COMING SOON**, and **6 extras** tied to existing controls or explicitly future. The 70-level campaign, achievement system and unlockable skins are **not implemented**. No gameplay JS changed.
- **Intentional deviations from supplied snippets:** avoided broken `/images/games/*.jpg` links by reusing existing source-controlled original SVGs in `/assets/games/`; did not imply non-existent Spider mode, tournament services, new poker opponents, automatic unlock logic or timed chip payouts. No new repo, paid dependency or tracking. Existing crisis and not-therapy copy unchanged.
- **Tests pending:** verify new HTML and asset paths in a real browser at 360×800 and 1440×900; verify images, keyboard/expand-collapse, contrast, reduced motion and no horizontal overflow; regression-test all four Solitaire modes and poker actions/chip accounting; check Netlify production SHA. GitHub continuous quality audit alone is not an end-to-end game test.

## 2026-10-20 — Master Asset Bible phase 1
- Reference: `docs/GAME-ASSET-BIBLE.md` (founder-provided ten Dola AI concept images, **not** production image assets); full roster, table/world design, status and acceptance checklist recorded there. No watermarked art uploaded.
- `poker.html` commit `4a59fb616d6e577c6757f0099e2ac6f676b49706`: CSS-only contrast, hero, 48px tap targets and focus treatment; Poker logic unchanged.
- `sanity-solitaire.html` commit `dfeff4034dc41e26ca824c25a3f2416b9a0d6c5f`: CSS-only readability, mobile spacing and focus/touch polish; Solitaire logic unchanged.
- **Existing** character/world preview panels retained. Proposed levels, Spider, extra seats, seasonal skins, tournaments, leaderboards, challenges and achievements remain **CONCEPT / COMING SOON**, not falsely marked LIVE. Do not overwrite existing gameplay progress or invent chip allocations.
- **Unverified:** Android and desktop visual regressions, all game actions, support routes and deployment SHA. CI passing is not a browser test. £0 spent. PR #92 remains draft.
