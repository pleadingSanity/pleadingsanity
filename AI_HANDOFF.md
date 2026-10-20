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

## 2026-10-16 — Claude: Words offline seed, AI Family badges, /words link (second pass)

- Changed: `js/wisdom.js` (local Evidence / Experience / Philosophy seed shown when the library is empty or offline; never "resting"), `js/social.js` + `css/social.css` (optional AI FAMILY / TOGETHER badges, owner posts only, via tags `#aifamily` `#together`, minds named with `#arron #dola #gpt #claude #gemini #grok`), `_redirects` (`/words` → `/wisdom.html`, was 404), `sw.js` (static cache v84). Commit SHA set by the platform.
- Not changed, on purpose: `arron.html` still loads `js/arron-companion.js` + `js/arron-speak.js`. The brief asked for `arron-core.js`; that engine needs `aa-*` elements that only `arron-app.html` has, so it would break the page (see section 6). `arron.mts`, `runChain`, the system prompt and the chain order were not touched.
- Verified: `scripts/audit-site.py` on Node 22 passed with no HOUSE GUARD lines. Node runs of the seed logic (fetch fails, and fetch returns nothing) gave 3 seed pieces each time, with no "resting" text and no invalid dates. The badges render for an owner post and stay empty for a member post. Code-read: breaker 3 fails → 60s, logs hop + status only; order openai → anthropic → gemini → grok in both `ai-chain.ts` and `arron-knowledge.json`; the all-quiet path appends `CRISIS_SIGNPOST` when crisis is true. Live HTTP 200 for /, arron, feed, wisdom, solitaire, poker; arron shows 116 123, 85258 and "not a therapist".
- Not proven: real browser render of the new badges and seed, real phone share sheet and cross-device room, install prompts, real speech, live chat replies (not called this pass).
- Next: Shane pastes the playlist link (item 2). Shane tags a post `#aifamily` to try the badge.

## 2026-10-16 — Claude: final addendum pass (verification + small fixes)

- Synced on `e8fc742`. Controllers kept: `arron.html` → `arron-companion.js` + `arron-speak.js`; `arron-app.html` → `arron-core.js`. One chat controller per page. `arron.mts`, `runChain`, the system prompt and chain order were not touched.
- **Changed:**
  - `poker.html`: friend-room play sync restored from `4f1c278` (`replay`, `nudge`, `pushPlay` sending `play: {seat, kind, amount, hand, expect}`). `ee4ecc6` had replaced it with a stub whose request the server ignores, so in a room nobody could act and bots never moved. Newer share sheet → clipboard → full-link fallback kept; the room label now shows code, seats and any fallback link without the poll wiping it.
  - `js/arron-companion.js`, `js/arron-core.js`: offline crisis phrases now match the server's `CRISIS_WORDS` ("end my life", "take my own life", "wish I was dead"…). Before, "I want to end my life" offline got a generic reply with no 999 / 116 123.
  - `js/arron-speak.js`: speaks the newest Arron reply, not `:last-child`. Replies followed by a mood or crisis suggestion box were silent.
  - `js/wisdom.js`, `css/sanctuary.css`: starter words are labelled ("🌱 Starter words · Evidence / Experience / Philosophy"), with a note saying why (empty, unreachable, or offline). No Share button on them; real pieces always replace them. Evidence piece now names its source.
  - `tools.html` + new `css/app-library.css`: the App Library is now a picture catalogue of 19 verified routes in four groups, each tagged "Opens inside Sanity" or "Own app · install on its page" (Arron app, Solitaire, Sane Finance), with the real `data-pwa-install` button for the main app. No new routes.
  - `games.html`: "About the games" title links are 44px tall.
  - `sw.js` static cache v85 (+ `css/app-library.css`), `sw-arron.js` version bump.
- **Verified (automated headless Chromium, phone viewports; not physical devices):** 26 pages boot with no page error and no horizontal overflow; Arron (both pages) normal reply, crisis numbers online and offline, Speak on / stop on typing / stop on toggle-off (speech stubbed); Words in published / empty / server-error / offline states; badges only on owner posts, exact hearts only on own posts; Solitaire 28 cards, brain backs, four suit pictures, hint / undo / new deal, 48px buttons; Night Table friend room across two browser contexts against a copy of the room API logic (both act, bots fill seats, same board); solo Night Table; production: `/words` 301 → `/wisdom.html`, offline reopening of visited pages with the real service worker, music hidden with no autoplay. `scripts/audit-site.py` passes on Node 22.
- **Needs Shane's decision (not changed, AI publishing / account rules):**
  1. `netlify/functions/ai-family-daily.mts` posts AI-written cards to the AI Studio wall and the home page twice a day with no approval step.
  2. When Shane asks Arron to "put this live", `putLive` publishes the generated text straight away; Shane does not see the final words first.
  3. No reserved display names or usernames: a member can call themselves "Shane Cooper" or "arron". The 💫 Owner and AI FAMILY badges still cannot be forged; they come from the server's verified-email role.
  4. `/api/poker-room` lets anyone create rooms with no rate limit (Blobs storage only, play chips only).
