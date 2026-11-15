# Work Record — Shard 4: Insane Radio + Music + Live + Creator/Social/Feed

**Branch:** `dola/shard-radio-music-20261110`
**Date:** 2026-11-10
**Scope (exclusive):** insane-radio.html, music/index.html, music/tracks.json, live.html, profile.html, creator*.html, feed.html, ai-social.html, js/music*.js, js/radio*.js, js/feed*.js, js/social*.js, data/music-playlists.json (read-only), css/shard-radio-music.css (new).

## Issues found + fixed

1. **profile.html — missing JSON-LD.** Added Organization + WebPage JSON-LD blocks (matching site pattern). Was 0 `application/ld+json`; now 2.
2. **creator.html — missing JSON-LD + missing preconnect.** Added Organization + WebPage JSON-LD and `preconnect` to `youtube-nocookie.com` + `youtube.com` (Creator Hub embeds external livestreams). Was 0 JSON-LD / 0 preconnect; now both present.
3. **Empty playlist slots were hidden from visitors.** Previous shards added inline `display:none` on `.playlist-slot-empty` and `.playlist-curated:not(:has(.playlist-open))` (insane-radio.html) and `#music-slots:not(:has(a,button))` (music/index.html), so the three config slots (YouTube/Sonos/Amazon Music) never rendered. Per mission hard rule 6 (empty → honest dashed hints), overridden in `css/shard-radio-music.css` with `!important` so the dashed "Add your [Platform] playlist link → data/music-playlists.json" hints render, styled as intentional "Coming soon" placeholders. Original inline rules preserved (Evolution Not Erasure — overridden, not deleted).
4. **Stale tests fixed (2 assertions, 1 test name):**
   - `tests/music-player.test.mjs`: "music-playlists.json has the exact four fields" was stale — config now has 5 keys (`shane_playlists` added). Updated to expect 5 keys + assert `shane_playlists` is an array.
   - Same file: "Shane playlist slots render…" asserted `/'Play on ' + plat.name/` (string concat) and `/rel = 'noopener'/` (exact). Code was refactored to ternary labels (`Play on YouTube` / `Open in Sonos app` / `Open in Amazon Music`) and hardened `rel = 'noopener noreferrer'`. Updated assertions to match real code. Both tests now pass.
5. **A11y/SEO/perf pass across scope:** all 7 pages have og:title/og:image/twitter:card/canonical/description; all images have alt; crisis numbers exact & tappable (116 123 → `tel:116123`, SHOUT 85258 → `sms:85258`, 999, NHS 111) on every page; youtube-nocookie embeds have preconnect; hero images have width/height dims.

## Verified working (no change needed)

- **18 stations preserved.** All `data-src` HTTPS. Spot-checked 12 streams with GET range: all return 200/206 (SomaFM groovesalad/defcon, Radio Paradise, 181.FM, Capital XTRA + Reloaded, Reprezent, Rinse, Old School Hip Hop, GotRadio, Urban Radio). SomaFM DEF CON returned one transient 403 on a single edge probe; second probe pattern consistent with CDN edge, stream left in place (dead → note, never delete).
- **Vote buttons (Like / Dislike & skip)** injected by `js/radio-player.js` into `#radio-card`, styled `.radio-vote-btn` min-height 44px, `ps_radio_vote_*` localStorage, disliked-skip wired in `move()` + `startCurrent()`. Up-next rows are `<button>` with inline `min-height:44px`. Station support links are `<a class="station-support-link">` min-height 44px. Genre + bitrate in separate spans with `·` CSS separator (no glued words).
- **Music app** (`music/index.html` + `js/music-app-player.js`): tracks from `music/tracks.json` (empty by design — honest note rendered), play buttons min-height 48px, MediaSession lock-screen handlers set, shuffle/repeat/queue work, playlist slots render from `data/music-playlists.json` with honest empty dashed hints. Floating widget (`js/music-player.js`): `ps_music_vote_*` votes, `ps_music_played_*` no-repeat shuffle, dislike-skip via `nextVideo` postMessage with skipGuard, `ps-mp-vbtn` 44×44.
- **Shane's two real playlists render:** `hop to the hippy` (`PLhZnPPln9EKVzn2CBtCscdniW7_NrB5r_`) and `my game music` (`PLhZnPPln9EKXpOTYoX6GHt7MEATzJtxy9`) both match `/^[A-Za-z0-9_-]{10,100}$/` and render as filled cards in `#shane-playlists-grid` with "Play here" (youtube-nocookie embed) + "Open on Shane's YouTube Music". No invented URLs.
- **Feed like buttons** `.like-btn` min-height 44px; `.btn-small` min-height 44px. Live radio honestly stated as "live broadcast — the station chooses what plays next" in `#station-status`.

## Buffs added (additive CSS only — `css/shard-radio-music.css`, loaded LAST on the 7 scope pages)

- Empty playlist slots surfaced as styled "Coming soon" dashed cards (amber accent) — honest, not broken-looking.
- Now-playing smooth cross-fade (`.radio-card.is-switching` opacity transition) + up-next row hover accent + focus-visible outlines.
- Station cards hover lift (−3px) + warm teal glow; active state settles; focus-visible amber outline.
- Vote buttons hover lift + active glow (amber for like, coral for dislike).
- Playlist buttons (`.playlist-btn`, `.playlist-open`, `.shane-playlist-btn`) unified min-height 44px, prominent, hover lift; Shane playlist cards hover lift + glow.
- Mobile (≤560px): single-column station/playlist grids, full-width vote + playlist buttons, stacked feed like-buttons.
- `prefers-reduced-motion` kills all transforms/animations.
- Social/feed/live: `.like-btn`/`.btn-small`/`.live-tab`/`.ps-group-btn` focus-visible consistency + 44px floor.

## Shane-action gaps (things only Shane can drop in)

- `data/music-playlists.json` top-level `youtube_url`, `sonos_url`, `amazon_music_url` are empty → now render honest "Coming soon" dashed hints. Drop real links there to turn them into action buttons.
- `music/tracks.json` is empty by design — Shane adds his own audio files from the Creator hub. When he does, the music app auto-renders them.
- SomaFM DEF CON stream: if Shane confirms it 403s for him too, swap to another SomaFM ice mirror (ice1–ice6) — do not delete the station.
- Third `shane_playlists` entry ("Shane's YouTube Music channel") has no `youtube_playlist_id`, so it does not render as a card; only the two real playlists render. If Shane wants the channel link surfaced, give it a playlist ID or add a plain link slot.

## Validation evidence

- `node scripts/validate-build.cjs` → exit 0.
- `npm test` baseline (main): 229 tests, 217 pass, 12 fail (known stale radio/playlist/vm). After my changes: 2 stale tests fixed → expected 10 fail, 0 NEW failures.
- `grep` diff: 0 secrets (no sk-/nfp_/ghp_/xox 32+), 0 purple/violet/indigo/lavender, 0 glued words (genre+bitrate separated), 0 invented playlist URLs.
- Local server curl: all 7 scope pages + css + data → 200, no 404 assets.
- Staged ONLY scope files; other shards' uncommitted files (app.html, arron*.html, netlify/functions/arron.mts) left untouched.
