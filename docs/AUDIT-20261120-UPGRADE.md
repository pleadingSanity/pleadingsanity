# Upgrade audit — Pleading Sanity / P.S Studio, 2026-11-20

Method: static read-only scan of `main` @ `ba3a7da0` plus the open branches
(#372 shop batch, #373 Orca file, #374 print pack). No files were deleted or
rewritten by this audit; recommendations below move or archive, never erase.
Numbers come from the working tree on the audit branch.

## 1. Snapshot

| Area | Measure |
|---|---|
| Static pages at root | 89 HTML files, ~2.41 MB total HTML |
| Heaviest pages (>60 KB) | `insane-solar.html` 164 KB, `sanity-solitaire.html` 81 KB, `poker.html` 74 KB, `about.html` 64 KB, `new-gen-bible.html` 64 KB, `solar-ai-office.html` 62 KB, `games.html` 62 KB |
| Images | 383 files, ~32.3 MB: webp 200 files / 9.2 MB, jpg 113 / 16.6 MB, jpeg 3 / 2.6 MB, png 20 / 2.5 MB, svg 46 / 0.5 MB, ico 1 |
| CSS / JS / TS | 160 files, ~1.42 MB; largest `js/arron-core.js` 64 KB, `js/music-creator.js` 46 KB, `js/music-player.js` 42 KB, `css/site.css` 39 KB, `js/games.js` 34 KB, `js/arron-companion.js` 33 KB |
| Netlify functions | 41 files; two 0 KB stubs (`studio-weekly.mts`, `turso-health.mts`) |
| Supabase | 3 local migrations, 1 edge function (`kb-embed`); no `config.toml`; Preview check drift documented in `docs/` runbook |
| Crisis coverage | `/crisis.html` linked from most pages; only `creator-studio-music.html` and `music-creator.html` lack the literal `999` string in markup |
| Open PRs | #372 shop first live batch; #373 Orca workspace file; #374 print-pack archive. All mergeable but blocked by the same three account-side Netlify preview checks; production main serves HTTP 200 |

## 2. Findings

### 2.1 Information architecture and navigation
- 89 pages share a repeated top/bottom link set. Most frequent in-page links:
  `/crisis.html` (283 references), `/games.html` (127), `/shop.html` (119),
  `/feed.html` (108), `/about.html` (104), `/ai-stories.html` (100),
  `/creations.html` (98), `/movement.html` (98), `/ai-ecosystem.html` (98),
  `/quote-wall.html` (97), `/wisdom.html` (97), `/arron.html` (69).
  The same destinations appear in several page-specific menus, which reads as
  clutter rather than duplication of code.
- Dangling internal reference: `ps-studio.html` links `/support.html`; the real
  page is `/support-us.html`. Fix by repointing or adding a `_redirects` rule;
  do not delete either file.
- Two zero-byte function stubs should either be implemented, commented as
  disabled, or moved under an `archive/functions/` note.
- Ten pages carry "coming soon" copy blocks; these are honest placeholders, but
  each should carry a visible status (planned / in test / awaiting photo) rather
  than generic text.

### 2.2 Visual theme state
- A dark theme system already exists: `localStorage.ps-theme`, shared
  `css/legion-buff.css`, plus theme-specific stylesheets under `css/`
  (`cosmic-depth.css`, `city-night.css`, `galaxy-depth.css`, `design-system.css`
  and others).
- A "calmer view" / reduced-motion behaviour exists only in a handful of files
  (`index.html`, `games.html`, `about.html`, `js/games.js`, `js/wisdom.js`).
  It should be promoted to a site-wide toggle respected by every animated view.
- Brand constraints already enforced in code and tests: dark `#0b0f19`,
  teal `#00fff0`, sky `#38bdf8`, amber `#f59e0b`, silver; no purple/pink/indigo;
  `prefers-reduced-motion` respected where media queries are present.
- The requested "moving through the solar system" direction is compatible with
  the existing cosmic assets (`images/solar*.jpg`, cosmic theme CSS); the work
  is grouping and motion, not a brand replacement.

### 2.3 Image and asset pipeline
- No modern-srcset strategy was found: markup uses single `<img src>` paths;
  there is no `srcset`/`sizes`, no AVIF, and `loading="lazy"`/`decoding="async"`
  are inconsistent.
- Largest raster files (conversion candidates; verify usage before changing):
  `assets/images/r2-2026/hero-cosmic.jpeg` 1.28 MB, `images/radio/cover-bass.jpg`
  981 KB, `assets/images/r2-2026/solar-handoff.jpeg` 864 KB,
  `images/radio/cover-oldschool.jpg` 683 KB, `images/radio/cover-uk-grime.jpg`
  559 KB, `assets/images/r2-2026/shop-activewear.jpeg` 472 KB,
  `images/radio/cover-rnb.jpg` 464 KB, `images/radio/cover-ambient.jpg` 449 KB,
  `images/radio/cover-nowplaying.jpg` 441 KB, `images/radio/cover-eclectic.jpg`
  432 KB, `images/solar11.jpg` 419 KB.
- Basename scan suggests roughly 35 image files (~4.7 MB) are not referenced by
  current HTML/CSS/JS; this is a heuristic only (dynamic paths, CSS background
  lists and generated names are missed). Treat as a candidate archive list:
  move originals to `/archive/originals/` after confirmation, never delete.
- SVG icon/art files (46, ~0.5 MB) are already efficient and should be kept.

### 2.4 Auth, identity and backend wiring
- Browser identity layer exists: `js/vendor/netlify-identity.js`, `js/auth.js`,
  `login.html`, `signup.html`, `reset-password.html`, `settings.html`, and
  owner/creator gates in `netlify/lib/social.ts` and
  `netlify/functions/creator-studio.mts`.
- Missing Shane-side configuration (code fails closed; nothing guesses values):
  `NETLIFY_OWNER_EMAILS`; provider keys in section 2.5; PayPal trio in 2.6;
  Supabase keys in the drift runbook; SMTP host/user/pass for outgoing mail.
- Known limitation recorded in `docs/BACKEND_GAPS.md`: the identity JWT cookie
  is not `httpOnly`. Documented, not changed in this sweep.
- Supabase Preview failure is migration-history drift; the runbook lists the
  `supabase link` + `db pull` repair and requires dashboard access not present
  here.

### 2.5 Arron and the AI layer
- Surface: `arron.html`, `arron-app.html`, `js/arron-core.js`,
  `js/arron-companion.js`, `js/arron-app-enhance.js`, `js/arron-page-enhance.js`,
  `js/arron-speak.js`; functions `arron.mts` (49 KB), `arron-grow.mts`,
  `arron-health.mts`, `arron-memory.mts`; libs `arron-knowledge.ts`,
  `arron-tools.ts`, `arron-growth.ts`; knowledge `arron-knowledge.json`;
  tests for chain keys, memory id, phase 2, provider config and offline boundary.
- Provider chain order: OpenAI -> Anthropic -> Gemini -> Grok; missing keys
  skip gracefully and the UI reports a short unavailable state. No key value ever
  reaches the browser; error strings are stripped of token patterns.
- Gaps once keys are supplied: streamed response rendering, persistent
  cross-session memory with the existing Forget-Me controls, clearer guardrail
  copy (Arron is a companion, not a therapist; instant crisis buttons), and
  connection of the knowledge base ingest when Supabase keys exist.
- This environment has no Grok/xAI credentials; Grok-side checks must run on
  Shane's own logged-in client.

### 2.6 Revenue readiness (free core preserved)
- Shop gate (`netlify/lib/prints.ts`) already enforces price, real photo,
  mockup off, stock or made-to-order, batch, warnings, material, licence,
  age band and toy compliance. PR #372 promotes three complete items; the
  toy-form pug keyring stays draft pending EN 71/UKCA paperwork.
- Payment configuration still requires `PAYPAL_CLIENT_ID`,
  `PAYPAL_CLIENT_SECRET`, `PAYPAL_MERCHANT_ID`; until all three exist the UI
  hides PayPal and shows message-to-order.
- Existing non-PayPal surfaces: Payhip store link and TikTok Shop host allowlist
  in the studio catalogue; optional 99p supporter page (`supporter.html`,
  `support-us.html`); solar and finance lead surfaces (`insane-solar.html`,
  `solar-trade.html`, `finance.html`); music functions `ytFeed.mjs`,
  `music.mts`, `profile-songs.mts`, `creator-studio.mts`.
- Rules kept from prior sweeps: paid AI calls only after explicit approval;
  100% of net print proceeds to the sanctuary; no ads or data selling on core
  tools; commercial data separate from sanctuary records.

### 2.7 Domains
- `legallyinsane.co.uk`: DNS live on Porkbun nameservers
  (`curitiba/fortaleza/maceio/salvador.ns.porkbun.com`), A records
  `207.207.210.107` / `207.207.210.229`; HTTP 80 returns a parked
  "Coming Soon" page with a legacy GA tag; HTTPS handshake fails (no TLS cert);
  no MX/TXT records; no site files or hosting project attached here.
- `illegallyinsane.co.uk`: NXDOMAIN (Status 3), no A/NS records; never
  provisioned in this workspace.
- Bring-up separation: the second brand needs its own repo/stores, its own
  crisis/privacy copy, and no shared customer database with the sanctuary.

## 3. Prioritized backlog

### P0 — unblock what already exists (code changes reviewable on branches)
1. Repoint `/support.html` reference to `/support-us.html` or add a redirect.
2. Add the crisis strip/`999` reference to the two music pages.
3. Fold the audit + blueprint docs onto the open branch pattern; tests stay green.
4. Confirm the three open PRs' diffs; leave merge to the explicit phrase.

### P1 — Shane-side configuration (no code deletion possible here)
1. Netlify env: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`,
   `GROK_API_KEY` (only approved spend); `PAYPAL_CLIENT_ID/SECRET/MERCHANT_ID`;
   `NETLIFY_OWNER_EMAILS`; Supabase URL/anon/service keys and KB pair; SMTP
   host/port/user/pass (app password).
2. Supabase `link` + `db pull` per the drift runbook; review every pulled SQL
   file before commit.
3. `legallyinsane.co.uk`: choose host (recommend Netlify on the same Cloudflare
   zone), set DNS records, issue TLS, create separate repo and privacy/crisis copy.

### P2 — experience upgrades (phased, confirm each phase before the next)
1. Solar-system information architecture: five planet groups mapped in the
   master blueprint; single orbital command dock; site-wide calmer view.
2. Image pipeline: WebP/AVIF derivatives, `srcset`, lazy/async, hero preload,
   archive originals folder; Lighthouse 95+ target.
3. Arron upgrades: streaming UI, memory persistence with Forget-Me, guardrail
   and crisis buttons, KB ingest activation.
4. Positivity rewards and human-AI social/collaboration features (badges,
   feed hearts, podcast/creator tools) on opt-in, non-monetary rules until the
   revenue engines are approved.
5. Revenue engines: music/YouTube pipeline with synthetic-content disclosure,
   licensing store, solar/finance lead forms, supporter badges; free core
   remains free.

## 4. Guardrails applied to every phase

- Zero deletion: unused or superseded files move to `archive/` or are wrapped
  in `LEGACY_BACKUP` comments; routes and database schemas are never removed.
- No secrets in the public tree; env values live only in host dashboards.
- Sanctuary tools stay free, ad-free and without paywalls; commercial records
  stay in separate tables/stores.
- Internal ownership figures and private/personal material are never published.
- Every change lands on a feature branch; tests run locally; merge only on the
  explicit merge phrase.
