# Tactile star buff — 24 Nov 2026

Additive, smallest-safe change. Draft PR only; do not merge without Shane's exact phrase.

## What was wrong (audit of /, /app, /games, /community, /feed, /about, /shop, /insane-radio, /ai-studio, /arron)
- **App Hub art broken on 12 of 34 cards**: cards that wrap art in `<picture>` rendered it as a separate tall dark block (CSS only targeted `.store-card > img`).
- **Inner card boxes blurred the art**: a broad `[class*="card"]` rule (legion-buff.css) gave the card name, blurb and tags their own border, tint and backdrop blur.
- **Mobile dock looked broken**: `.ps-dock:is(a,button)` (missing space) meant labels sat top-left with no centring; no icons; LIVE was solid teal instead of amber; 6 buttons on 2 rows.
- **Home "Find your own way in" art was dim, dull, purple-tinted** (finance, games, AI family, journal, community, frequencies), and the AI-family art was a redrawn (non-official) crying brain.
- **App Hub art**: purple/pink AI Social UI mock-up, a portrait photo in landscape cards (Solar AI Office, Off Grid), the same image reused 3 times (AI Family, Grok Imagine, Grok bot), aurora hero with violet tones.
- Text-only outline buttons with no hover, press or focus feedback.

## What changed
- `css/tactile-20261124.css` (new): gradient teal→sky→amber borders, glow, hover lift, `:active` press, focus-visible rings, 44px+ targets, image-led cards (16:9 art banner on home cards, art-forward App Hub cards), glowing headings, App Hub `<picture>` fix, inner-card blur fix, dock icons/centring/amber LIVE/one row, shooting-star streaks + soft solar glow. Reduced motion and Calmer view switch motion off. Crisis links are never moved, hidden or animated.
- `js/site.js`: dock gets inline SVG icons; `aria-current` also matches pretty URLs; loads the new CSS and adds the streak layer (skipped on crisis, login, signup, reset-password, manifesto, reduced motion and Calmer view).
- `<link>` to the new CSS on the 10 hub pages above (no flash).
- 10 new brand-locked images in `assets/images/tactile-20261124/` (WebP 640 + 1024, 680 KB total, lazy except the App Hub hero). No text, no people, no Shane photos, no redrawn logo.

## Not touched
login, signup, reset-password, payment code, crisis.html, manifesto, Netlify env, crisis numbers.
