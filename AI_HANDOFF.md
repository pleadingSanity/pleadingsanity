# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-16 by Claude (Arron + Night Table restore, house guards, this Start Here section). Earlier: 2026-10-13 by GPT, following Grok.

---

## START HERE — every AI, every new chat, before you touch anything

You may be a fresh chat with no memory of this house. That is fine: this file is the memory.
Shane Cooper owns this site. His prompts are often short. Your job is to work out what he means
from this file, not to guess, rebuild, or start again.

### 0. Who can see this file

The GitHub repository is **public**, so anyone can read this file there. The website does not
serve it (`_redirects` returns 404). **Never write a key, token, password, private journal,
user data or a personal phone number in this file or anywhere in the repo.** Names of
environment variables are fine; their values are never written down.

### 1. Read in this order

1. This section (Start Here), then the newest dated entry at the bottom of this file.
2. `AGENTS.md`: roles, rules, standard cycle, priority backlog.
3. `CLAUDE.md` and `.github/copilot-instructions.md`: the three-pass check (sky, solitaire, games).
4. `docs/AI_COORDINATION_OCT_2026.md`: what only Shane can do by hand (credits, keys, Firebase).
5. Only then the code you are about to change.

### 2. The one house (never create a second)

| Thing | Where |
|---|---|
| Repo | `github.com/pleadingSanity/pleadingsanity`, branch `main` |
| Live | https://pleadingsanity.co.uk (`.uk` and `www` redirect to it) |
| Host | Netlify site `pleadingsanity`. No build command. Publish dir is the repo root |
| Front end | Plain HTML/CSS/JS at the root, `js/`, `css/`, `assets/`. No framework, no build tools |
| Back end | `netlify/functions/*.mts` (APIs under `/api/...`), shared code in `netlify/lib/` |
| Data | Netlify Database (Postgres via Drizzle: `db/schema.ts`, migrations in `netlify/database/migrations`). **Never edit or delete an applied migration.** Add a new one. Netlify Blobs for files |
| Sign-in | `js/auth.js` + Netlify Identity |
| Offline/PWA | `sw.js` (scope `/`, never change), `manifest.json`, `manifest-arron.json`, `manifest-solitaire.json` |
| Automatic check | `scripts/audit-site.py` runs on every push to main (`.github/workflows/continuous-quality-audit.yml`) |

### 3. Map of the important pieces

| Feature | Page | Engine / code | Notes |
|---|---|---|---|
| Arron (web) | `arron.html` | `js/arron-companion.js` + `js/arron-speak.js` | **Not** `arron-core.js`, which errors here. Strict CSP: no new inline scripts on this page |
| Arron (app) | `arron-app.html` | `js/arron-core.js` | Own manifest, id `/arron-app.html` |
| Arron brain | `/api/arron/*` | `netlify/functions/arron.mts` | `CRISIS_SIGNPOST` and the quiet path live here |
| AI chain | — | `netlify/lib/ai-chain.ts` → `runChain` | Order **GPT → Claude → Gemini → Grok** → free spares. Circuit breaker: 3 fails → 60s skip, logs only hop + status |
| Arron's soul | — | `arron-knowledge.json` | `covenant.chain` overrides the code's chain list. Keep the same order |
| Games shelf | `games.html` | `js/games.js`, `js/house-voice.js`, `js/progress.js` | Each game has its own picture and engine |
| Solitaire | `sanity-solitaire.html` | inline + `js/games.js` | Own manifest. Every back/felt/theme stays selectable |
| Night Table | `poker.html` | inline module + `js/holdem-eval.js`, `/api/poker-room` | Play chips only. Friend rooms need no account; empty seats are bots |
| Guest progress | — | `js/guest-progress.js` (`ps-guest-progress`) | Synced and adopted on sign-in through `js/progress.js` → `/api/progress` |
| Homepage cards | `index.html` | `css/card-polish.css` | Picture behind readable text; whole card clickable |
| Music | `index.html` | `js/ps-music.js` | Hidden until Shane pastes a playlist link into `data-playlist` / `data-link` |
| Offline note | most game pages | `js/offline-note.js` | Shows only when the network drops |
| Feed / stories | `feed.html`, `/` | `.cs-scroller`, `js/scrollFeed.js` | Snaps inside its own box; Escape leaves full screen |
| Crisis / support | `crisis.html`, `support.html` | — | Always free, always reachable |