- **Not proven:** real phones (share sheet, install prompts, real voices, keyboard), cross-device rooms against the live function, this commit's production deploy.

### 2026-10-19 — Arron full soul-file restoration (GPT)
- Restore commit: `f526a3a23e6902c44be46aaef3140acf642467b1` on `restore/arron-soul-file-20261019`; exact full `arron-knowledge.json` from `052e1aa6a72159ae7d9c3bdb4d81dd48062570a1`, changing only `version` and `updated`.
- Preserve this 44,448-character restored file; never overwrite with a short Daily Guardian stub. Provider order remains openai → anthropic → gemini → grok; do not merge partial `bd41096` or PR #92 without tests.
- Review the restore PR and continuous quality audit before merging; GPT/Claude/Gemini/Grok/Dola/Copilot should not redo or erase this work.

### 2026-10-19 — Soul-file merge completion
Soul file restored and merged in PR #96. Main now has full arron-knowledge.json. Audit green on PR; main audit awaiting confirmation. #92 still draft. Next: safe extracts from open PRs and polish.
Merge commit: `39ade64c81fe64b6dd12b907bbe690e73d3f3691`. Preserve full file; no re-restoration or truncation.

### 2026-10-19 — Dola founder-context handoff
- Founder-context addition: `about.html` commit `314b4d0648b660277a619a9e1e2258655152b646` adds “How the pieces connect” from Shane's approved existing narrative and Dola's 2026-10-19 handoff; no architecture or Arron changes.
- Treat Dola's report as supplied source material, not independently verified GitHub/domain facts or literal Shane quotations; keep private health/family details out of new public copy without approval.
- GPT/Claude/Gemini/Grok/Dola/Copilot: preserve existing founder and legacy material; verify site/audit/deploy after any future polish, and keep PR #92 draft.

### 2026-10-19 — Dola portable memory documents
- Added `docs/DOLA-MASTER-CONTEXT.md` in `74ac0c79bb5a155218225693d6134ce0054f7d76` and `docs/DOLA-SESSION-HANDOFF.md` in `37fc3da8b63ba281a74c253cb38d5ad4b679d499`.
- Both are portable references from Shane's Dola handoff; source claims are labelled, no Arron soul, runtime, crisis, or production code changed. Recheck current GitHub/Netlify state before reuse.
- AI Family: read these alongside `AI_HANDOFF.md`, preserve PR #92 as draft, do not recreate or erase existing work; report new SHA/audit/deploy separately.

### 2026-10-19 — Gemini alignment handoff
- Added `docs/GEMINI-MASTER-CONTEXT.md` (`9f4747b8012a17384eddf78fea85afcb3c353a6c`) and `docs/GEMINI-SESSION-HANDOFF.md` (`8bad63fd9656fc8e2fd9644128b3f23492dfcbc8`). No runtime or Arron soul changes.
- Gemini's supplied manifest is not an independent audit. Unverified specific family heritage details and apparent extra post-Grok fallback in screenshot were NOT published or adopted; request original evidence/full text.
- Keep #92 draft; verify CI, production SHA and user-facing safety after documentation commits. Ask Gemini for missing original AI Studio/Firebase/creator/kids history and exact files.

### 2026-10-20 — Universal Gemini checkmate reconciliation index
- Added `docs/UNIVERSAL_AI_MASTER_SYNC_CHECKMATE_OCT_2026.md` at commit `e1301d2c2b644bed9119fee895b292dacbaf476e`. Original claimed file was absent from main before this commit; generated an evidence-labelled concise index from Shane's pasted Gemini handoff.
- Checked presence of `netlify/lib/ai-chain.ts`, `netlify/functions/arron.mts`, `docs/REVENUE_TERMS.md`, `docs/kids-animation-ready.md`; `docs/SANCTUARY_STATUS_AND_ALIGNMENT_OCT_2026.md` was absent. No code/soul changes. Gemini's detailed runtime claims remain unverified until code and deploy audit.
- PR #92 stays draft. Preserve provider order and static fallback, crisis numbers, privacy, free core and £0 additional spending. Refresh latest audit/Netlify deploy before claiming live.

