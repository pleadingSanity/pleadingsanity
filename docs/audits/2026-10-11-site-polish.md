# Pleading Sanity site audit — 11 October 2026

Canonical repository: pleadingSanity/pleadingsanity. Canonical production: https://pleadingsanity.co.uk.
Baseline: 7d928609ac8d615b8017277fab7a048422abd307.

## What was checked

- All 73 root HTML routes were requested over HTTP and opened in the browser. Browser checks used a desktop viewport and a guest session.
- Four PWA manifests, the main service worker, Arron health and finance-provider endpoints also returned successfully: 81 HTTP checks in total.
- Dependency-free static audit: 73 HTML pages, referenced href/src files, duplicate IDs, and 255 JavaScript/TypeScript blocks passed before and after the changes.
- All 95 raster/icon assets decoded successfully; existing favicon, Apple touch icon and installed-app PNGs use the official crying-brain logo.
- Solitaire: 28-card deal, hint, stock draw, undo and new deal exercised. Five inline game engines started and reached their active states. Other game routes opened with their controls present.
- Healing Hz: missing selection was handled, 432 Hz entered Playing state, and Pause stopped it. This checks the browser audio state, not how audio sounds on a physical phone or lock-screen playback.
- Finance: fictional local-only figures of £1,000 at 0% over 12 months produced £83.33 per month and £1,000 total repayment. No lender application or AI finance question was submitted.
- Arron: one benign request with saveToCloud:false returned a reply in 10.5 seconds, provider spare:apodex, remembered:false. Health returned ok:true. This does not establish that the four primary providers are currently working.
- Guest redirects were observed for profile, community, posting, sanctuary, settings, onboarding, owner/admin and writing routes. This is not an authorization or penetration test.
- No broken images or horizontal overflow were observed on the checked desktop pages. No site-origin console errors were observed in the exercised flows. Browser-extension errors were excluded.
- Live rejected an unsupported URL without publishing anything to the feed.

## Changes

- Replaced substitute SVG/emoji header marks on Movement, Sanity Hub, Journal Viewer and Videos with the official logo; added missing browser/touch icons to newer routes.
- Homepage loads the official logo eagerly, adds clear Live, Games, New Gen Bible, Support and Sign-in routes, and introduces the existing creator/book artwork with relevant card copy. Preserves the original six tool cards and all legacy content/routes.
- Replaced the bulky homepage help panel with clear Support/Urgent Help links. The dedicated support and crisis pages retain their resources.
- Compact artwork on journal/community pages keeps functional controls near the top. Original illustrations have contextual AI labels.
- Shared navigation recognizes both /live and /live.html to prevent duplicate links after Netlify HTML transformations. Removed the repeated static sign-in link on Live.
- Support in the phone dock leads to /support.html. Pages without a nav get a working Tools link instead of an inert Menu button.
- Rap and Platform load the shared navigation controller. Mobile links are hidden only after the menu controller initializes, preserving navigation when JavaScript does not run.
- Install controls show instructions when no native install prompt is available.
- Fixed the podcast shortcut to target a real tab element and retained the intended tab selection.
- Social-provider discovery accepts Netlify Identity's external settings shape as well as the older providers shape. Only existing configured providers can be offered; no providers were enabled or credentials changed.
- Added main-content landmarks to legacy wrappers and a heading to Videos. No game engine, backend data rule, payment system, manifest identity or service-worker scope was changed.

## Remaining service and verification limits

- Live Identity settings report all social providers disabled, with email enabled. Actual signup, email delivery, recovery and signed-in social flows need an authorized member/session and provider configuration; no account was created.
- The primary GPT → Claude → Gemini → Grok chain remains in source, but this test used a fallback. Provider credentials/gateway/model configuration needs investigation in the existing hosting environment.
- Finance provider/review feeds return connected:false. Native streaming, automatic replay clipping and creator payouts remain explicitly unconnected in the product.
- No purchase, payout, shared post, personal-data deletion, native broadcast or real livestream was attempted.
- A physical/mobile viewport, offline transition, installation prompt, lock-screen audio, all game-winning paths, signed-in permissions and cloud Forget Me were not tested. Responsive CSS and existing reduced-motion rules were inspected, but that is not a substitute for device testing.
- This audit does not certify security, accessibility compliance, external playlists, or every third-party integration.

## Deployment validation

Preview and final-production checks are recorded in the pull request. Merge only after the static/security and Netlify preview checks pass and the rendered changes are reviewed.
Rollback: revert the polish commit. No database migration is involved.

## HTTP route evidence

| Route | Status |
| --- | --- |
| /feed.html | 200 |
| /arron-intro.html | 200 |
| /rap.html | 200 |
| /arron-app.html | 200 |
| /404.html | 200 |
| /settings.html | 200 |
| /frequencies.html | 200 |
| /cosmic-focus.html | 200 |
| /offer.html | 200 |
| /community-dashboard.html | 200 |
| /about.html | 200 |
| /notes.html | 200 |
| /wisdom.html | 200 |
| /my-room.html | 200 |
| /profile.html | 200 |
| /transparency.html | 200 |
| /finance.html | 200 |
| /write.html | 200 |
| /shop.html | 200 |
| /index.html | 200 |
| /ai-family.html | 200 |
| /sources.html | 200 |
| /privacy.html | 200 |
| /pattern-galaxy.html | 200 |
| /cosmic-connect.html | 200 |
| /new-gen-bible.html | 200 |
| /journal-vault-viewer.html | 200 |
| /post.html | 200 |
| /kids.html | 200 |
| /offline.html | 200 |
| /blueprint.html | 200 |
| /crisis.html | 200 |
| /onboarding.html | 200 |
| /support.html | 200 |
| /movement.html | 200 |
| /sanity-solitaire.html | 200 |
| /community.html | 200 |
| /live.html | 200 |
| /games.html | 200 |
| /member.html | 200 |
| /ai-studio.html | 200 |
| /signup.html | 200 |
| /developers.html | 200 |
| /sanctuary.html | 200 |
| /videos.html | 200 |
| /journal-vault.html | 200 |
| /truth-tag.html | 200 |
| /circle.html | 200 |
| /safety.html | 200 |
| /ai-stories.html | 200 |
| /reset-password.html | 200 |
| /platform.html | 200 |
| /mood-journey.html | 200 |
| /login.html | 200 |
| /memory-ocean.html | 200 |
| /creations.html | 200 |
| /sanityhub.html | 200 |
| /poker.html | 200 |
| /mind-mode.html | 200 |
| /creator.html | 200 |
| /ai-welcome.html | 200 |
| /admin.html | 200 |
| /owner.html | 200 |
| /stardust-dash.html | 200 |
| /play-listing.html | 200 |
| /rhythm-resonance.html | 200 |
| /tools.html | 200 |
| /arron.html | 200 |
| /meditation.html | 200 |
| /number-nebula.html | 200 |
| /get-the-app.html | 200 |
| /quote-wall.html | 200 |
| /ai-ecosystem.html | 200 |
| / | 200 |
| /manifest.json | 200 |
| /manifest-arron.json | 200 |
| /manifest-solitaire.json | 200 |
| /manifest-finance.json | 200 |
| /sw.js | 200 |
| /api/arron/health | 200 |
| /api/finance-providers | 200 |