### 4. Rules nobody breaks (from Shane, 16 Oct 2026)

- **Evolution, not erasure.** Patch the working file. Never delete a working page, function, provider, look, card, link or install id. No rewrites from scratch.
- **Arron has one voice.** Do not change his tone, the system prompt structure, or the chain order.
- **Crisis lines are forced** in every crisis reply, even when every model is down: 999, Samaritans 116 123, Text SHOUT to 85258, NHS 111 option 2. The "not a therapist" line never goes.
- **Free forever:** Arron, journal, feed, games, crisis help. No paywalls. No paid API, no paid voice. Default extra spend £0.
- **Voice** is the browser's own Web Speech API only. Optional, off until chosen. Never send or store audio.
- **Brand:** one crying-brain logo. #000103, #0d1b2a, #00fff0, #eef6ff, one pink accent #ff4d8d. System fonts only.
- **Legacy page is facts only:** Private A.L. Cooper, RAOC, Mentioned in Despatches, London Gazette 29 November 1945. Nothing invented.
- **Mobile first:** no forced zoom, touch targets ≥ 48px, images never cover text, no sideways scroll, reduced motion respected.
- **Games:** play chips only, no cash, no gambling. Healing tones 174/285/432/528/741/963 Hz only, soft.
- **Privacy:** guest progress stays on the device until sign-up. Log only hop + status on AI failures, never message content.
- **No second anything:** no second Arron, brand, domain, Netlify site, Vercel project or Grok app.
- **Never claim** a test, integration or AI conversation you did not actually run. Write "not proven" instead.

### 5. Rules that disagree — current ruling

| Conflict | Ruling until Shane says otherwise |
|---|---|
| `copilot-instructions.md` says "no NHS lines on public pages"; Shane's 16 Oct brief forces 999 / 116 123 / SHOUT / NHS 111 in Arron's crisis replies | **Arron's crisis replies keep all four.** Ask Shane before touching either rule |
| `CLAUDE.md`/`AGENTS.md` say branch + reviewed PR; `copilot-instructions.md` and the 16 Oct brief say push to main | Small, reversible fixes may go to main. Anything large, or touching security, sign-in, payments or data, gets a PR and Shane's OK |

### 6. Mistakes that already happened (do not repeat)