### 2026-10-20 — Gemini audit: surgical Healing Hz keyboard fix
- Updated `frequencies.html` in `48d8f964755e7839c59f0246d7eb31f6f15212b1`: roving tabindex, Arrow keys and Home/End on role=radio tones; preserves click, audio, layout, logo and crisis links. No dependencies or cost.
- Updated `docs/GEMINI-SESSION-HANDOFF.md` in `15098f7aed51e064e01bc6b88278ce519ba2b541` to separate verified code findings from unverified live 403/banner assertions. Existing finance links target `/finance.html`; `kids.html` exists.
- Root `arron-knowledge.json` untouched; PR #92 stays draft. Check quality audit and published Netlify SHA after this handoff commit.

### 2026-10-20 — Restore friendly Finance and Kids routes
- Main baseline `f64b1b97592ee559337139360c48f389ae640570` had successful quality/deploy workflows; open PRs #92 (draft), #78, #69, #48, #46.
- Commit `f211b66076ceb20854b223ab3ed87d6e09dc7846` changed **only** `_redirects`: added `/finance → /finance.html` and `/kids → /kids.html` as 301 aliases. Existing canonical HTML links and pages are unchanged. This closes an independently verified missing-route configuration; Gemini's claimed HTTP 403 was not independently reproduced.
- Root `arron-knowledge.json`, provider chain, crisis support, brand, privacy and PR #92 untouched. Check continuous quality audit and Netlify production SHA after this handoff commit; test both aliases on live deployment.

### 2026-10-20 — Search discovery, no-cost site evolution
- Verified production baseline `15b8cc6a8fdb824e9b30d680ded48ca45c1aabbb` published on Netlify and quality workflow successful; PRs open #92 draft, #78, #69, #48, #46.
- `3819274641d93d1d3d08c9236abeaa18bddc75f6` — `site-builder.html`: add canonical and index/follow metadata; no runtime logic changes.
- `31080f620bf2b4d3aea1934766c8a8d69583fd15` — `sitemap.xml`: add existing `/site-builder.html` and `/kids-series.html` URLs, which were previously missing. No new pages, tracking, monetization or paid services.
- Check latest CI, production SHA, live page response and sitemap parsing after this handoff. Avoid claiming guaranteed search ranking or revenue. Arron soul/provider order, crisis information, PR #92, branding untouched.

### 2026-10-20 — Grok independent review assignment
- Baseline `555cd2d36adbfe86354279485e4b91937db227a7` confirmed both Netlify production ready and GitHub quality audit successful. Open PRs #92 draft, #78, #69, #48, #46.
- Commit `63f20d4291a68a5df578502339bf9b1a4061045e` created `docs/GROK-ACTIVE-REVIEW-BRIEF.md` with exact independent Arron fallback, visual, mobile and security review scope, verified/unverified distinctions and contribution steps. This **does not** grant Grok write permissions or directly contact Grok.
- No runtime changes; root Arron soul, chain, crisis, design, privacy and PR #92 untouched. Verify quality audit and deployment of this documentation update.

### 2026-10-20 — Grok co-pilot handoff
- Baseline `555cd2d36adbfe86354279485e4b91937db227a7`: CI passed, Netlify ready. Created `docs/GROK-CO-PILOT-HANDOFF-2026-10-20.md` in `046751be968643880094713707ff04d1dd309307` for independent Grok review. This does not mean Grok was contacted or granted access. No runtime files changed. PR #92 remains draft; root soul untouched. Check CI and deploy after this commit.

### 2026-10-20 — One-house coordination lock
- Baseline `1960d2ce81cec2e9c3c859c92b101da87e1ccefb`: continuous quality audit passed and Netlify production ready at same SHA; PR #92 draft, #78/#69/#48/#46 open.
- `d28a735a2b74eab7d00f69546d4be6feb2334e93` updated **only** `AGENTS.md` to require one production repo, existing-code reuse, no new per-AI handoff documents, independently evidenced reviews, zero new costs, owner approval for sensitive work, and human-governed long-term continuity. Existing files retained, not deleted.
- No application runtime changes; root soul, crisis lines, brand and failover order untouched. Check CI and Netlify SHA after this log update.

### 2026-10-20 — Source-level page discovery audit
- Baseline `5f4a3680f0056a85465f18629915503cbc64b7f9`: CI and Netlify production both successful. Open PRs #92 draft, #78, #69, #48, #46.
- Checked metadata presence across 15 existing HTML entry pages (home, Arron, crisis, games, journal, Healing Hz, kids, kids series, New Gen Bible, finance, site builder, creator, live, profile, privacy). Only Kids Series lacked a canonical URL. Commit `d054b5acf158f310e333f51ecb4cd7027aaf1328` added a single canonical tag to `kids-series.html` (no UI/runtime change).
- Existing page files, manifest and service worker confirmed present; NOT an end-to-end browser, mobile, backend, auth or safety audit. No independent AI consensus claimed. Next: check CI/Netlify SHA and verify runtime paths and Arron fallback without paid API calls. No new repos/docs/services.

