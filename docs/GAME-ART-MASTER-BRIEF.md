# PLEADING SANITY — GAME ART & IMPLEMENTATION MASTER BRIEF
Owner: Shane Cooper | 2026-10-20 | One Source · Evolution, Not Erasure

## Goal
Turn existing games into coherent, beautiful, comprehensible, genuinely fun, mobile-first app-like experiences. The two approved fantasy concept images in the founder's ChatGPT conversation are **art direction**, not functioning screenshots or production assets. Current source files and illustrations are in this repository. Do not copy proprietary game code, characters, illustrations, or branded UI from competitors.

## Non-negotiables
- Work only in `pleadingSanity/pleadingsanity` on `main`; one reviewed, small commit per game or asset batch. Preserve all existing gameplay engines, page routes, PWA installation, support/crisis pages, Arron, New Gen Bible, user data, logo and AI chain.
- Do NOT merge or alter PR #92. Do NOT change DNS, hosting, secrets, production auth, pricing or deployments without permission.
- Budget £0 additional; no paid image API, SaaS, model or runtime dependency without founder approval. No real-money poker, betting, ads, paywalls, tracking, timers or pressure.
- Keep SVG/AVIF/WebP art locally in `assets/games/`; use original illustrations, sensible dimensions, compression and accessible alt text. Avoid embedding multi-megabyte full-screen promotional screenshots as backgrounds.
- Keep core card faces legible, large and high contrast; decorative art behind gameplay only. Aim 44px+ touch targets, 360px Android width, reduced motion, keyboard focus, offline resilience.
- Clearly label demo-only elements. Never claim live friends, tournaments, achievements or AI opponents without real tested functionality.

## Design language
Original PS crying-brain logo; deep cosmic navy #000103/#0d1b2a; electric cyan #00fff0; moon gold #f7c879; occasional amber #f59e0b; warm firelit highlights. World-class polished mobile game feeling: a striking scene, prominent gameplay surface, expressive character portraits, big labelled actions, gentle feedback, compact menus. Art inspiration: magical mountains, forests, waterfalls, celestial gardens, lunar observatories, planets, auroras, cozy taverns. Do not replicate any specific commercial game's assets.

## Character art batch (original consistent series)
Ollie the Owl (wise, funny, bright-eyed), Zara the Squirrel (curious, energetic), Bruno the Bulldog (kind, cheeky, streetwear cap), Blinky the Robot (warm, curious), Max and Mia (adventurous children), plus Fox the Trickster (friendly), Luna the Snow Leopard (gentle), Nova the Space Cat (playful), Atlas the Tortoise (patient), Pip the Red Panda (mischievous), and Sage the Wolf (protective, never threatening).
Produce each as: transparent bust portrait 512x512 WebP, full-body 768x1024 WebP, expressive variants happy/thinking/celebrating, and a 128x128 thumbnail. A little 'gangster' attitude can mean playful streetwear and confidence, never weapons or intimidation. Maintain recognizable silhouettes across poses.

## Background art batch
1. Solitaire: Aurora Lakes (moonlit mountains and water); Crystal Forest (glowing mushrooms); Sky Islands (floating gardens); Coral Observatory (undersea); Moon Garden (lunar flowers); Solar Sanctuary (sunlit celestial).
2. Poker: Forest Tavern (warm hearth); Ocean Dome (glass sea observatory); Moon Base (cozy lunar lounge); Asteroid Lounge (stellar jazz); Solar Empire (golden observatory).
3. Shared: world-select thumbnails, accessible icon set, original card-back variants (cyan brain, starfield, leaf), rewards (star, combo, calm glow), subtle particle sprites, empty/error/paused illustrations, and game-hub thumbnails for **each actual game route** discovered in `games.html`.

## Integration priorities
1. Inventory the existing games and routes from `games.html`. Verify asset paths, current DOM classes and gameplay states before modifying.
2. Build reusable lightweight `css/ps-game-shell.css` with viewport-friendly layout, accessible HUD, tutorial entry, consistent home/back, responsive cards and safe-area insets. Scope CSS to a class so other pages aren't changed.
3. Solitaire: show one clear play instruction, large cards, visible stock/waste, hint highlight, streak/calm feedback, mode selection, world selection only when real progression exists. Remove unnecessary huge logo artwork from above the game. No misleading fake progress.
4. Poker: big, legible oval table and community cards; character avatars around seats; one line explaining current action; fold/check/call/raise with accurate labels; chip count and winner animation; all chips play-only. Keep seat labels consistent with avatars. Never imply multiplayer works if it doesn't.
5. Integrate assets in actual HTML/CSS with fallback, verify images load. Update `docs/GAME-INVENTORY.md` with exact status and tests. Commit one game at a time.
6. Test using browser automation (Playwright if available): 360x800 and 1440x900; tutorial; all actions; card rules; winning and losing; persistence; keyboard; contrast; reduced motion; no horizontal overflow; no broken assets; no console errors. Run real Android manual checks for touch and visual fit. Verify Netlify published commit separately.

## Deliverables
A route-by-route image inventory, generated assets saved in `assets/games/`, tested implementation commits with before/after screenshots, and a short honest status report listing completed, blocked and pending items. Preserve all source material and avoid placeholder buttons.


## Sanctuary image concepts — 25 October 2026

Art direction only; missing image blocks must be reproduced route-by-route before adding assets. Existing image decoding/alt-attribute checks are not a semantic/visual audit of every block. Keep all originals, use compact local WebP variants, fixed dimensions and lazy loading below the fold. No new image API subscription.

| Placement | Original concept | Accessibility / integration |
|---|---|---|
| Sanctuary welcome | Small warm doorway in a deep-blue night garden | Decorative empty alt beside equivalent welcome text |
| Journal | Open unmarked notebook beside a warm lamp; no legible invented handwriting | “Open notebook beside a warm lamp” if informative, otherwise empty alt |
| Community | Diverse abstract figures sitting in an open circle; no real member likeness | Do not imply a photographed real support group |
| Breathing | Soft still moonlight ring and an optional gently expanding version | Static reduced-motion alternative; no flash |
| Arron | Existing Arron character in a calm listening pose | Preserve character/logo; no real-person impersonation |
| Install | Original small phone displaying an accurate current sanctuary screen | Instructions remain HTML text; do not invent store badges |
| Empty state | A small unlit constellation with room for a first star | “Nothing saved yet” as text, not hidden in image |
| Offline/error | Sheltered lantern with a readable text retry/help action beside it | Never imply a draft is saved or a message sent |

Validate contrast/text overlap at 360px and desktop, actual file loading, descriptive context, download size, dimensions and fallback. Never put mental-health keywords into every alt attribute. No new artwork has been generated or installed by this planning change.
