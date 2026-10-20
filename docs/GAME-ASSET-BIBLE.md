# Pleading Sanity — Master Game Asset Bible

Updated 2026-10-20. **Source of truth for implementation remains GitHub main and tested game engines.** Founder-provided ten Dola AI concept sheets in the 2026-10-20 conversation are **visual references only**, not individual sprites or deploy-ready UI. Their lettering has distortions and a Dola watermark: do not publish them directly or invent a new logo. Original crying-brain branding stays authoritative.

## Locked approach
- **Evolution Not Erasure**: preserve existing Poker and Solitaire engines, saves, play-chip accounting, modes and PWA flows. Do not claim an illustration is a functioning feature.
- £0 forever; no real-money gambling, paywalls, ads or tracking. Play chips only. Guest access; touch targets at least 48px; no sideways scrolling. Reduce motion for accessibility. Crisis access: 999, Samaritans 116 123, SHOUT 85258, NHS 111 option 2. Arron is not a therapist.
- **Approved aesthetic:** cozy cosmic tavern; warm firelight and timber as *illustrated scenery*, dark cosmic navy surfaces, cyan focus rings, frost-white legible text, pink as a sparing highlight. Site-wide locked palette #000103, #0d1b2a, #00fff0, #eef6ff, #ff4d8d remains unchanged; gold/wood tones belong only inside scene art, not as a global brand replacement. Original crying-brain mark only.
- Keep card faces classic high-contrast red/black on white; decorative cosmic card backs only. UI labels must be real HTML text, never baked into generated images.
- Honest statuses: **LIVE** only after gameplay tested; **LOCKED** only when actual unlock logic exists; otherwise **COMING SOON** or **CONCEPT**. No artificial time pressure or guilt streaks.

## Night Table Poker
**Tagline:** Play · Relax · Connect · Keep It Calm.

### Character concept roster
The Host (calm guide, hooded), Ollie (wise owl), Zara (cheerful squirrel), Max (curious learner), Mia (thoughtful friend), Bruno (relaxed bulldog, expansion), Blinky (friendly robot, expansion). User remains the player. These are **visual/story concepts**, not evidence that seven seats or particular chip allocations exist. The user-provided concept chips 980/960/1020/990/980/1040/990 are **not to be inserted into game accounting**. Keep real existing game logic and player chips unchanged.

### Proposed worlds, not automatically live
1. Forest Table — cozy fireplace and lanterns, starting scene.
2. Ocean Dome — bioluminescent grotto, concept unlock: 3 wins in Forest.
3. Moon Base — lunar deck, concept unlock: 5 wins in Ocean.
4. Asteroid Lounge — warm observation station, concept unlock: 7 wins on Moon.
5. Solar Empire — grand starlit hall, concept unlock: 10 wins in Asteroid.

Do not present these proposed unlocks as functioning unless counters, persistence, UI and tests agree. Use existing art in `assets/games/` until new clean, original, individually usable assets are produced.

### UI
Clear Fold / Check / Call / Raise action states, with labels and amounts determined by engine. 48px targets; readable community cards, user hand and chip balances; friend room functionality never overstated. Optional future: kindness leaderboard, tournaments, winter/spring/galaxy skins, ambient sound toggle, collectible mug and cabin sign. **No real-money feature.**

## Sanity Solitaire
**Tagline:** Clear the peaks · Find your calm · One card at a time.

### Proposed world map
Aurora Lakes (1–12); Whispering Woods (13–25); Crystal Shores (26–40); Starlight Peaks (41–55); Eternal Sanctuary (56–70). These level ranges are a **design proposal**, not verified game progression.

### Modes
TriPeaks, Klondike, FreeCell and Pyramid are represented in the existing source. **Spider is a concept, not an implemented engine**. Never label Spider LIVE without real implementation and regression testing.

### Optional future UI
Ollie and Zara companion visuals; daily challenge; achievements; free card skins; nonjudgmental statistics; world map; gentle combo display; unlimited undo where engine supports it; hints; calm reminder (not a countdown); streaks without shame; quote footer. Each must be grounded in actual functionality or marked COMING SOON. Do not promise undo for modes without it.

## Phase 1 implementation — 2026-10-20
- `poker.html` at `4a59fb616d6e577c6757f0099e2ac6f676b49706`: CSS-only hero, legibility, touch and focus improvements; no game-engine edits.
- `sanity-solitaire.html` at `dfeff4034dc41e26ca824c25a3f2416b9a0d6c5f`: CSS-only contrast, responsive spacing and touch/focus improvements; no game-engine edits.
- Ten user-supplied reference images remain in the conversation; **not deployed**. Avoid Dola watermark and distorted words by commissioning or creating original individual assets later. No extra images generated or purchased in this phase.

## Phase 2 acceptance checklist — not yet verified
- 360px Android and desktop visual regression: no art behind readable controls, no overflow, legible suits, buttons and dialogs, no covered text.
- Poker: Fold/Check/Call/Raise/New Hand, hand evaluation, chips never negative, progression, friend-room claims and refresh state.
- Solitaire: TriPeaks, Klondike, FreeCell, Pyramid, Undo/Hint where supported, saved progress and restart.
- Keyboard focus, reduced motion, PWA/offline, support and crisis routes, real Netlify production SHA.
- Any new asset: optimised source-controlled WebP/SVG, accessible alt text, correctly sized, no watermarks, approved brand mark.

**Reserved future slots:** Bruno and Blinky portraits; level 6; Solitaire world 6; seasonal table art; galaxy/vintage/character decks; accessibility colour modes; gentle stretch reminders; device-only journal note; friend waves; optional weekly calm summary. None should be marked live until implemented and tested.