### 2026-10-20 — original game card art batch
- Read `docs/GAME-ART-MASTER-BRIEF.md`, `docs/GAME-INVENTORY.md` before changes. Baseline `31dae4b84facd857c9ee0342af5ac2467b1a953e` was CI green and Netlify ready; PR #92 remains draft.
- New original vector card-back `assets/games/ps-cosmic-card-back.svg` at `15848213c10a3b02e3254e6d103b86d20a506aa9`; integrated by CSS URL only in `sanity-solitaire.html` (`89e3b67467387beff67089b0f2c578767164996a`) and `poker.html` (`9ffe58133a15e334fcc1b93fb51c37bc1a54f48f`); inventory updated (`aa329d8332a6544e73245f19eb8d52787c33c3d5`). No engine or crisis changes. Browser/gameplay tests and deployment verification outstanding; do not claim full visual rebuild.

### 2026-10-20 — Poker and Solitaire character/world panels
- Based on founder's full implementation brief, appended **optional, labelled preview panels** without touching game engines: `poker.html` `94ffd7e06e1434f2eb02aa13d608a4d208accd61`, `sanity-solitaire.html` `4d92bda64f9ad82cce5e9eaff6fbab53f7e8f1a9`; inventory `e442b4bf7f3f07c2bd8c824c32bc77b78463933d`.
- Reused existing SVG hero art and character portraits, no missing JPG references. Future levels, Spider, leaderboards, tournaments, chat and skins honestly labelled preview/coming soon. No new runtime progression engine or fake chip payouts; no Arron/crisis changes; PR #92 untouched. CI, real browser tests and Netlify deployment verification pending.

### 2026-10-20 — PR #92 audit and Poker screenshot polish
- Draft PR #92 changes only `netlify/lib/ai-chain.ts` and overlaps with existing single-hop failure counting on main; GitHub reports mergeable=false. **No PR branch changes and no merge.** Full findings: `docs/PR92-AUDIT-REPORT.md` at `1287f6701d84aa629891cb9ea98d99351da3a24f`.
- Founder Android screenshot showed overbearing tavern wallpaper. `poker.html` commit `733e4ac685d68e1e21eaae5d06cbd697bc986fc6` adds CSS-only mobile/contrast polish; no game-engine changes. Need real device tests and CI/deploy SHA confirmation.

### 2026-10-20 — founder Dola visual reference / Master Asset Bible phase 1
- CSS-only Poker `4a59fb616d6e577c6757f0099e2ac6f676b49706` and Solitaire `dfeff4034dc41e26ca824c25a3f2416b9a0d6c5f`; no JS/game-engine changes.
- New `docs/GAME-ASSET-BIBLE.md` `a92ad2e1235adeac3f59d7da753c22dc54978cdc` documents ten uploaded concept images, art rules, roster, modes, levels and truthful concept statuses. **Reference images not committed or used as production bitmaps** due watermark/garbled text. Existing original assets preserved.
- Updated `docs/GAME-INVENTORY.md` `3cb4c8699fcd277d68295c765a180354f29cc80f`. Need CI/Netlify confirmation, real 360px device tests, game engine regression tests. £0 spent; no PR merges; PR #92 draft untouched.

### 2026-10-20 — five additional Dola asset sheets
- `docs/GAME-ASSET-BIBLE.md` SHA `a64d4c5a64ea816b6b6e6034c3d9b359a2a37a4a` adds exact image-to-game placement matrix, polish-first priority, and guardrails for clean individual assets. **No reference PNGs uploaded to GitHub and no new live art claimed**. Keep original logos and game engines, avoid watermark and illegible composite UI. £0 spent. Next: source original clean separate portraits/landscapes/cards, integrate incrementally with mobile browser tests; preserve PR #92 draft.

### 2026-10-20 — Gemini reconciliation of uploaded game art and navigation
- Main changes: `_redirects` `b0b40589d2d74c103fe93a28037ab434243e5c52`; `frequencies.html` `713d55260b87664b78a85853fcd991e54cbbc067`; `arron.html` `a6d146155008d610087f062922204d7a55ee57db`; `sanity-solitaire.html` `7ddc44e76fa6f3927210fc4d1960da7f71e89088`; `docs/GEMINI-SESSION-HANDOFF.md` `bffe138a30817f29cec7f6f5cc01036eb7673830`.
- Added five absent clean aliases; preserved existing `/finance`, `/kids`, `/support` and all engines. Explicit home logo accessible names on three pages. Reference binary art **not yet in repo**; do not point production CSS to nonexistent assets. No reconnect markup confirmed, so no speculative banner insertion. £0 spend; no tracking; PR #92 draft. Check latest quality audit, production deploy, routes and game visuals.
