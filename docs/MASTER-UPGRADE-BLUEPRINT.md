# Master Upgrade Blueprint — Pleading Sanity / P.S Studio
Copy-paste master prompt for the coding AI, grounded in the actual repository
audit (`docs/AUDIT-20261120-UPGRADE.md`). Dates: 2026-11-20. Run phases in
order; stop for confirmation after Phase 0 audit and after each phase build.

---

## MASTER PROMPT (paste into the coding AI)

### ROLE
Principal Full-Stack Architect, Creative UI/UX Engineer (vanilla CSS, GSAP,
lightweight WebGL/Three.js where it pays), Accessibility Lead, and Automated
Media Pipeline Engineer for a static Netlify site with serverless functions.

### CONTEXT
Repository: public GitHub `pleadingSanity/pleadingsanity`, static HTML/CSS/JS
plus `netlify/functions`, Supabase migrations and a `maker/` 3D-print archive.
Brand: Pleading Sanity free mental-health sanctuary and P.S Studio commercial
side (3D prints, studio music, shop). Voice: "Rise From Madness — Evolution Not
Erasure", "One Source. One Family." Midlands, UK audience. Existing ecosystem
(89 root pages) includes Arron AI, Journal Vault, Insane Radio, Community Feed,
Quote Wall, New Gen Bible, Sanity Solitaire / Night Table, Aura Hz, Sane
Finance, Insane Solar, Sanity Law, AI Office, AI Social, Shop and Prints.

### NON-NEGOTIABLE ETHICS
1. Arron, Journal Vault, Community Feed, games, crisis help (999 / Samaritans
   116 123 / Shout 85258 / NHS 111) remain 100% free, ad-free and paywall-free.
2. Commercial data (orders, payments, supporter lists) stays in separate
   tables/stores from sanctuary visitor records; no cross-selling tracking.
3. No advertising networks, no third-party trackers beyond the existing
   allowlist, no data selling.
4. No paid AI provider call without the owner's explicit approval in chat;
   code fails closed when a key is absent.
5. Internal ownership arrangements and private personal material never appear
   in public copy, commits or images.

### HARD ENGINEERING RULES (zero deletion)
- Never delete routes, pages, database tables, schema, working functions or
  assets. Superseded code: wrap in `/* LEGACY_BACKUP 2026-11-20: reason */`
  or move to `archive/`; unused images move to `archive/originals/` after a
  referenced-by audit.
- Every change lands on a feature branch and opens a Pull Request; never push
  directly to `main` and never merge without the owner's explicit merge phrase.
- Run before each commit: `node --test tests/prints.test.js`,
  `node --test tests/ps-studio-catalog.test.mjs`, the catalogue JSON parsers,
  and a secret scan (serial, LAN IP, check code, `sk-`, `ghp_`, `gho_`,
  `github_pat_`, JWT `eyJ`, `AIza`). Stage explicit paths; never `git add -A`
  after any build-materialize step.
- Preserve all crisis numbers in every user-facing page: `tel:999`,
  `tel:116123`, `sms:85258?body=SHOUT`, `tel:111`.
- Keep brand palette: background `#0b0f19`, teal `#00fff0`, sky `#38bdf8`,
  amber `#f59e0b`, silver; no purple/pink/indigo gradients. Respect
  `prefers-reduced-motion`.

### PHASE 0 — AUDIT (already partly done; extend before editing)
Use `docs/AUDIT-20261120-UPGRADE.md` as the baseline and produce:
1. A complete file tree table: path, size, role, referenced-by count.
2. Image usage matrix for every raster: page(s) that reference it, current
   format, byte size, derived formats planned.
3. Navigation inventory: for each page list which menu block it uses; mark
   duplicates to consolidate into one Orbital Command Dock.
4. Function inventory: live / stub / disabled; required env var per function.
5. Broken-link and missing-asset list (the audit found `/support.html` used in
   `ps-studio.html` while the real page is `/support-us.html`; two music pages
   lack the literal crisis strip; two zero-byte functions exist).
6. Output the plan and wait for owner confirmation before Phase 1.

### PHASE 1 — SOLAR-SYSTEM UI / NAVIGATION OVERHAUL
Goal: a calm, premium, space-themed shell that groups the 89 pages into five
planets plus a central sun, replacing the repeated stacked-link menus.
1. Central Sun (landing core, `index.html` and shell): Arron entry
   (`arron.html`, `arron-app.html`) and Crisis (`crisis.html`) always one tap
   away; hero uses the existing cosmic artwork, not new heavy 3D.
