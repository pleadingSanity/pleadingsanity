# Imagery audit — 23 November 2026

Live house only: [https://pleadingsanity.co.uk](https://pleadingsanity.co.uk). 66 sitemap pages crawled this afternoon (Europe/London). Branch: `feat/imagery-buff-20261123`. Draft PR only — do not merge to main without Shane’s exact phrase.

Brand lock: cosmic dark `#0b0f19`, teal `#00fff0` / `#38bdf8`, amber `#f59e0b`, silver. No purple, indigo, pink or violet in *new* art. Official Crying Brain logo is used as-is (never redrawn). The official mark itself has magenta/violet tears; that is left untouched (Evolution Not Erasure). No emoji, watermarks, or text inside generated images. No fake completed installs. No real people in generated shots.

Shopify is out of scope: a paid new site would erase the free sanctuary. This buff stays on the existing Netlify house.

## Method

- Crawled all 66 sitemap URLs for `<img>`, `<source>`, `og:image`, `twitter:image`, favicons and CSS `url()` images.
- Probed unique real assets (154 raw hits; junk template strings such as `${art}` and bare `1200`/`630` discarded).
- Measured dimensions, byte size and a purple/pink pixel scan on priority files.
- Ranked weaknesses by traffic importance (home first), then shop, Insane Solar, creator studio, finance, community, Arron, kids (kept separate).

## Weakest 10 (by importance)

1. **Sitewide Open Graph — [https://pleadingsanity.co.uk/](https://pleadingsanity.co.uk/) and most inner pages.** `assets/crying-brain-og.png` is **630×331** (below the 1200×630 share standard), palette-indexed, and carries a heavy purple fringe. This is what Elon (or anyone) sees when the site is posted on X.
2. **Home hero — [https://pleadingsanity.co.uk/](https://pleadingsanity.co.uk/).** `assets/images/r2-2026/hero-cosmic.jpeg` is 1920×1080 but **1.3 MB**. Optimized WebPs already exist, but the lead art is a generic nebula-brain, not the official Crying Brain.
3. **Shop clothing preview — [https://pleadingsanity.co.uk/shop.html](https://pleadingsanity.co.uk/shop.html).** `shop-activewear.jpeg` (483 KB) uses **coral/orange stitching and on-garment text**, plus a coral box-shadow (`rgba(255,107,107)`). Off-brand. Merch catalogue shots also have text baked into the frame (“FULL FACE” etc.).
4. **Insane Solar products / atmosphere — [https://pleadingsanity.co.uk/insane-solar.html](https://pleadingsanity.co.uk/insane-solar.html).** Hero used a reused `solar-energy-loop.jpg`. Kit shots were small and soft (`battery-wall.webp` 10 KB). The older `solar-hero.webp` is a cartoon house array (a “fake install” look). `solar.html` has no content imagery at all, only the undersized OG.
5. **Finance hero — [https://pleadingsanity.co.uk/finance.html](https://pleadingsanity.co.uk/finance.html).** The finance page was showing the **solar energy-loop graphic** as its lead image.
6. **Community — [https://pleadingsanity.co.uk/community-dashboard.html](https://pleadingsanity.co.uk/community-dashboard.html).** `community-dashboard-hero.webp` is only **18 KB**, a flat empty room with a single teal ring. Low depth, feels basic.
7. **Creator studio — [https://pleadingsanity.co.uk/ai-studio.html](https://pleadingsanity.co.uk/ai-studio.html), [ps-studio.html](https://pleadingsanity.co.uk/ps-studio.html), [music-creator.html](https://pleadingsanity.co.uk/music-creator.html).** P.S Studio and Music Creator had **no content hero**. Music Creator’s OG was a 256 px square logo (`twitter:card` was `summary`, not a large image). AI Studio used the undersized site OG and no visible studio photograph.
8. **Arron — [https://pleadingsanity.co.uk/arron.html](https://pleadingsanity.co.uk/arron.html).** No content hero on the live chat page (only the official logo in the nav, plus the undersized OG). `arron-app.html` used a soft 1280×720 / 35 KB figure.
9. **Kids — [https://pleadingsanity.co.uk/kids.html](https://pleadingsanity.co.uk/kids.html).** Hero was a 1176×784 “two cubs” card with the generic site OG. Kids must stay visually separate and child-friendly; the old card was not a premium hero.
10. **Inner pages with almost no unique imagery.** Examples: [solar.html](https://pleadingsanity.co.uk/solar.html), [solar-trade.html](https://pleadingsanity.co.uk/solar-trade.html), [off-grid.html](https://pleadingsanity.co.uk/off-grid.html), [marketplace.html](https://pleadingsanity.co.uk/marketplace.html), [prints.html](https://pleadingsanity.co.uk/prints.html), [circle.html](https://pleadingsanity.co.uk/circle.html), [supporter.html](https://pleadingsanity.co.uk/supporter.html). Many are icon + undersized OG only. Held for a later free batch so this pass could stay at ~12 generated images.

## Other notes (not in the 12-image cap)

- The October 2026 hero batch (`images/heroes/*`, typically 1280×720, often 15–40 KB) is widespread and often soft or generic. Left in place as fallbacks.
- Editorial thumbs such as `connected-lights-640.webp` (5.8 KB) and `quiet-journal-640.webp` carry purple casts. Not replaced in this cap.
- `images/crying-brain-cosmic.jpg` (shop, 784×1168) also scans purple. Official logo is used instead where we added new art; this file was not deleted.
- Favicons and Apple touch icons are present and load (200). Not regenerated.
- No broken real image URLs on the 66 live pages (the raw “404s” were parser junk: template literals and width fragments).
- Crisis numbers 116 123, 85258, 111 and 999 were left exact and tappable. `crisis.html`, login, signup, reset-password, payment code and the manifesto were not edited.

## What this branch generates and wires

Twelve GenerateImage calls, then official-logo composites (PIL, not a redraw) for the OG card and the home hero. Each asset ships as WebP plus a JPEG fallback, all under 300 KB.

See the “Generated assets” table in the pull request body and the file list under `assets/images/buff-20261123/`.

## Alive motion (same draft PR, CSS/JS only)

Added `css/alive-20261123.css` and `js/alive-20261123.js`, loaded from `js/site.js` on pages that already use it, and linked directly on `insane-solar.html`, `arron-app.html` and `ps-studio.html` (no `site.js` there).

1. Slow CSS starfield / parallax drift behind the page (`#ps-alive-stars`, two very light gradient layers, 140s / 200s).
2. Soft teal/amber glow pulse on key CTAs (`.btn`, `.door`, `.hp-card`, `.btn-amber`, finance quick links) and on the official Crying Brain mark (`.ps-brand img`, `img[src*="crying-brain-logo"]`).
3. Card hover lift with a teal/amber glow edge.
4. Fade-up on scroll via `IntersectionObserver` (no new libraries). Heroes and LCP images are skipped to protect performance.

All four respect `prefers-reduced-motion` and the existing Calmer view (`body.ps-calm`). Crisis banners, sticky crisis footers and tappable crisis links are never animated. `crisis.html`, `login.html`, `signup.html` and `reset-password.html` are skipped entirely.

## Held / blockers

- Image cap of about 12 kept, so inner pages in item 10 still need a later cheap batch.
- Existing merch photos that show a person (Shane’s catalogue) were **not** replaced with generated people. New clothing art is ghost-mannequin only.
- Official logo tears remain magenta — that is the official mark, not a new drawing.
- Shane’s weekly Grok Bot extra credit was $0; generation was capped and then stopped.
- Do not merge to main until Shane gives the exact approval phrase.
