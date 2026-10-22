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

## 2026-10-20 — original raster artwork batch
- `assets/games/characters/{ollie,zara,bruno,blinky,max,mia,nova,pip}-v2.webp`: 512px portraits. Matching `-128.webp` avatars. `assets/games/worlds/{aurora-lakes,forest-tavern}-v2.webp`: 1280px scenery. All 18 files total approximately 808 KiB; no third-party image hosts or runtime image service.
- Integration: Poker hero/seat avatars/cast; Solitaire hero/companions; both catalogue thumbnails in games shelf and App Hub; eight-character gallery on games shelf; the five established Kids Series cast cards. Existing SVG originals retained. Logo and actual card faces unchanged.
- Generated with built-in image generation, not a paid API integration. Shared portrait prompt: original premium polished 3D animated-film illustration, one centered character, generous avatar padding, deep navy woodland backdrop, cyan rim light and warm lantern glow, soft detailed textures, readable at 64px, no words/letters/logo/watermark/UI/border/weapons/cards. Subjects: wise amber-eyed owl with teal scarf; red squirrel with moss-green vest; kind cheeky bulldog with backwards navy cap/teal hoodie; ivory ceramic robot with cyan face/gold antenna; adventurous curly-haired boy in teal; adventurous girl with puff buns/plum jacket; silver-charcoal space cat in navy; red panda in navy beanie/teal jacket.
- Scenery prompts: original premium animated-film environment, 3:2 landscape, navy/cyan/moon-gold, rich textures and atmospheric depth, no text/UI/cards/chips/controls/logo/watermark. Aurora Lakes: mountain lake, cyan/violet aurora, waterfalls, glowing shore flowers, distant ringed planet and open dark water. Forest Tavern: woodland tavern, fireplace, beams/lanterns, window showing ringed planet and forest, empty dark-green oval table.
- Validation: all WebP decode; static audit 78 pages/202 scripts passes; Chromium 34 page/viewport checks at 360px/1440px pass, no horizontal overflow, page errors or broken artwork. Shelf 14 cards; catalogue 37 rooms/search/favourite. Poker Fold/New hand; Solitaire 28 cards/Hint/Draw/Undo/New peaks/four selectors exercised. Gameplay rules unchanged; exhaustive wins, live multiplayer and real phones remain unverified.
- Publish status must be checked against Netlify SHA: the build-hook 404 predates this batch. No deployment completion claimed merely from pushing.
- Final scoped polish: preserve Solitaire body classes during look changes; readable corner ranks and existing suit art on light card faces. No dealing/scoring/betting rule changes. Focused four viewport/page regressions and static audit passed after the class fix.


## 2026-10-21 — game progress, twelve Stardust levels and voluntary scoreboards (review branch)
- Branch: `codex/games-progress-mobile-leaderboards`, based on `4621978`.
- Existing games retained. Stardust Dash now has twelve complete star-target stages, saved unlocks, replay, pause/resume and no idle animation loop. All twelve stages exercised through the actual engine with synthetic canvas/input fixtures.
- Private progress now uses version checks so stale devices cannot overwrite newer saves. Per-session XP counters merge distinct device earnings once; best levels/scores and badges never regress. Legacy memory/number/pattern/rhythm level saves now sync too. Current-board or reflection conflicts offer explicit device/account choices rather than an invented hybrid.
- The profile refreshes saved XP/levels without reloading a game. Sign-out warns before discarding an unsuccessful upload; cancelling retains both the session and local progress. A person can still choose to sign out on a shared device.
- Solitaire's earned player levels no longer stop at four; existing table skins and four modes remain. Poker levels award at the actual pot-win event, once per hand, rather than by observing log text; shared score is the won play-chip pot. Proposed extra worlds and the 70-level campaign remain previews, not falsely called complete.
- Optional scoreboards use explicit sharing and removal per game. Public fields are nickname, score and level only. Mood, breathing, journals and private progress are excluded. Scores are self-reported: no prizes, verified anti-cheat claim or real-money gambling. Existing progress table reused; no migration or paid dependency added.
- 28 local game card/icon WebP variants total 545,172 bytes versus 6,313,063 source JPG bytes (91% smaller). Original JPG URLs remain available. Existing references and worker precache use the smaller assets. Shared scoped mobile/touch/focus styling added; manifest IDs, scope and brand retained.
- Verified: `node --test scripts/test-game-progress.mjs` (9 passing scenarios), `python scripts/audit-site.py` (78 pages, 205 JS/TS blocks, zero HOUSE GUARD lines), `git diff --check`. Tests use simulated Identity/database/network/canvas; real provider calls and production data untouched.
- Not proven: real browser rendering/touch, installed-PWA update, deployed Postgres compare-and-swap, authenticated live scores and cross-device production sync. Local browser launch and loopback preview failed in the restricted environment. Netlify connector reports authentication required. `npm` and local function bundler are unavailable; no successful full Netlify build claimed.
- Workflow proposal not applied: remove duplicate Netlify hook and align Node runtime. Automatic approval review rejected production workflow changes; `.github/workflows` remains unchanged. Existing hook 404 / usage issues need owner review; no billing caps, credits, schedules or deployment settings changed.
- Before merge: run the regression command on a Node 24 checkout; test a deploy preview on 360px phone and desktop, real signed-in restore and conflict selection, scoreboard share/remove, all card actions, PWA update and production SHA after approved deployment. Revert this branch's patch to roll back; no data migration to reverse. Already-shared public scoreboard rows require member removal or an explicitly approved cleanup if the feature is rolled back.
