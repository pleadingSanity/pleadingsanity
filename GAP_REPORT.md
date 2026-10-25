# Phase 0 — GAP_REPORT
Reviewed 21 October 2026 (Europe/London). **Audit only. Stop for Shane.**

Repository: `pleadingSanity/pleadingsanity`. Baseline: `97f20e4e03d4f21512eb0381e6af66aa7ac179b7` (PR #46). Branch: `polish/gpt-master-phase0-2026-10-21`. Full, non-shallow Git history and complete main tree fetched. Earlier staged work was preserved in its separate worktree. No application code, settings, keys, rules, domains or main refs changed. This report and an append-only handoff entry are the only proposed changes.

## Decision summary

1. **VERIFIED:** `.co.uk` returns HTTP 503 `usage_exceeded` on the ten sampled root/API/PWA paths. Bare `.uk` serves HTML; its Arron API returns 404 on GET. No chat POST/provider call was made, avoiding spend and stored messages. Live chat success is NOT PROVEN. `www.pleadingsanity.uk` also returns 503 on the same ten paths. Preserve the working bare `.uk` mirror.
2. **VERIFIED:** current-main assets and the deployed mirror differ. The tables below distinguish missing candidate assets from references in actually served HTML. A successful static source audit is not deployment proof.
3. **VERIFIED at source:** the old missing image-audience check and raw Poker name interpolation findings are refuted for this main commit. Neither is a live security certification. The secondary repository still contains permissive recursive Firestore rules; deployed exposure is NOT PROVEN.
4. **VERIFIED:** existing Arron code already contains an offline reply path for non-2xx; ordinary offline replies lack the mandated support footer. Both service workers return HTTP 503 rather than cached navigation. `offline.html` lacks the required support contacts/disclaimer. Prioritise those gaps before visual polish.
5. **STOP:** no Phase 1–6 implementation is authorised until Shane reviews this Phase 0 report. Pasted claims about completed fixes, videos, recovered ZIP content and agent consensus are not evidence.

## Method and limits
Read all 79 tracked HTML files (78 root pages plus `docs/deployment-status.html`), shared instructions, API callers, relevant functions, both workers and all four manifests. HTTP GET sweep checked 296 distinct URLs including source/deployed asset references; HTTP status and MIME type were recorded. No credentials, real user records, POST actions, provider calls, paid tools or production mutations were used. Direct HTTP evidence takes precedence over the web-search cached homepage, which was crawled last week.
Static reference coverage includes HTML src/href/poster/srcset, source/deployed inline CSS url(), and source/deployed social-image metadata. Computed URLs, CSS imports/backgrounds loaded only after interaction, authenticated images and arbitrary external embeds are NOT PROVEN exhaustively. API dependency mapping follows literal endpoints and local script imports; runtime-built routes still need browser/network testing. No browser rendering or real-device testing was performed this phase. Labels below are deliberately conservative.

## Required audit result
```text
python3 scripts/audit-site.py
Checked 78 HTML pages, static href/src targets, duplicate IDs, and 202 external/inline JavaScript and TypeScript blocks.
Static audit passed. API integrations and visual layout require separate checks.
```
Exit 0. Zero HOUSE GUARD lines. The supplied audit excludes nested docs HTML; this report includes it. This command does not type-check integrations or certify accessibility/security.

## A. Assets that return 404
The following URLs are referenced by **current main HTML** and return 404 on the mirror. These are not missing Git files except the four incorrect relative references in the nested deployment-status document. Do not remove main artwork to match the older deployment.

| Path on bare .uk | Referenced by current main |
| --- | --- |
| /docs/assets/favicon.svg | docs/deployment-status.html |
| /docs/css/styles.css | docs/deployment-status.html |
| /docs/css/mobile-responsive.css | docs/deployment-status.html |
| /css/ps-game-art.css | games.html, kids-series.html, poker.html, sanity-solitaire.html |
| /assets/games/characters/ollie-128.webp | games.html |
| /assets/games/characters/zara-128.webp | games.html |
| /assets/games/characters/bruno-128.webp | games.html |
| /assets/games/characters/blinky-128.webp | games.html |
| /assets/games/characters/max-128.webp | games.html |
| /assets/games/characters/mia-128.webp | games.html |
| /assets/games/characters/nova-128.webp | games.html |
| /assets/games/characters/pip-128.webp | games.html |
| /js/games-home-note.js | games.html |
| /css/app-hub.css | get-the-app.html |
| /js/app-hub.js | get-the-app.html |
| /assets/games/characters/ollie-v2.webp | kids-series.html, poker.html, sanity-solitaire.html |
| /assets/games/characters/zara-v2.webp | kids-series.html, poker.html, sanity-solitaire.html |
| /assets/games/characters/max-v2.webp | kids-series.html, poker.html |
| /assets/games/characters/mia-v2.webp | kids-series.html, poker.html |
| /assets/games/characters/blinky-v2.webp | kids-series.html, poker.html |
| /assets/games/worlds/forest-tavern-v2.webp | games.html, poker.html |
| /assets/games/characters/bruno-v2.webp | poker.html |
| /assets/games/characters/nova-v2.webp | poker.html |
| /assets/games/characters/pip-v2.webp | poker.html |
| /assets/games/worlds/aurora-lakes-v2.webp | games.html, sanity-solitaire.html |
| /docs/assets/crying-brain-og.png | docs/deployment-status.html |

References in **actually served mirror HTML**, including inline CSS and social-image metadata:

| URL | HTTP | Served-page references |
| --- | --- | --- |
| https://pleadingsanity.co.uk/assets/crying-brain-og.png | 503 | 404.html, about.html, admin.html, ai-ecosystem.html, ai-family.html, ai-stories.html, ai-studio.html, ai-welcome.html, arron-app.html, arron-intro.html, arron.html, blueprint.html, circle.html, community-dashboard.html, community.html, cosmic-connect.html, cosmic-focus.html, creations.html, crisis.html, developers.html, feed.html, finance.html, frequencies.html, games.html, get-the-app.html, index.html, journal-vault-viewer.html, journal-vault.html, kids.html, live.html, login.html, meditation.html, member.html, memory-ocean.html, mind-mode.html, mood-journey.html, movement.html, my-room.html, new-gen-bible.html, number-nebula.html, offline.html, onboarding.html, owner.html, pattern-galaxy.html, play-listing.html, poker.html, post.html, privacy.html, profile.html, quote-wall.html, reset-password.html, rhythm-resonance.html, sanctuary.html, sanity-solitaire.html, sanityhub.html, settings.html, shop.html, signup.html, sources.html, stardust-dash.html, support.html, tools.html, truth-tag.html, videos.html, wisdom.html, write.html |
| https://pleadingsanity.uk/docs/assets/crying-brain-og.png | 404 | docs/deployment-status.html |
| https://pleadingsanity.uk/docs/assets/favicon.svg | 404 | docs/deployment-status.html |
| https://pleadingsanity.uk/docs/css/styles.css | 404 | docs/deployment-status.html |
| https://pleadingsanity.uk/docs/css/mobile-responsive.css | 404 | docs/deployment-status.html |

HTTP 200 assets with a wrong MIME type would also be broken:

| URL | Unexpected MIME |
| --- | --- |
| None observed | — |


## B. Links and redirects to the unavailable primary domain
This table extracts HTML href/src/poster/srcset/style targets pointing to `.co.uk` in the audited source, including canonical metadata as well as clickable anchors. Canonical tags are metadata, not navigation; review separately. The ten primary-domain probes establish the outage, not an individual HTTP request to every destination below.

| File:line | Element/attribute | Target |
| --- | --- | --- |
| about.html:24 | link/href | https://pleadingsanity.co.uk/about.html |
| admin.html:23 | link/href | https://pleadingsanity.co.uk/admin.html |
| ai-ecosystem.html:24 | link/href | https://pleadingsanity.co.uk/ai-ecosystem.html |
| ai-family.html:16 | link/href | https://pleadingsanity.co.uk/ai-family.html |
| ai-stories.html:24 | link/href | https://pleadingsanity.co.uk/ai-stories.html |
| ai-studio.html:18 | link/href | https://pleadingsanity.co.uk/ai-studio.html |
| ai-welcome.html:19 | link/href | https://pleadingsanity.co.uk/ai-welcome.html |
| arron-app.html:19 | link/href | https://pleadingsanity.co.uk/arron-app.html |
| arron-intro.html:17 | link/href | https://pleadingsanity.co.uk/arron-intro.html |
| arron.html:18 | link/href | https://pleadingsanity.co.uk/arron.html |
| blueprint.html:22 | link/href | https://pleadingsanity.co.uk/blueprint.html |
| circle.html:19 | link/href | https://pleadingsanity.co.uk/circle.html |
| community-dashboard.html:18 | link/href | https://pleadingsanity.co.uk/community-dashboard.html |
| community.html:23 | link/href | https://pleadingsanity.co.uk/community.html |
| cosmic-connect.html:22 | link/href | https://pleadingsanity.co.uk/cosmic-connect.html |
| cosmic-focus.html:16 | link/href | https://pleadingsanity.co.uk/cosmic-focus.html |
| creations.html:22 | link/href | https://pleadingsanity.co.uk/creations.html |
| creator.html:8 | link/href | https://pleadingsanity.co.uk/creator.html |
| crisis.html:18 | link/href | https://pleadingsanity.co.uk/crisis.html |
| developers.html:11 | link/href | https://pleadingsanity.co.uk/developers.html |
| docs/deployment-status.html:10 | link/href | https://pleadingsanity.co.uk/deployment-status.html |
| docs/deployment-status.html:305 | a/href | https://pleadingsanity.co.uk |
| feed.html:19 | link/href | https://pleadingsanity.co.uk/feed.html |
| finance.html:9 | link/href | https://pleadingsanity.co.uk/finance.html |
| frequencies.html:18 | link/href | https://pleadingsanity.co.uk/frequencies.html |
| games.html:19 | link/href | https://pleadingsanity.co.uk/games.html |
| get-the-app.html:20 | link/href | https://pleadingsanity.co.uk/get-the-app.html |
| index.html:11 | link/href | https://pleadingsanity.co.uk/ |
| journal-vault-viewer.html:18 | link/href | https://pleadingsanity.co.uk/journal-vault-viewer.html |
| journal-vault.html:16 | link/href | https://pleadingsanity.co.uk/journal-vault.html |
| kids-series.html:4 | link/href | https://pleadingsanity.co.uk/kids-series.html |
| kids.html:18 | link/href | https://pleadingsanity.co.uk/kids.html |
| live.html:10 | link/href | https://pleadingsanity.co.uk/live.html |
| login.html:23 | link/href | https://pleadingsanity.co.uk/login.html |
| meditation.html:18 | link/href | https://pleadingsanity.co.uk/meditation.html |
| member.html:23 | link/href | https://pleadingsanity.co.uk/member.html |
| memory-ocean.html:16 | link/href | https://pleadingsanity.co.uk/memory-ocean.html |
| mind-mode.html:22 | link/href | https://pleadingsanity.co.uk/mind-mode.html |
| mood-journey.html:22 | link/href | https://pleadingsanity.co.uk/mood-journey.html |
| movement.html:18 | link/href | https://pleadingsanity.co.uk/movement.html |
| my-room.html:21 | link/href | https://pleadingsanity.co.uk/my-room.html |
| new-gen-bible.html:16 | link/href | https://pleadingsanity.co.uk/new-gen-bible.html |
| notes.html:18 | link/href | https://pleadingsanity.co.uk/notes.html |
| number-nebula.html:16 | link/href | https://pleadingsanity.co.uk/number-nebula.html |
| offer.html:12 | link/href | https://pleadingsanity.co.uk/offer.html |
| onboarding.html:23 | link/href | https://pleadingsanity.co.uk/onboarding.html |
| owner.html:23 | link/href | https://pleadingsanity.co.uk/owner.html |
| pattern-galaxy.html:16 | link/href | https://pleadingsanity.co.uk/pattern-galaxy.html |
| platform.html:8 | link/href | https://pleadingsanity.co.uk/platform.html |
| play-listing.html:18 | link/href | https://pleadingsanity.co.uk/play-listing.html |
| poker.html:14 | link/href | https://pleadingsanity.co.uk/poker.html |
| post.html:23 | link/href | https://pleadingsanity.co.uk/post.html |
| privacy.html:17 | link/href | https://pleadingsanity.co.uk/privacy.html |
| profile.html:23 | link/href | https://pleadingsanity.co.uk/profile.html |
| quote-wall.html:18 | link/href | https://pleadingsanity.co.uk/quote-wall.html |
| reset-password.html:23 | link/href | https://pleadingsanity.co.uk/reset-password.html |
| rhythm-resonance.html:16 | link/href | https://pleadingsanity.co.uk/rhythm-resonance.html |
| safety.html:1 | link/href | https://pleadingsanity.co.uk/crisis.html |
| sanctuary.html:22 | link/href | https://pleadingsanity.co.uk/sanctuary.html |
| sanity-solitaire.html:17 | link/href | https://pleadingsanity.co.uk/sanity-solitaire.html |
| sanityhub.html:18 | link/href | https://pleadingsanity.co.uk/sanityhub.html |
| settings.html:23 | link/href | https://pleadingsanity.co.uk/settings.html |
| shop.html:18 | link/href | https://pleadingsanity.co.uk/shop.html |
| signup.html:23 | link/href | https://pleadingsanity.co.uk/signup.html |
| site-builder.html:9 | link/href | https://pleadingsanity.co.uk/site-builder.html |
| solar.html:1 | link/href | https://pleadingsanity.co.uk/solar.html |
| solar.html:1 | a/href | https://pleadingsanity.co.uk/ |
| sources.html:19 | link/href | https://pleadingsanity.co.uk/sources.html |
| stardust-dash.html:18 | link/href | https://pleadingsanity.co.uk/stardust-dash.html |
| support.html:5 | link/href | https://pleadingsanity.co.uk/support.html |
| tools.html:19 | link/href | https://pleadingsanity.co.uk/tools.html |
| truth-tag.html:22 | link/href | https://pleadingsanity.co.uk/truth-tag.html |
| videos.html:18 | link/href | https://pleadingsanity.co.uk/videos.html |
| wisdom.html:22 | link/href | https://pleadingsanity.co.uk/wisdom.html |
| write.html:22 | link/href | https://pleadingsanity.co.uk/write.html |

Additional runtime/configuration references (includes JSON data and social metadata; no secret files scanned):

| File:line | Primary-domain reference |
| --- | --- |
| 404.html:23 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| about.html:33 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| about.html:34 | https://pleadingsanity.co.uk/about.html |
| about.html:36 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| admin.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| admin.html:33 | https://pleadingsanity.co.uk/admin.html |
| admin.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-ecosystem.html:33 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-ecosystem.html:34 | https://pleadingsanity.co.uk/ai-ecosystem.html |
| ai-ecosystem.html:36 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-family.html:21 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-family.html:22 | https://pleadingsanity.co.uk/ai-family.html |
| ai-family.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-stories.html:33 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-stories.html:34 | https://pleadingsanity.co.uk/ai-stories.html |
| ai-stories.html:36 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-studio.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-studio.html:28 | https://pleadingsanity.co.uk/ai-studio.html |
| ai-studio.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-welcome.html:15 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| ai-welcome.html:17 | https://pleadingsanity.co.uk/ai-welcome.html |
| archive/legacy-js/analytics-monitoring.js:252 | https://pleadingsanity.co.uk |
| archive/legacy-js/security-hardening.js:182 | https://pleadingsanity.co.uk |
| arron-app.html:28 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| arron-app.html:29 | https://pleadingsanity.co.uk/arron-app.html |
| arron-intro.html:12 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| arron-intro.html:14 | https://pleadingsanity.co.uk/arron-intro.html |
| arron-knowledge.json:732 | https://pleadingsanity.co.uk |
| arron.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| arron.html:28 | https://pleadingsanity.co.uk/arron.html |
| blueprint.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| blueprint.html:32 | https://pleadingsanity.co.uk/blueprint.html |
| blueprint.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| circle.html:15 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| circle.html:17 | https://pleadingsanity.co.uk/circle.html |
| community-dashboard.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| community-dashboard.html:29 | https://pleadingsanity.co.uk/community-dashboard.html |
| community.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| community.html:33 | https://pleadingsanity.co.uk/community.html |
| community.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| cosmic-connect.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| cosmic-connect.html:32 | https://pleadingsanity.co.uk/cosmic-connect.html |
| cosmic-connect.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| cosmic-focus.html:22 | https://pleadingsanity.co.uk/cosmic-focus.html |
| cosmic-focus.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| creations.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| creations.html:32 | https://pleadingsanity.co.uk/creations.html |
| creations.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| crisis.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| crisis.html:28 | https://pleadingsanity.co.uk/crisis.html |
| developers.html:14 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| developers.html:15 | https://pleadingsanity.co.uk/developers.html |
| feed.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| feed.html:29 | https://pleadingsanity.co.uk/feed.html |
| feed.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| finance.html:12 | https://pleadingsanity.co.uk/assets/crying-brain-og.png, https://pleadingsanity.co.uk/finance.html |
| frequencies.html:26 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| frequencies.html:28 | https://pleadingsanity.co.uk/frequencies.html |
| frequencies.html:33 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| games.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| games.html:29 | https://pleadingsanity.co.uk/games.html |
| games.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| get-the-app.html:13 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| get-the-app.html:15 | https://pleadingsanity.co.uk/get-the-app.html |
| index.html:39 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| index.html:40 | https://pleadingsanity.co.uk/ |
| index.html:44 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| journal-vault-viewer.html:30 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| journal-vault-viewer.html:32 | https://pleadingsanity.co.uk/journal-vault-viewer.html |
| journal-vault.html:36 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| journal-vault.html:37 | https://pleadingsanity.co.uk/journal-vault.html |
| js/page-member.js:11 | https://pleadingsanity.co.uk/@${encodeURIComponent(username |
| kids-series.html:4 | https://pleadingsanity.co.uk/kids-series.html |
| kids.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| kids.html:28 | https://pleadingsanity.co.uk/kids.html |
| live.html:15 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| login.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| login.html:33 | https://pleadingsanity.co.uk/login.html |
| login.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| manifest-arron.json:33 | https://pleadingsanity.co.uk/manifest.json |
| manifest-finance.json:119 | https://pleadingsanity.co.uk/manifest.json |
| manifest-solitaire.json:61 | https://pleadingsanity.co.uk/manifest.json |
| meditation.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| meditation.html:28 | https://pleadingsanity.co.uk/meditation.html |
| member.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| member.html:33 | https://pleadingsanity.co.uk/member.html |
| member.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| memory-ocean.html:22 | https://pleadingsanity.co.uk/memory-ocean.html |
| memory-ocean.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| mind-mode.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| mind-mode.html:32 | https://pleadingsanity.co.uk/mind-mode.html |
| mind-mode.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| mood-journey.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| mood-journey.html:32 | https://pleadingsanity.co.uk/mood-journey.html |
| mood-journey.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| movement.html:38 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| movement.html:39 | https://pleadingsanity.co.uk/movement.html |
| my-room.html:13 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| my-room.html:15 | https://pleadingsanity.co.uk/my-room.html |
| netlify/functions/arron.mts:84 | https://pleadingsanity.co.uk/support.html. |
| netlify/functions/arron.mts:85 | https://pleadingsanity.co.uk/crisis.html. |
| netlify/functions/arron.mts:91 | https://pleadingsanity.co.uk/support.html |
| netlify/functions/arron.mts:448 | https://pleadingsanity.co.uk/crisis.html,, https://pleadingsanity.co.uk/support.html. |
| netlify/functions/arron.mts:461 | https://pleadingsanity.co.uk/tools.html |
| netlify/functions/arron.mts:571 | https://pleadingsanity.co.uk/crisis.html,, https://pleadingsanity.co.uk/support.html. |
| netlify/functions/arron.mts:724 | https://pleadingsanity.co.uk/crisis.html., https://pleadingsanity.co.uk/support.html. |
| netlify/functions/studio-weekly.mts:12 | https://pleadingsanity.co.uk |
| new-gen-bible.html:21 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| new-gen-bible.html:22 | https://pleadingsanity.co.uk/new-gen-bible.html |
| new-gen-bible.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| number-nebula.html:22 | https://pleadingsanity.co.uk/number-nebula.html |
| number-nebula.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| offline.html:26 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| onboarding.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| onboarding.html:33 | https://pleadingsanity.co.uk/onboarding.html |
| onboarding.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| owner.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| owner.html:33 | https://pleadingsanity.co.uk/owner.html |
| owner.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| pattern-galaxy.html:22 | https://pleadingsanity.co.uk/pattern-galaxy.html |
| pattern-galaxy.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| play-listing.html:13 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| play-listing.html:15 | https://pleadingsanity.co.uk/play-listing.html |
| poker.html:19 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| poker.html:20 | https://pleadingsanity.co.uk/poker.html |
| poker.html:22 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| post.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| post.html:33 | https://pleadingsanity.co.uk/post.html |
| post.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| privacy.html:12 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| privacy.html:14 | https://pleadingsanity.co.uk/privacy.html |
| profile.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| profile.html:33 | https://pleadingsanity.co.uk/profile.html |
| profile.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| quote-wall.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| quote-wall.html:28 | https://pleadingsanity.co.uk/quote-wall.html |
| quote-wall.html:30 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| reset-password.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| reset-password.html:33 | https://pleadingsanity.co.uk/reset-password.html |
| reset-password.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| rhythm-resonance.html:22 | https://pleadingsanity.co.uk/rhythm-resonance.html |
| rhythm-resonance.html:24 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| safety.html:1 | https://pleadingsanity.co.uk/crisis.html |
| sanctuary.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| sanctuary.html:32 | https://pleadingsanity.co.uk/sanctuary.html |
| sanctuary.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| sanity-solitaire.html:13 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| sanity-solitaire.html:15 | https://pleadingsanity.co.uk/sanity-solitaire.html |
| sanityhub.html:28 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| sanityhub.html:30 | https://pleadingsanity.co.uk/sanityhub.html |
| sanityhub.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| settings.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| settings.html:33 | https://pleadingsanity.co.uk/settings.html |
| settings.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| shop.html:23 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| shop.html:24 | https://pleadingsanity.co.uk/shop.html |
| shop.html:28 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| signup.html:32 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| signup.html:33 | https://pleadingsanity.co.uk/signup.html |
| signup.html:35 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| solar.html:1 | https://pleadingsanity.co.uk/, https://pleadingsanity.co.uk/solar.html |
| sources.html:15 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| sources.html:17 | https://pleadingsanity.co.uk/sources.html |
| stardust-dash.html:24 | https://pleadingsanity.co.uk/stardust-dash.html |
| stardust-dash.html:26 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| support.html:5 | https://pleadingsanity.co.uk/support.html |
| support.html:6 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| tools.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| tools.html:28 | https://pleadingsanity.co.uk/tools.html |
| truth-tag.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| truth-tag.html:32 | https://pleadingsanity.co.uk/truth-tag.html |
| truth-tag.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| twa-finance-manifest.json:13 | https://pleadingsanity.co.uk/assets/images/brand/crying-brain-logo-512.webp |
| twa-finance-manifest.json:14 | https://pleadingsanity.co.uk/assets/images/brand/crying-brain-logo-512.webp |
| twa-finance-manifest.json:15 | https://pleadingsanity.co.uk/manifest-finance.json |
| twa-manifest.json:13 | https://pleadingsanity.co.uk/assets/icons/icon-512x512.png |
| twa-manifest.json:14 | https://pleadingsanity.co.uk/assets/icons/icon-512x512.png |
| twa-manifest.json:18 | https://pleadingsanity.co.uk/manifest.json |
| vercel.json:9 | https://pleadingsanity.co.uk/:path* |
| vercel.json:15 | https://pleadingsanity.co.uk/ |
| vercel.json:21 | https://pleadingsanity.co.uk/:path+ |
| videos.html:21 | https://pleadingsanity.co.uk/videos.html |
| videos.html:27 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| wisdom.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| wisdom.html:32 | https://pleadingsanity.co.uk/wisdom.html |
| wisdom.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| write.html:31 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |
| write.html:32 | https://pleadingsanity.co.uk/write.html |
| write.html:34 | https://pleadingsanity.co.uk/assets/crying-brain-og.png |

`_redirects:11–14` redirects bare and www `.uk` to `.co.uk` if those requests reach Netlify. `vercel.json:5–24` redirects the legacy Vercel hostname and www `.uk` to `.co.uk`; it does not contain a bare `.uk` rule. No redirects were changed. Public `/vercel.json` returned **404 text/html**, not a valid configuration response. A platform config need not be publicly served; this response alone does **not** prove Vercel ignored it. The effective deployment commit/config must be checked by Shane before any routing repair.

## C. Function callers and graceful-failure gaps
**No fully compliant universal failure footer is established.** Existing catches/local persistence must be preserved. A Netlify function wrapper can handle code exceptions only after the function starts; it cannot handle a platform-generated `usage_exceeded` response. Client fallbacks and cached navigation are needed too. Never convert authentication denials or failed writes into successful-looking responses.

| Source / affected features | Observed handling | Gap |
| --- | --- | --- |
| js/arron-companion.js:166–171,574–601 / arron.html | Checks non-2xx and uses local mood replies; crisis-specific reply includes footer | Normal offline replies omit mandatory footer; root knowledge matching not used here |
| js/arron-core.js:830–844 / arron-app.html | Already loads root soul and matches offline topics | Do not duplicate this mechanism; every failure footer needs validation |
| js/auth.js:49–69 / shared member UI | Parses JSON; throws server error or generic retry text | No crisis footer; successful HTML/invalid JSON can become empty data |
| js/social.js, page-* scripts, profile-form.js | Many escaped errors/toasts and loading notices | Raw server error labels may reach UI; no universal host-down footer |
| js/progress.js, guest-progress.js | Device-first progress, sync catches preserve local values | Preserve keys; show honest sync status without claiming cloud save |
| js/circle.js, my-room.js, sanctuary-notes.js | Local persistence / local-only notices exist | Partial resilience; not a universal footer |
| js/cosmic-scroll.js / feed and home surfaces | Failed post source becomes empty; local material remains | Could obscure backend failure; partial fallback only |
| js/ai-studio.js, ai-stories.js, creations.js, blueprint.js, write.js, rap-studio.js | Operation-specific errors/catches | No verified universal fallback or footer |
| js/wisdom.js, finance.js; live/videos feed callers | Fallback/error branches exist | Need non-JSON/non-2xx tests; preserve existing local tools |
| poker.html / poker-room.mts | Client has room error handling; server has no outer catch | Storage exceptions can escape; local bots are not live-room proof |
| netlify/functions/arron.mts:718+ | Chat catch returns reply/signpost shape | Non-crisis reply links to unavailable primary; logs exceed hop+status |
| posts/profile/community/stories/admin/images/studio functions | Catch returns generic JSON 500/503 | Not required footer; several log full errors/reasons |
| netlify/functions/ytFeed.mjs | Curated server fallback for missing key/upstream failures | Cannot execute while host suspended; no universal footer |

Complete detected page-to-caller inventory follows. Shared auth/progress dependencies do not mean a static page itself cannot open. Every row has at least a partial or unverified failure path under the stricter master order; no blanket “no fallback at all” claim is made.

| Page | Sources and literal API routes |
| --- | --- |
| 404.html | js/auth.js: /api/me |
| about.html | js/auth.js: /api/me |
| admin.html | js/auth.js: /api/me; js/page-admin.js: /api/admin/reports, /api/admin/reports?status=${status}; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| ai-ecosystem.html | js/auth.js: /api/me |
| ai-stories.html | js/ai-stories.js: /api/stories, /api/stories/${id}, /api/stories/${id}/heart, /api/stories?; js/auth.js: /api/me |
| ai-studio.html | js/ai-studio.js: /api/studio/battle, /api/studio/create, /api/studio/items?kind=creation&sort=${wallSort}${more, /api/studio/items?kind=podcast&sort=new, /api/studio/podcast, /api/studio/vote/${voteBtn.dataset.vote}; js/auth.js: /api/me |
| arron-app.html | js/arron-core.js: /api/arron/chat, /api/arron/health, /api/arron/memory, /api/creations |
| arron.html | js/arron-companion.js: /api/arron/chat, /api/arron/health, /api/arron/memory, /api/journal, /api/me/status |
| blueprint.html | js/auth.js: /api/me; js/blueprint.js: /api/blueprint, /api/posts |
| circle.html | js/auth.js: /api/me; js/circle.js: /api/posts, /api/reactions |
| community-dashboard.html | js/auth.js: /api/me |
| community.html | js/auth.js: /api/me; js/page-community.js: /api/community/search?${new, /api/community/search?${q}, /api/community/suggested, /api/friends; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| cosmic-connect.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game} |
| cosmic-focus.html | js/auth.js: /api/me |
| creations.html | js/auth.js: /api/me; js/creations.js: /api/creations, /api/creations/${id}, /api/creations/${id}/image, /api/creations?${q}, /api/posts |
| creator.html | creator.html: /api/owner; js/auth.js: /api/me |
| crisis.html | js/auth.js: /api/me |
| feed.html | feed.html: /.netlify/functions/ytFeed?${params}, /api/fetchVideos?${params}, /api/posts/${single}, /api/posts?${q}; js/auth.js: /api/me; js/cosmic-scroll.js: /api/fetchVideos?, /api/posts/${item.post.id}/like, /api/posts?; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| finance.html | js/finance.js: /api/finance-adviser, /api/finance-providers, /api/finance-providers?frn=${frn} |
| frequencies.html | js/auth.js: /api/me |
| games.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game} |
| journal-vault-viewer.html | js/auth.js: /api/me |
| journal-vault.html | js/auth.js: /api/me |
| kids.html | js/auth.js: /api/me |
| live.html | live.html: /api/posts; js/auth.js: /api/me |
| login.html | js/auth.js: /api/me |
| meditation.html | js/auth.js: /api/me |
| member.html | js/auth.js: /api/me; js/page-member.js: /api/blocks, /api/creations?author=${encodeURIComponent(username)}, /api/posts?${q}, /api/profiles/${encodeURIComponent(username)}; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| memory-ocean.html | js/auth.js: /api/me |
| mind-mode.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game} |
| mood-journey.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game} |
| movement.html | js/auth.js: /api/me |
| my-room.html | js/auth.js: /api/me; js/my-room.js: /api/journal, /api/posts, /api/profile |
| notes.html | js/auth.js: /api/me; js/sanctuary-notes.js: /api/notes, /api/notes/, /api/notes/import |
| number-nebula.html | js/auth.js: /api/me |
| onboarding.html | js/auth.js: /api/me; js/profile-form.js: /api/images, /api/images/banner, /api/me; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| owner.html | js/auth.js: /api/me; js/page-owner.js: /api/owner, /api/owner/approve-all, /api/owner/posts/${item.dataset.queue}, /api/owner/queue?status=held, /api/owner/roles, /api/owner/settings, /api/owner/workbench, /api/owner/workbench/${id}, /api/owner/workbench?status=dismissed, /api/owner/workbench?status=done; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| pattern-galaxy.html | js/auth.js: /api/me |
| poker.html | poker.html: /api/poker-room, /api/poker-room/ |
| post.html | js/auth.js: /api/me; js/page-post.js: /api/ai-post, /api/images, /api/posts; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| profile.html | js/auth.js: /api/me; js/page-profile.js: /api/creations?scope=mine, /api/images/banner/${esc(user.id)}, /api/journal, /api/journal${before, /api/journal/${article.dataset.entry}, /api/journal/${id}, /api/journal/${id}/share, /api/me/status, /api/posts?${q}; js/profile-form.js: /api/images, /api/images/banner, /api/me; js/progress.js: /api/progress, /api/progress/${game}; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| quote-wall.html | js/auth.js: /api/me |
| rap.html | js/rap-studio.js: /api/rap |
| reset-password.html | js/auth.js: /api/me |
| rhythm-resonance.html | js/auth.js: /api/me |
| sanctuary.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game}; js/sanctuary.js: /api/creations?scope=mine, /api/posts?filter=saved, /api/write/mine; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| sanityhub.html | sanityhub.html: /api/ytFeed?limit=8&playlist=${PLAYLIST_ID}; js/auth.js: /api/me |
| settings.html | js/auth.js: /api/me; js/page-settings.js: /api/blocks, /api/me; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports |
| shop.html | js/auth.js: /api/me |
| signup.html | js/auth.js: /api/me |
| stardust-dash.html | js/auth.js: /api/me |
| truth-tag.html | js/auth.js: /api/me; js/progress.js: /api/progress, /api/progress/${game} |
| videos.html | videos.html: /.netlify/functions/ytFeed?limit=6, /api/fetchVideos?limit=6; js/auth.js: /api/me |
| wisdom.html | js/auth.js: /api/me; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports; js/wisdom.js: /api/write/published?${q} |
| write.html | js/auth.js: /api/me; js/social.js: /api/comments/${id}, /api/friends, /api/images/${encodeURI(key)}, /api/posts/${id}, /api/posts/${id}/like, /api/posts/${id}/pin, /api/posts/${id}/save, /api/posts/${postId}/comments, /api/posts/views, /api/reports; js/write.js: /api/write, /api/write/${card.dataset.piece}, /api/write/draft, /api/write/mine, /api/write/queue |