2. Five planet groups (map to real filenames; each planet card lists its pages):
   - Sanctuary Planet: `arron.html`, `arron-app.html`, `crisis.html`,
     `journal-vault.html`, `journal-vault-viewer.html`, `mind-mode.html`,
     `meditation.html`, `frequencies.html`, `aura-hz.html`, `mood-journey.html`,
     `offline.html`, `kids.html`.
   - Sound & Studio Planet: `insane-radio.html`, `sanity-songs.html`,
     `rap.html`, `music-creator.html`, `creator-studio-music.html`,
     `creator.html`, `creations.html`, `videos.html`, `blueprint.html`.
   - Community & Philosophy Planet: `community.html`,
     `community-dashboard.html`, `feed.html`, `post.html`, `quote-wall.html`,
     `wisdom.html`, `new-gen-bible.html`, `ai-social.html`, `ai-family.html`,
     `ai-stories.html`, `circle.html`, `movement.html`, `my-digital-story.html`.
   - Play & Mind Planet: `games.html`, `sanity-solitaire.html`, `poker.html`,
     `shed-card-game.html`, `number-nebula.html`, `pattern-galaxy.html`,
     `stardust-dash.html`, `truth-tag.html`, `ai-studio.html`, `write.html`.
   - Practical & Enterprise Planet: `shop.html`, `prints.html`,
     `ps-studio.html`, `creator-prints.html`, `marketplace.html`, `finance.html`,
     `insane-solar.html`, `solar.html`, `solar-trade.html`,
     `solar-ai-office.html`, `off-grid.html`, `sanity-law.html`,
     `site-builder.html`, `builder.html`, `tools.html`, `platform.html`.
   Account pages (`login`, `signup`, `settings`, `profile`, `member`,
   `owner`, `admin`, `reset-password`) live in a fixed account tray, not a planet.
3. One unified Orbital Command Dock (desktop bottom/side rail; mobile bottom
   sheet) replaces repeated top/bottom menu blocks; old menu markup is wrapped
   as legacy or removed only after the dock covers every existing href.
4. Motion: CSS transforms/scroll-linked transitions or GSAP; orbital SVG ring
   paths; hover micro-interactions; hardware-accelerated only; pause everything
   under `prefers-reduced-motion`.
5. Site-wide Calmer View toggle (already present on a few pages): static,
   low-glow, no-parallax alternative; persisted in `localStorage.ps-calm`.
6. Typography: one editorial display face for headings, system/clean sans for
   UI; subtle glassmorphism (`backdrop-filter`), thin orbital borders, no
   generic boxy cards and no stock gradients.
Acceptance: every existing href still resolves; crisis strip present on all
pages; Lighthouse accessibility >= 95; keyboard focus order logical; contrast
AA; reduced-motion path tested.

### PHASE 2 — IMAGE AND PERFORMANCE PIPELINE
1. Add build-time/local conversion step (no external paid service required):
   produce WebP for every JPG/PNG over 80 KB and AVIF where the toolchain is
   available; keep originals in `archive/originals/` (not deleted).
2. Every `<img>` outside the hero gains `loading="lazy"` and
   `decoding="async"`; above-the-fold hero uses `fetchpriority="high"` and
   preload `<link>`.
3. Add `srcset`/`sizes` for responsive art; radio covers and solar imagery
   (the largest files in the audit) get 480/800/1200 widths.
4. Compress targets: hero art under 250 KB, covers under 180 KB, UI icons stay
   SVG; total image payload on the landing route under 600 KB.
5. Audit-referenced candidate-orphan images: confirm usage with grep before
   moving anything; never delete.
6. Targets: Lighthouse Performance and Accessibility >= 95 on mobile and
   desktop; First Contentful Paint under 1.5 s on a 4G profile; no layout shift
   from images (explicit width/height or aspect-ratio boxes).
Acceptance: catalogue tests unchanged green; every page still renders its
existing images; original bytes archived.

### PHASE 3 — ARRON AI AND MULTI-AGENT LAYER
1. Streaming responses in the UI (server-sent stream where the function
   supports it; graceful fallback to full render when offline).
2. Memory: persist conversation context per the existing tests
   (`tests/arron-memory-id.test.mjs`, offline boundary tests); keep the
   explicit Forget-Me / memory-wipe control visible; never ship the service
   key to the browser.
3. Guardrails and escalation: every Arron view states it is an AI companion,
   not a therapist; one-tap crisis buttons (999 / 116123 / 85258 / 111)
   remain visible on conversation screens.
4. Provider chain stays OpenAI -> Anthropic -> Gemini -> Grok with graceful
   skip; surface a short "provider unavailable" tag, never a token or raw
   error body. Keys come from Netlify env only.
5. Knowledge layer: wire `SUPABASE_KB_URL` / `SUPABASE_KB_SERVICE_ROLE_KEY`
   when supplied; `kb-embed` and `kb-search.mts` activate; otherwise skip
   cleanly.
6. Shared brain module: extract stable, reusable logic into `/ai-core/` so the
   same prompt system, safety rules and utilities can be mirrored to the
   second brand site without copying pages.
Acceptance: all Arron tests green; offline mode still answers; no secret
pattern appears in client code; crisis paths reachable from every Arron view.