- **Blank pages from shell text.** An AI committed `arron.html` and `poker.html` containing only `$(cat /tmp/...)` / `$(python3 -c ...)`. Both pages went blank on the live site. Write the real file contents, then open the file and check it. The house guards in `scripts/audit-site.py` now fail the check if this happens.
- **"Already done" that wasn't.** `css/card-polish.css` and `js/guest-progress.js` were reported done but no page loaded them. Check that a file is actually linked before you say so.
- **Wrong engine.** `arron.html` was pointed at `arron-core.js` (the app's engine), which looks for elements the page does not have.
- **Chain list drift.** A display list in the soul file read Claude first. Check order in `ai-chain.ts` **and** `arron-knowledge.json`.
- **Founder identity.** Do not attribute brand or other accounts to Shane without his confirmation (see the 13 Oct entry).

### 7. Before you push — checklist

1. `git pull` (or refresh `main`), read the newest entry here, and do not overwrite another AI's fresh work.
2. Make the smallest change that fixes the root cause.
3. Run `python3 scripts/audit-site.py` (Node 22+). It must print no `HOUSE GUARD` lines.
4. Open each page you changed (browser or HTTP). Say which you opened and which you could not.
5. Add a dated entry at the bottom of this file using the template below.

### 8. Open work — who does what next

| # | Task | Owner | Status |
|---|---|---|---|
| 1 | Add OpenAI quota (GPT 429) and xAI credit (Grok 403 spending-limit), only if he chooses to spend | **Shane** | Open, owner-only |
| 2 | Paste the playlist link (Spotify and/or Amazon Music) into `index.html` `data-ps-music` | **Shane** (or any AI once he gives the link) | Open |
| 3 | Confirm or reverse the NHS-lines ruling in section 5 | **Shane** | Open |
| 4 | On a real phone: Night Table share sheet + friend room from a second device, install prompts for site/Arron/Solitaire, Speak on and off | **Claude** (or Shane by hand) | Not proven |
| 5 | Sign up on a device that has guest levels/chips; confirm they appear after sign-in | **Claude** | Not proven |
| 6 | Night Table uses the main manifest. Decide whether it needs its own install id (new id = new icon; never change existing ids) | **GPT** to propose, Shane to approve | Open |
| 7 | Review the 16 Oct circuit-breaker change (one count per hop) in `ai-chain.ts` | **GPT / Gemini** review | Done, needs review |
| 8 | Authenticated creator flows and private media access tests | **Claude** | Open since 13 Oct |
| 9 | Authorised social export scopes; Firebase stays as is | **Gemini** | Open since 13 Oct |
| 10 | Grounded original copy, only from real source posts | **Grok** | Waiting on sources |
| 11 | Vercel mirror (`pleadingsanity.uk`) parity with main | **GPT** to check, Shane to approve any spend | Open since 13 Oct |

### 9. Entry template (copy to the bottom, newest last)

```
## YYYY-MM-DD — <AI name>: <one-line summary>
- Changed: <files>, <commit SHA if known>
- Why: <the problem, in one line>
- Verified: <what you actually ran or opened>
- Not proven: <what still needs a real device, account or owner>
- Next: <who does what>
```

### 10. How Shane can hand work to any AI

Paste this as the first message in any new chat (Claude, GPT, Gemini, Grok, Copilot):

> You are working on Pleading Sanity. Repo: github.com/pleadingSanity/pleadingsanity (branch main). Live: https://pleadingsanity.co.uk.
> Before doing anything, read AI_HANDOFF.md from "START HERE" to the newest entry at the bottom, then AGENTS.md. Follow every rule there.
> Today's task: <what I want>.
> Do the smallest change that works. Never delete working things. Run python3 scripts/audit-site.py before pushing.
> When done, add a dated entry to the bottom of AI_HANDOFF.md and tell me in plain words what changed, what you checked, and what you could not check.

If the AI cannot read GitHub, paste the Start Here section in with it.

---

Older verified notes follow. Read `CLAUDE.md`, `AGENTS.md` and
`.github/copilot-instructions.md` first. This file records **what was verified**, **what was changed**,
and **what is still open**, so the next agent starts from evidence, not assumptions.

## STOP before you edit main

The Grok HTTP 403 is an empty xAI balance (`spending-limit`). The model name and URL are correct. The function is on `main`.

Do not replace `netlify/lib/ai-chain.ts`. Do not add credits or raise caps from code. Do not point this site at another Firebase project.

Grok speaks again only after the owner adds xAI credit. Claude continues to answer. One Arron message is the test after any key change.

## Ground truth

| Item | Value | How verified |
|---|---|---|
| Production site | https://pleadingsanity.co.uk | Netlify |
| Main before 13 Oct visual audit | `89ce1e1015fc2537c359733f68e76e045b7587da` | GitHub; always refresh main before edits |
| Staging | Stale. Use deploy previews. | Netlify |
| Build | Static + functions + Drizzle | `netlify.toml` |

## Arron's AI chain

Order: **GPT → Claude → Gemini → Grok → free spares**.

| Provider | Status |
|---|---|
| GPT | HTTP 429 (quota). Failover works. |
| Claude | Answers in production. |
| Gemini | Available. |
| Grok | **HTTP 403 spending-limit.** Owner must add credit. |

Context is capped. Thin replies are provider fallback, not missing memory.

## Sane Builder (private)

- New page: `/builder.html` (commit `639584b` and later).
- For Shane Cooper and the AI family only. Lives inside the existing sanctuary PWA so it updates automatically. No separate install.
- Persistent notes and page checklist saved in localStorage on the device.
- Generates a ready-to-paste next prompt that includes current work, unchecked pages, and the handoff rules.
- Direct links to GPT, Claude, Gemini, Grok and Copilot.
- This instance is free for the house. Licensed copies for other sites are possible later; do not confuse the two.
- Homepage quick links now include a Sane Builder link.

## Changes this run (Grok)

| Area | Change | Commit |
|---|---|---|
| Design system | Site-wide tactile button active states + card lift | `31b7fe8` |
| Earlier | Homepage purpose lines + hero glow | `10ba6cf` |
| Earlier | Arron crisis numbers visible (116 123 · 85258) | `9fc08ef` |
| Security / chain | Untouched. | — |

## AI assignments (do your part)

- **Claude:** Image visibility check on `/api/images/*` and blob cleanup. Confirm homepage + Arron polish deploys. Report evidence in this file.
- **GPT:** Draft creator revenue terms (eligibility, fees, refunds, tax, payouts) before any payment work. No live charges.
- **Gemini:** Secondary repo rules hardening only. Do not touch this site's Firebase.
- **Copilot:** Small isolated CSS or accessibility fixes only. No chain or security changes.
- **Owner:** Add xAI credit. Raise OpenAI quota. Confirm showcase images load after deploy.

## Still open

- xAI spending-limit and GPT 429 (owner action only).
- All six referenced homepage showcase JPG files and three space images exist in GitHub. Public HTTP loading on both hosts still needs a browser/network check.
- Kids episodes remain animation-ready drafts only. No video claimed.
- Creator 90% offer remains planned scope, not live.

One source. Evolution, Not Erasure. Rise From Madness.

## 2026-10-13 — GPT founder-copy review and mirror parity (verified source + hosting metadata)

- **Production baseline for this review:** Netlify published `910fc533ae40d301639ff04ce258a0414e56c9ff` on the `pleadingsanity` site. Recheck the latest deploy after subsequent docs commits; do not mistake published deploy metadata for a browser smoke test.
- **Grok's concurrent founder-copy polish retained:** `about.html`, `community.html`, `index.html` now link Power for Our People UK **as a separate founder initiative**, link LinkedIn, use the founder-supplied TikTok URL, label Ivan's family history appropriately on the About page, and give clearer medication guidance. GPT did not overwrite Grok's changes.
- **GPT's focused commits:** `9c9ab00` (`movement.html`: family-story caveat, separate initiative, TikTok URL); `f407e4c` (`arron.html`: clear AI-companion SEO, visible Samaritans 116 123 and SHOUT 85258); `5d97531` (`journal-vault.html`: more accurate private-journal SEO, visible support contacts); `0f15122` (`about.html`: accurate free-sanctuary meta description and separate Instagram/TikTok handles). No serverless, authentication, payment, Firebase, PWA or AI-chain changes.
- **Existing purpose and disclaimer copy retained:** Games “Soft focus when the mind is loud”; Finance “Honest numbers. No sales pressure”; Journal “Private words. Yours alone”; Arron explicitly is not a therapist; Finance explicitly is not a lender or regulated adviser; crisis page visibly includes 999, 116 123 and 85258 in the HTML. No clinical outcome claims added.
- **Existing images inspected:** six homepage showcase JPGs plus three cosmic aurora backgrounds are present as GitHub blobs and fit their page subjects. Main homepage references these files; no new images or logos were generated. Public loading, performance and visual sizing still need real browser/network verification.
- **Mirror status:** Vercel project `html-starter-pleadinsanity-2179` has verified custom domain `pleadingsanity.uk`, no domain redirect configured, latest **READY** deployment recorded as commit `89ce1e1`. Separate `www.pleadingsanity.uk` project `html-starter-pleadinsanity` had a **READY** deployment at `181c2f1`. Neither matches the current GitHub/Netlify main SHA. Domain HTTP 200 checks and exact response-body parity could not be completed with available HTTP access. **Do not assert full parity or functioning Netlify API routes on Vercel until tested.** Same repository does not guarantee equivalent backend capabilities.
- **Open copy checks:** many older footers outside the polished main pages still reference `https://www.tiktok.com/@mentally.inshane`; user's current specified TikTok link is `https://www.tiktok.com/@mentallyinshane`. Completed a single atomic bulk link fix on main: commit `0993ba9` changed 45 files (one TikTok URL line per file, no other content); no dozens of release commits. User-provided Facebook/LinkedIn/TikTok URLs could not be independently opened owing to provider restrictions; verify by hand.
- **Grok long-copy pack:** some external phase-1–3 drafts, master bio and voice guide were described by the founder but no matching standalone copy pack was located in repository search. Current HTML is the authoritative deployed copy. Preserve any later original Grok source if supplied; do not invent missing copy.
- **Next safe steps:** sync Vercel mirror projects to a single reviewed GitHub SHA after checking deployment cost controls; verify `.co.uk` and `.uk` status, primary artwork, 7 critical routes and fallback behaviour with real HTTP/browser tests; arrange site-wide legacy TikTok link consistency; keep the remaining privacy/image-access audit with Claude.
- **Finance rule:** £0 additional spending unless the founder explicitly approves it. No billing, credential or infrastructure settings changed in this review.

## 2026-10-13 — founder TikTok address normalised in one atomic commit

- Commit `0993ba9a6e6547f86b94a524bac7d8e153a32959` on `main` changes 45 HTML/README files, each replacing only `https://www.tiktok.com/@mentally.inshane` with the exact founder-supplied `https://www.tiktok.com/@mentallyinshane`. GitHub comparison verified 45 files, each with one line added and one removed. Existing Grok-updated homepage, About, Community and Movement were not overwritten.
- Netlify/GitHub deployment parity for this commit requires the next deploy confirmation. The custom Vercel mirror domains must still be compared to main and synced separately; do not represent the backup as fully current without evidence.

## 2026-10-13 — Sane Builder, LIVE Creator and social audit

- Verified source in `builder.html`, `site-builder.html`, `creator.html`, `live.html`, `ai-studio.html`; details in `docs/CREATOR-BUILDER-SOCIAL-AUDIT-2026-10-13.md`.
- Sane Builder is a **publicly accessible URL** with device-local notes/checklists; not an authenticated or automatically collaborating AI agent. A concurrent Grok/other-agent update added import/export and accurate local limitations. GPT added `noindex` in commit `4063062`.
- Public Sane Site Builder generates a client-side handoff brief, **does not crawl/fix/deploy third-party sites**; current copy accurately states this.
- Creator LIVE page GPT fix `5e6cec9`: HTTPS URL validation, safer local text rendering, correct Twitch parent on each host, accurate local-only chat label, truthful non-broadcast banner. Signed-in feed share code preserved; production end-to-end user tests still needed.
- A Metricool connection was approved and confirmed, but Metricool reported **no social networks connected to its brand**; account-connection step is `https://app.metricool.com/brands/connections?blogId=7408654`. No complete historical Instagram/TikTok/YouTube/Facebook/LinkedIn post audit has occurred; authorised platform connections/exports required. Do not scatter links across the site as a replacement for content research.
- Claude next: authenticated LIVE feed share, replay form, mobile browser, page images, creator profile and private media authorisation regression tests; no payment, auth or backend rewrite without review.
- Gemini next: authorised social account import possibilities; privacy/account scopes/exports. Grok next: grounded, reviewable content synthesis only after actual posts are available.
- No additional paid spend authorised. No new repo or branch created. Vercel mirror parity remains unresolved.

## 2026-10-13 — current Builder, Creator and visual follow-up (GPT)

- New review evidence is consolidated in `docs/CREATOR-BUILDER-SOCIAL-AUDIT-2026-10-13.md`. The source audit covered 78 HTML pages and 22 CSS files with no confirmed missing local media references; this is not a browser/media-network test.
- Public `site-builder.html` now makes honest, free, goal-specific client-only review prompts; personal `builder.html` exports/imports notes and local checklist; both remain non-agent tools. `creator.html` has clear onboarding and existing studio artwork. Homepage now foregrounds Creator Hub / public Site Builder instead of repeating founder social links. `my-digital-story.html` can preview opt-in local text exports and create an owner-review pack, **not** connect to social networks or generate a complete AI biography.
- Local behaviour tests passed for Site Builder (goals, URL validation) and My Digital Story (two-caption sample, review pack); parsed non-module JS syntax checks passed. Signed-in sharing, backend privacy, live provider embeds, full archive social audit and actual device tests are still pending.
- Continue zero-spend rule. Avoid concurrent AI overwrites: refresh `main` and this file first. Claude: authenticated creator flows and media access. Gemini: authorised social export/connection scope. Grok: grounded original content only after source history is genuinely available.

## 2026-10-13 — verified Metricool accounts and founder identity correction

- **Founder confirmed:** Shane Cooper, `mentally.inshane`. DO NOT identify the founder as `pleadinngsanity`, `thecreatormma6`, or the connected Metricool brand `A.M.C mobile diagnostics` without his express confirmation.
- Metricool brand `7408654` now connects five social networks. Source retrieval found **one** Instagram Reel from the connected brand profile dated 2025-05-29 and **zero rows** from the other published-post queries across the available date range. This is **not** an all-post founder audit. Do not invent missing social posts.
- GPT initially drew an overly strong first-person attribution from the brand Reel while expanding `about.html` and `shop.html`. This was immediately corrected in commits `f912dfd` and `c9e9728` respectively: the source is now identified as a *Pleading Sanity-branded Reel*, not a personal Shane Cooper post. First-person founder details are based on existing approved site content instead.
- GPT's other additive edits to `about.html`, `shop.html` and `movement.html` contain origin, builder background, free sanctuary purpose, and creative mission; see `docs/SOCIAL-CONTENT-AUDIT.md` for sources, coverage and owner confirmation required. Social imports, creator sharing and posting are NOT automated.
- Next: **ask founder whether the connected brand accounts are his**, and connect/export `@mentally.inshane` to audit the actual requested account. Do not replace linked social profile URLs until verified; do not commit raw exports or sensitive user information. Default additional spend £0; no new repo or branches.

## 2026-10-16 — Claude: Arron and Night Table pages restored, polish pass, house guards

- **Changed:**
  - `arron.html` was restored from `764b56b`, because it held only `$(cat /tmp/arron-fixed.html)`. It now loads `js/arron-companion.js` + `js/arron-speak.js`.
  - `poker.html` was restored from `27d3612`, because it held only `$(python3 -c ...)`. The share fix was re-applied: share sheet, then clipboard, then the full link on screen; the room code shows.
  - `js/arron-speak.js`: aria label, speaks each reply once, stops on typing.
  - `js/arron-companion.js`: the offline crisis reply now carries 999 / 116 123 / SHOUT / NHS 111.
  - `netlify/lib/ai-chain.ts`: one breaker count per hop. Order unchanged.
  - `arron-knowledge.json`: display-only `aiChain` list reordered GPT first.
  - `sanity-solitaire.html`: 48px buttons on phone, daily glow.
  - Guest progress is wired into Solitaire and Night Table and synced via `js/progress.js`.
  - `index.html`: links `css/card-polish.css`, adds the hidden `js/ps-music.js` player.
  - New `js/offline-note.js`.
  - `sw.js`: cache bumped to v83.
  - House guards added to `scripts/audit-site.py`.
  - `_redirects` stops the website serving `AI_HANDOFF.md`, `AGENTS.md` and `CLAUDE.md`.
- **Verified:**
  - Live `/api/arron/chat` normal message replied, answered via `anthropic`, so GPT was skipped (likely the 429).
  - Local crisis message returned 999 + 116 123 with provider `none`, through the rate-limit branch because the database wasn't reachable locally.
  - The all-quiet branch was code-read: it appends `CRISIS_SIGNPOST`.
  - Simulated browser: `arron.html`, Solitaire (28 cards), home (8 cards), `games.html`, `feed.html` and 11 game pages boot clean.
  - The guards pass on the current tree and fail on a simulated blank page.
- **Not proven:** Night Table and Games module scripts (syntax only), the real phone share sheet, install prompts, real speech, cross-device rooms, sign-up adoption.
- **Next:** see the Start Here table, items 2–7.

One source. Evolution, Not Erasure. Rise From Madness.