## D. Open PRs and three security findings

| PR | State | Head | GitHub mergeability snapshot |
| --- | --- | --- | --- |
| [#92](https://github.com/pleadingSanity/pleadingsanity/pull/92) | OPEN / DRAFT | f59372a36b0de7c7e4fb277cfc2c2a288763a561 | unknown |
| [#78](https://github.com/pleadingSanity/pleadingsanity/pull/78) | OPEN | 4da61f165ef6d4595551408f2672616f17cea269 | conflicts |
| [#69](https://github.com/pleadingSanity/pleadingsanity/pull/69) | OPEN | 86650f8106bf7c027e8a19e43b00933fcbf54e7c | conflicts |
| [#48](https://github.com/pleadingSanity/pleadingsanity/pull/48) | OPEN | 1322b3f3c9e3e2d34e5e47200991c9cb385e41e0 | conflicts |

No PR was merged or modified. #92 remains draft. #78/#69/#48 reported conflicts. Recheck immediately before any future review; no automatic merge order is proposed for these older PRs. #92’s body says Arron is a shell placeholder; that is stale for this baseline: the real `arron.mts` is present and passes syntax audit.

| Claim | Verdict at audited source | Evidence / remaining proof |
| --- | --- | --- |
| Image GET lacks audience check | REFUTED on current main | netlify/functions/images.mts:64–109 checks owner, post visibility/status/hidden, profile privacy, friend/block relationships; response private,no-store. Authenticated public/member/friend/private/banner matrix NOT PROVEN. |
| Poker interpolates unescaped seat names | REFUTED on current main | poker.html:226 escapes & < > quotes; :240 renders esc(s.name). poker-room.mts:11 filters names and cleans historic room names. Hostile-name browser test and deployed parity NOT PROVEN. |
| Separate Firebase has unrestricted recursive rules | CONFIRMED in repository source | pleadingSanity/pleadingSanity-pleadingsanity at 4a149c63359eab150e6dadec56c7783023a8e2dc, firestore.rules final recursive block permits read/write unconditionally. Deployment and real exposure NOT PROVEN. Canonical firebase/firestore.rules has a deny-all catch-all; do not confuse projects. |

No auth, rules or data repair was attempted. Owner-bound emulator tests and deployed-rule inspection are required before deciding on the secondary project. Existing image and Poker fixes should not be duplicated from stale PRs.

## E. Full HTML page inventory
LIVE = verified HTML HTTP availability only, not interaction certification. NEEDS-POLISH = HTML responds but API dependencies, candidate asset mismatch, source/deploy mismatch or missing safety evidence remain. BROKEN = non-2xx/wrong content or confirmed required asset failure. Primary `.co.uk` is BROKEN at host level; pages below were requested on bare `.uk` only. All behaviour/browser claims remain NOT PROVEN.

| Page | HTTP .uk | Label | Evidence / limit |
| --- | --- | --- | --- |
| 404.html | 200 | NEEDS-POLISH | API dependency/failure review |
| about.html | 200 | NEEDS-POLISH | API dependency/failure review |
| admin.html | 200 | NEEDS-POLISH | API dependency/failure review |
| ai-ecosystem.html | 200 | NEEDS-POLISH | API dependency/failure review; served bytes differ from main |
| ai-family.html | 200 | LIVE | HTML available; interactions not tested |
| ai-stories.html | 200 | NEEDS-POLISH | API dependency/failure review |
| ai-studio.html | 200 | NEEDS-POLISH | API dependency/failure review |
| ai-welcome.html | 200 | LIVE | HTML available; interactions not tested |
| arron-app.html | 200 | NEEDS-POLISH | API dependency/failure review |
| arron-intro.html | 200 | LIVE | HTML available; interactions not tested |
| arron.html | 200 | NEEDS-POLISH | API dependency/failure review |
| blueprint.html | 200 | NEEDS-POLISH | API dependency/failure review |
| builder.html | 200 | LIVE | HTML available; interactions not tested |
| circle.html | 200 | NEEDS-POLISH | API dependency/failure review |
| community-dashboard.html | 200 | NEEDS-POLISH | API dependency/failure review |
| community.html | 200 | NEEDS-POLISH | API dependency/failure review |
| cosmic-connect.html | 200 | NEEDS-POLISH | API dependency/failure review |
| cosmic-focus.html | 200 | NEEDS-POLISH | API dependency/failure review |
| creations.html | 200 | NEEDS-POLISH | API dependency/failure review |
| creator.html | 200 | NEEDS-POLISH | API dependency/failure review |
| crisis.html | 200 | NEEDS-POLISH | API dependency/failure review |
| developers.html | 200 | LIVE | HTML available; interactions not tested |
| docs/deployment-status.html | 200 | BROKEN | 4 current-main asset 404s; deployed asset failure |
| feed.html | 200 | NEEDS-POLISH | API dependency/failure review |
| finance.html | 200 | NEEDS-POLISH | API dependency/failure review |
| frequencies.html | 200 | NEEDS-POLISH | API dependency/failure review |
| games.html | 200 | NEEDS-POLISH | API dependency/failure review; served bytes differ from main; 12 current-main asset 404s |
| get-the-app.html | 200 | NEEDS-POLISH | served bytes differ from main; 2 current-main asset 404s |
| index.html | 200 | LIVE | HTML available; interactions not tested |
| journal-vault-viewer.html | 200 | NEEDS-POLISH | API dependency/failure review |
| journal-vault.html | 200 | NEEDS-POLISH | API dependency/failure review |
| kids-series.html | 200 | NEEDS-POLISH | served bytes differ from main; 6 current-main asset 404s |
| kids.html | 200 | NEEDS-POLISH | API dependency/failure review |
| live.html | 200 | NEEDS-POLISH | API dependency/failure review |
| login.html | 200 | NEEDS-POLISH | API dependency/failure review |
| meditation.html | 200 | NEEDS-POLISH | API dependency/failure review |
| member.html | 200 | NEEDS-POLISH | API dependency/failure review |
| memory-ocean.html | 200 | NEEDS-POLISH | API dependency/failure review |
| mind-mode.html | 200 | NEEDS-POLISH | API dependency/failure review |
| mood-journey.html | 200 | NEEDS-POLISH | API dependency/failure review |
| movement.html | 200 | NEEDS-POLISH | API dependency/failure review |
| my-digital-story.html | 200 | LIVE | HTML available; interactions not tested |
| my-room.html | 200 | NEEDS-POLISH | API dependency/failure review |
| new-gen-bible.html | 200 | LIVE | HTML available; interactions not tested |
| notes.html | 200 | NEEDS-POLISH | API dependency/failure review |
| number-nebula.html | 200 | NEEDS-POLISH | API dependency/failure review |
| offer.html | 200 | LIVE | HTML available; interactions not tested |
| offline.html | 200 | NEEDS-POLISH | required safety footer absent |
| onboarding.html | 200 | NEEDS-POLISH | API dependency/failure review |
| owner.html | 200 | NEEDS-POLISH | API dependency/failure review |
| pattern-galaxy.html | 200 | NEEDS-POLISH | API dependency/failure review |
| platform.html | 200 | LIVE | HTML available; interactions not tested |
| play-listing.html | 200 | LIVE | HTML available; interactions not tested |
| poker.html | 200 | NEEDS-POLISH | API dependency/failure review; served bytes differ from main; 10 current-main asset 404s |
| post.html | 200 | NEEDS-POLISH | API dependency/failure review |
| privacy.html | 200 | LIVE | HTML available; interactions not tested |
| profile.html | 200 | NEEDS-POLISH | API dependency/failure review |
| quote-wall.html | 200 | NEEDS-POLISH | API dependency/failure review |
| rap.html | 200 | NEEDS-POLISH | API dependency/failure review |
| reset-password.html | 200 | NEEDS-POLISH | API dependency/failure review |
| rhythm-resonance.html | 200 | NEEDS-POLISH | API dependency/failure review; served bytes differ from main |
| safety.html | 200 | LIVE | HTML available; interactions not tested |
| sanctuary.html | 200 | NEEDS-POLISH | API dependency/failure review |
| sanity-solitaire.html | 200 | NEEDS-POLISH | served bytes differ from main; 4 current-main asset 404s |
| sanityhub.html | 200 | NEEDS-POLISH | API dependency/failure review |
| settings.html | 200 | NEEDS-POLISH | API dependency/failure review |
| shop.html | 200 | NEEDS-POLISH | API dependency/failure review |
| signup.html | 200 | NEEDS-POLISH | API dependency/failure review |
| site-builder.html | 200 | LIVE | HTML available; interactions not tested |
| solar.html | 200 | LIVE | HTML available; interactions not tested |
| sources.html | 200 | LIVE | HTML available; interactions not tested |
| stardust-dash.html | 200 | NEEDS-POLISH | API dependency/failure review |
| support.html | 200 | LIVE | HTML available; interactions not tested |
| tools.html | 200 | NEEDS-POLISH | served bytes differ from main |
| transparency.html | 200 | LIVE | HTML available; interactions not tested |
| truth-tag.html | 200 | NEEDS-POLISH | API dependency/failure review |
| videos.html | 200 | NEEDS-POLISH | API dependency/failure review |
| wisdom.html | 200 | NEEDS-POLISH | API dependency/failure review |
| write.html | 200 | NEEDS-POLISH | API dependency/failure review |


## F. PWA, install and offline

| Manifest | ID (preserve) | Scope (preserve) |
| --- | --- | --- |
| manifest-arron.json | /arron-app.html | /arron-app.html |
| manifest-finance.json | /finance.html | / |
| manifest-solitaire.json | /sanity-solitaire.html | /sanity-solitaire.html |
| manifest.json | / | / |

- VERIFIED: four manifests, not three; Finance is linked from finance.html. All referenced local icons/screenshots exist; decoded raster dimensions match declarations. Maskable safe-zone appearance NOT PROVEN. Store suitability is NOT PROVEN: several screenshots are brand/merch artwork rather than app screens. Main Games shortcut description still says “All 5”.
- VERIFIED: main worker precaches 166 paths and Arron worker 22; all exist locally. Per-entry catch prevents one cache miss from aborting installation. Some newer game assets are absent on the mirror. A first visit cannot install an unavailable host or conjure an uncached page.
- VERIFIED: js/site.js registers /sw.js at default root scope; Arron core registers /sw-arron.js for /arron-app.html. Preserve scopes and IDs. Existing install prompts are present. Actual install/update/offline restart on iOS/Android NOT PROVEN.
- VERIFIED: both workers use cached navigation after network rejection, but pass through non-OK HTTP responses. Thus 503 does not trigger cached fallback. Main private-page navigation similarly passes server errors through. API requests bypass the workers.
- VERIFIED: main worker excludes declared private routes and API paths from caching. This is source review only, not proof that all private data is excluded under every alternate route.
- VERIFIED: offline.html has no required contact footer/disclaimer; support.html and crisis.html contain the expected contacts/disclaimer. Main precache includes crisis.html but omits support.html and manifest-solitaire.json. Arron app’s manifest includes a home shortcut outside its narrow scope; preserve ID and review shortcut behaviour.
- VERIFIED: .uk root knowledge response is JSON, 44,561 bytes. Local Git blob is 7055cb714f70342ef6e1c0ecfc43bd6cde3e8825. Root soul was not edited. Domain-origin storage/installations remain separate; a mirror does not automatically inherit primary-origin caches or local progress.

## G. Corrected assumptions and phase boundaries

| Requested path | Main source state |
| --- | --- |
| netlify/functions/arron-chat-fallback.mts | ABSENT |
| netlify/lib/graceful-fallback.mts | ABSENT |
| js/games-buff.css | ABSENT |
| js/games-buff.js | ABSENT |
| js/tools-buff.js | ABSENT |
| assets/proposal/characters/manifest.json | ABSENT |
| api/arron/chat.js | ABSENT |

The Meta ZIP and the named space-preview HTML were not supplied. New proposed characters remain deferred. Current main already contains the previously added WebP game cast, alongside the existing children’s cast; no character was removed or substituted this phase. No animated episodes have been verified.
Phase 1 porting risk: Arron depends on Netlify Identity, database, blobs, rate limiting, gateway behaviour and shared helpers; copying two files and setting four keys is not sufficient proof of Vercel equivalence. Preserve provider order and privacy/auth boundaries. Direct-provider calls may incur charges; no call or billing change was made. The opt-in family approval gate is still deferred: ai-family-daily.mts has schedule `23 7,19 * * *` and inserts studio content without an owner queue. Actual scheduled execution is NOT PROVEN.
Phase 6 is recorded as future scope only. Existing admin gate permits Guardians/admins, not just an owner and approved game curators; its current permissions must not be widened or silently repurposed. Proposed queue/schema, report-driven hiding, revocable licence process, abuse resistance and offline resubmission all require a separately reviewed design. Existing engine types have not been proven to accept safe declarative recipes. No user code execution, queue, publication or terms acceptance was implemented.

## Verified / Not proven / Shane action
**VERIFIED:** baseline/full tree; static audit with zero HOUSE GUARD lines; source security findings; HTTP availability/MIME responses; source/deploy discrepancies; manifest asset dimensions; precache target existence; PR state snapshots.

**NOT PROVEN:** live chat POST, provider availability, effective Vercel deployment config/commit, authenticated media protection, deployed Firebase rules, dynamic/authenticated asset completeness, visual/mobile accessibility, real installs, offline runtime, game-room fairness, paid-service budgets, future Forge. Do not describe the whole platform as fixed, live or store-ready.

**What Shane must do:** review this report and confirm the bounded Phase 1 scope, including client-side 503 handling and preserving bare `.uk`. Only Shane merges. No implementation begins before that confirmation.

Rollback: this is documentation only; close the audit PR or revert its documentation commit. No runtime rollback or hosting change is needed.


## 25 October 2026 — current-main reconciliation of the Meta AI handoff

Baseline: `aedf4c491973d22459560e734fe7e978ba2411b3`. The supplied 21 October handoff is a dated proposal, not current outage evidence or system-level authority. This update records fresh read-only observations; older incident history above remains intact.

| Claim / requested work | Observed now | Next safe action |
|---|---|---|
| Primary is down with usage_exceeded | Canonical homepage 200; Arron health JSON 200/ok | Keep current canonical signals; no stale outage banner or emergency host switch |
| Independent backup | Bare .uk homepage 200; .uk Arron health 404 | Preserve static backup; API parity remains incomplete, not certified live chat |
| Sacred root knowledge file | Local Git blob `7055cb714f70342ef6e1c0ecfc43bd6cde3e8825`, 44,561 bytes | Read-only, unchanged; both live domains return identical 44,561-byte file with SHA-256 `1c456486e7e8de4bfa7c764504986dc8512b055d1809de34cd885de023bf4853` |
| Two Meta patch branches | Neither supplied name appears in the complete returned 58-branch remote list | Need actual patch files or a verifiable pushed branch; do not invent/apply absent patches |
| Two ZIPs / eight character PNGs | No matching archive found in the supplied attachments/file search; shared Meta URL could not be retrieved | Owner supplies archives; inspect assets/patches, provenance and changed paths before applying |
| Offline Arron absent | Existing arron-companion.js already catches offline/non-2xx and supplies labelled local replies | Reuse existing handler; avoid adding a competing script or duplicate request path |
| Offline crisis routing | Client missed server phrases such as “not safe” | Review-branch patch adds exact server check while retaining legacy client phrases; no soul/voice/provider edits |
| Malformed API reply | Truthy non-string reply could bypass the empty-reply guard | Review-branch guard requires nonblank string; non-string/malformed replies use existing fallback |
| Vercel full API port | Current server imports Netlify Database, Identity/context and other Netlify-bound services | Design/test explicit runtime, auth, persistence and provider adapters; no blind one-file port or credentials copied across hosts |
| Global function wrapper | APIs have different methods, auth, data and response contracts | Audit each API; do not turn failed writes/auth into success-shaped fallback or hide errors |
| Daily living-system checks | Existing daily audit/read-only public-health job and weekly security/dependency proposals | Keep reviewed source changes; no autonomous manifest/worker edits, self-merges or permanent-service guarantee |
| Everything offline / journals only local | Static cached rooms can work; account sync, fresh feeds and model replies need network | Preserve actual per-page persistence and privacy; no auth/data migration or private-page caching |
| No timers/scores versus preserve XP/streaks | Handoff contains conflicting game directions | Preserve existing games; optional untimed modes are separate reviewed additions |
| All social history / Meta AI membership | Supported Metricool sources only; no complete personal-comment archive or Meta AI operator connection | Use owner export and consent review; no token/flag grants authority or automatic AI-family membership |

### Scope and release state

Prepared only on `buff/meta-handoff-review-20261025`, with a PR for Shane's approval. No main merge, production release, redirect/DNS/provider/env change, model call, social write or new paid service. Existing root soul, branding, cast, games, manifests and account flows retained. Offline fallback wording is unchanged. A static-file hash proves file identity, not that it contains a running model. Health is availability, not a paid chat-chain test.

The fallback tests use synthetic inputs and request stubs for offline, 404, 503, network rejection, malformed/empty/non-string replies and successful reply shape. No provider or member account is contacted. Full real-device/install, signed-in data, native store and live provider tests remain unproven. See the existing release checklist for commands/results and the single AI_HANDOFF log for status.
