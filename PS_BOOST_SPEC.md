# PS Boost Spec — shared pattern (all agents MUST follow)

Repo root: `/home/user/.dola/agent_mode/workspace/.sessions/38416038144267537/agents/o_0000iQ3vvxI/repo`

## Shared assets (already created — do NOT recreate)
- `/css/ps-boost.css` — smooth scroll, page fade-in, .ps-reveal, 44px targets, img CLS guard
- `/js/ps-boost.js` — IntersectionObserver reveal + smooth anchor scroll

## Every HTML page you own must get (unless already present)
1. `<link rel="stylesheet" href="/css/ps-boost.css">` in `<head>` AFTER existing stylesheets.
2. `<script defer src="/js/ps-boost.js"></script>` before `</body>` (or in head with defer).
3. Font preconnect IF the page loads Google Fonts: add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` BEFORE the fonts.googleapis stylesheet link.
4. Every `<img>`: add `loading="lazy"` and `decoding="async"`. EXCEPTION: the single above-the-fold hero/LCP image gets `loading="eager"` (or leave as-is) and `fetchpriority="high"`. Keep existing width/height attrs; if missing and dimensions known, add them.
5. Inline `<style>` and inline `<script>`: minify (strip comments + unnecessary whitespace) where safe. Do NOT break JSON-LD blocks.
6. Render-blocking: any non-critical CSS `<link>` gets `media="print" onload="this.media='all'"` ONLY if safe; prefer leaving critical CSS alone. Add `<link rel="preload">` only for the LCP image if obvious.

## Brand lock (hard constraints — fix violations found)
- NO purple/indigo/pink/magenta/violet hues. Replace with approved palette: cyan `#00fff0`, sky `#38bdf8`, amber `#f59e0b`, deep `#0d1b2a`, black `#000103`, silver `#cbd5e1`. Note `--ps-magenta` is already aliased to amber — leave that var alone; only fix literal purple/indigo/pink values and color names.
- NO emoji in HTML. Remove or replace with inline SVG / text. (Emoji inside JS string literals for game art may stay if gameplay depends on it — flag it, don't break games.)
- Crisis numbers on every page: Samaritans 116 123 (UK), 999/112 emergency, 988 (US) acceptable. If a page lacks any crisis reference, add a small footer strip linking to /crisis.html. 3 pages currently missing.
- Savings claims: must say "typically" (e.g., "typically saves you…"). If a page makes an unqualified savings promise, soften with "typically".
- AI never certifies: no text claiming AI certifies/guarantees/endorses medical outcomes. Add disclaimer if needed.

## Smoothness
- 390px viewport: no horizontal scroll, no overflow. Touch targets ≥44px (ps-boost.css enforces baseline; fix inline styles that override it smaller).
- No layout shift: ensure images have dimensions, no late-injected content pushing layout.
- Add `class="ps-reveal"` to a few key card/section containers per page (optional but encouraged; safe).

## Internal links
- For every `href` on your pages that is internal (relative or absolute to pleadingsanity.co.uk), verify the target file exists in the repo. Report broken links; fix obvious typos. Anchor links (`#x`) must resolve to an element id on the same page.

## Do NOT
- Do not deploy. Do not commit/push. Do not touch files owned by another agent (see ownership lists).
- Do not break working features. Preserve all existing functionality, PWA manifests, service workers, Netlify functions, Firebase config.
- Do not print/expose secret values. If you find a secret, move it to env var reference and report.

## Report back (required)
List every file you modified, exact change summary, broken links found+fixed, brand violations fixed, and any blocker. Keep working features intact.