### PHASE 4 — HUMAN-AI SOCIAL FUN AND POSITIVITY REWARDS
1. Feed (`feed.html`, `community.html`): opt-in positive reactions (hearts /
   thanks) with rate limits; verified-positive contributions earn non-monetary
   community badges on the profile; no leaderboard shaming, no negative scoring.
2. Creator collaboration tools: keep `studio-podcast-background.mts` and
   music functions; design a human-plus-AI co-host segment flow using real
   uploaded voice recordings; no cloned voices without explicit written
   consent; synthetic content labelled where a platform requires disclosure.
3. AI social pages (`ai-social.html`, `ai-family.html`, `ai-stories.html`):
   clearly label AI-generated posts; humans remain the account owners.
4. Rewards stay non-financed until revenue phase approval; badges never gate
   free tools.
Acceptance: privacy policy updated; no email/address collection beyond the
existing forms; tests for reaction limits added; free tools unchanged.

### PHASE 5 — APPROVED REVENUE ENGINES (core stays free)
1. Music pipeline (Insane Radio / Creator Hub): connect approved music
   generation and visualizer outputs only after key approval; render 16:9
   YouTube and 9:16 Shorts assets; embed platform required synthetic-content
   disclosure; link shop, radio and licensing in descriptions; respect
   YouTube eligibility thresholds rather than promising ad income.
2. Licensing surface: extend the existing copyright copy into a simple
   licensing list for original art and audio; checkout through existing
   approved hosts (Payhip/TikTok/PayPal); Stripe only when Shane provisions
   keys and approves the product.
3. Shop and prints: keep the `netlify/lib/prints.ts` gate; real photos,
   compliance fields and safety warnings before any live row; toy-form parts
   stay draft until EN 71/UKCA paperwork exists.
4. Solar and finance: transparent lead-capture forms for `insane-solar.html`
   and `finance.html`; clear privacy note; no predatory products.
5. Supporter page (`supporter.html`, `support-us.html`): optional 99p and
   micro-donations with community badges; no feature paywall; receipts and
   amounts logged only in the approved payment provider, never in client JS.
Acceptance: each revenue feature toggles off cleanly without its key; free
pages identical without donations; security scan clean.

### PHASE 6 — SECOND BRAND SITE `legallyinsane.co.uk`
1. Facts (2026-11-20): DNS live on Porkbun nameservers; HTTP 80 serves a
   parked Coming-Soon page; HTTPS has no certificate yet; no MX/TXT; no code
   here. `illegallyinsane.co.uk` remains NXDOMAIN and must not be confused
   with the live spelling.
2. Provision: attach the zone to the same Cloudflare account (or Porkbun DNS),
   create a separate host project (recommended: separate Netlify site), issue
   TLS, add `www` CNAME and a 404 page; keep records and keys out of the repo.
3. Code: new repo or isolated subtree; reuse `/ai-core/` from Phase 3; write
   separate crisis, privacy and brand copy; separate env, separate data
   stores; no shared customer orders or sanctuary visitor records.
4. Purpose: AI test/sandbox and second studio presence; break there must never
   touch production on `pleadingsanity.co.uk`.
Acceptance: HTTPS 200, content distinct and non-duplicative, zero shared
secrets, deploy rollback documented.

### EXECUTION PROTOCOL (MANDATORY)
1. Phase 0 audit output first; wait for owner confirmation.
2. One phase per Pull Request; after each: run tests, local build sanity,
   secret scan, accessibility spot check, then report before the next phase.
3. No blind rewrites; refactor behind legacy markers; preserve every route.
4. Never merge to `main` and never push to `main` without the owner's exact
   merge phrase.
5. Paid services (model APIs, music generation, image generation, SMS,
   payments sandbox) require explicit approval before keys are used.

### OWNER SUPPLY LIST (keys and dashboard actions this code cannot self-serve)
- AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`,
  `GROK_API_KEY` / `XAI_API_KEY` (approve per provider; paid calls only after
  chat approval).
- Payments: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`,
  `PAYPAL_MERCHANT_ID`; Payhip store link; optional TikTok Shop link.
- Backend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_KB_URL`, `SUPABASE_KB_SERVICE_ROLE_KEY`; run the Supabase link /
  `db pull` repair per the drift runbook.
- Access: `NETLIFY_OWNER_EMAILS`; SMTP `SMTP_HOST/PORT/USER/PASS` (app
  password); optional `YOUTUBE_API_KEY`; optional VAPID/Firebase public
  config only when those features are switched on.
- Domains: Porkbun/Cloudflare access for `legallyinsane.co.uk` DNS and TLS;
  hosting project choice confirmed by owner.

---

## Internal reference: measured starting points (from the audit)
- 89 pages; 383 images / ~32.3 MB; 41 functions (two zero-KB stubs);
  160 CSS/JS/TS files / ~1.42 MB.
- Largest rasters and page weights are listed in the audit; Phase 2 starts
  with those names.
- Existing open PRs (#372, #373, #374) remain unmerged; the three Netlify
  preview checks fail account-side while production serves 200.
