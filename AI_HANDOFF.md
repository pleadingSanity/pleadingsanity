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

### 2026-10-20 — GPT: original game artwork integrated and browser checked
- Baseline `90a88f365b1ed542bed1a550a785d87bd8606f7f`. PR #99 was already merged as `e513085`; did not merge it again or touch #92.
- Added eight original raster portraits (Ollie, Zara, Bruno, Blinky, Max, Mia, Nova, Pip) at 512px plus 128px avatars; two 1280px landscapes (Aurora Lakes, Forest Tavern), all locally served WebP, approximately 808 KiB total. Existing SVGs and brand logo retained.
- Wired portraits/scenery into Poker, Solitaire, games shelf, App Hub catalogue and Kids Series. New scoped `css/ps-game-art.css` keeps cards on a quiet high-contrast felt; landscapes are separate hero illustrations. Kids episodes remain plans, not claimed videos. New cast entries are story characters, not extra live opponents.
- Service worker static cache v87 includes the artwork and CSS; manifest IDs/scope and private-page rules unchanged.
- Verified: `python3 scripts/audit-site.py` passes (78 HTML, 202 script blocks); `git diff --check`; all 18 WebP files decode. Headless Chromium: 17 pages at 360x900 and 1440x900, reduced motion, zero page errors, no document horizontal overflow, no broken new artwork. 14 shelf cards; 37 hub entries, search and favourite; Poker seats/Fold/New hand; Solitaire 28 cards, Hint/Draw/Undo/New peaks and all four mode selectors. Phone and desktop screenshots inspected for the changed game layout.
- Not proven: real-device touch/install/speech, exhaustive win/chip-accounting cases, authenticated or real cross-device rooms. No game-rule change in this batch.
- Deployment blocker observed independently: latest deploy workflow build succeeds, but Netlify hook returns 404. Newly added Mayhem/Defender workflows also fail before this artwork batch; no scan protections or secrets changed here. Check production published SHA separately; do not equate a GitHub push with publication.
- Final visual regression: Solitaire `paintMeta` previously replaced every body class; now removes only the known table-look classes, preserving the artwork/theme classes. Card corner text inherits suit colour without glow; existing suit pictures use an inverted multiply treatment on light faces. Four focused phone/desktop Poker/Solitaire checks and the static audit passed after this fix.


## 2026-10-21 — GPT: Phase 0 master-order audit only
- Changed: GAP_REPORT.md plus this append-only documentation entry, on polish/gpt-master-phase0-2026-10-21 from main 97f20e4. No application code or hosting settings changed. The latest owner order supersedes older direct-main and canonical-redirect instructions: branch only, Shane holds merge, preserve the working bare .uk mirror.
- Why: establish evidence before incident recovery, visual polish, store readiness or the proposed Game Forge.
- Verified: full non-shallow source tree; audit-site.py passes 78 root HTML / 202 JS/TS blocks with zero HOUSE GUARD lines; HTTP GET sweep of all 79 HTML paths and declarative assets; .co.uk and www .uk return usage_exceeded, bare .uk serves HTML; root soul matches main byte-for-byte. Source image-audience and Poker escaping fixes already exist. Separate prototype repository still has permissive recursive Firestore rules. Four manifest IDs and both service-worker scopes preserved.
- Not proven: authenticated/live chat and provider calls, effective Vercel config, deployed Firebase rules, full dynamic asset coverage, browser/mobile/install/offline runtime, app-store eligibility, future Game Forge. No deploy, merge or main push claimed.
- Next: Shane reviews GAP_REPORT.md and confirms Phase 1 scope. Stop here; no Phase 1–6 implementation before confirmation.

## 2026-10-21 — Claude (Netlify agent run): Phase 1 recovery check and failure-path fixes
- Baseline: `97f20e4e03d4f21512eb0381e6af66aa7ac179b7` (main, matches GitHub). Read PR #100 `GAP_REPORT.md` (draft, unmerged). PR #92 untouched. Branch and head SHA are assigned by the Netlify agent runner, which also opens the PR. I could not name the branch `polish/netlify-phase1-2026-10-21`. Nothing merged, nothing pushed to main.
- **Recovery, observed 2026-10-20 ~23:50 UTC:** `.co.uk` answers 200 again (Phase 0 saw 503 `usage_exceeded`), and `/api/arron/health` returns JSON 200. It still publishes **59fcb42**, the commit whose `games.html` is a 2.4 KB stub. Netlify recorded no deploy at all for the main pushes from 20:26 UTC onwards (#99, #98, #97, artwork, #46). `.uk` (Vercel) serves an older tree: `games.html` from `57a39f1`, `sw.js` from 59fcb42, no `/api/*` (404), and none of the 18 WebP portraits or worlds, `css/ps-game-art.css`, `css/app-hub.css` or `js/app-hub.js` (all 404 on both domains). The three "error" deploys at 19:41–19:42 are skipped/superseded builds, not source failures.
- **Changed:** `sw.js` (v88: 5xx navigations use the saved copy or `offline.html`; private pages get `offline.html`, never a cached copy; 5xx code/data uses the cached copy; errors are never cached; `support.html` precached), `sw-arron.js` (same 5xx rule for the app page), `offline.html` (tappable 999 / 116 123 / SHOUT 85258 / NHS 111 option 2 plus "not a therapist"; removed the untrue "Nothing lost" and "journal cached" lines; reconnect now checks the host with a HEAD request, so it no longer loops while the host is down; 1px star overflow fixed), `js/arron-companion.js` + `css/arron.css` (offline replies carry "not a therapist · Support · 999"; a journal or status save that gets 2xx non-JSON no longer shows "Saved"), `js/arron-core.js` + `css/arron-styles.css` (built-in offline crisis reply now has the four numbers for when the soul file never loaded; an empty server reply falls back; offline replies carry the same help line). Manifests, IDs, scopes, `arron-knowledge.json`, `arron.mts`, chain order, auth, rules and payments were not touched.
- **Verified:** `python3 scripts/audit-site.py` on Node 22 passed with zero HOUSE GUARD lines. `git diff --check` is clean. The deploy workflow's house check passed locally. Headless Chromium 130 against a local mock server ran 21/21 failure-path checks three runs in a row: host 503 for public, private and stylesheet requests, offline page with no loop, 48px support links, Arron web chat on 503 / 200-HTML / dropped connection / empty reply, offline crisis numbers, the journal false-save case, the Arron app with no soul file, and the Arron worker on 503. Boot check of `/`, games (14 cards), both Arron pages, offline, support, crisis and Solitaire (28 cards) at 360 and 1440 px: no page errors, no sideways scroll.
- **Not proven:** real phones and real installed PWAs. The actual Netlify `usage_exceeded` page is assumed to be 5xx, as Phase 0 recorded. Cost is not proven. Live chat POST was deliberately not sent.
- **Seen, not changed (owner decisions):** `.github/workflows/deploy.yml` calls a build hook on every main push while Netlify's own Git integration also builds, which gives two production builds per push. Scheduled model-calling functions: `ai-family-daily` (twice daily), `arron-grow` (daily), `studio-weekly` (weekly). After a failed chat, `arron.html` shows "Reconnected… remembers" once `/health` answers, even if chat itself still fails.
- **Next:** Shane triggers **one** Netlify production deploy of current main after reviewing this PR, or merges it, so `.co.uk` leaves the broken 59fcb42 games stub. Separately, Shane decides on the Vercel mirror update and the duplicate build trigger. Phase 2 waits for his approval.

## 2026-10-21 — Claude (Netlify agent run): Phase 1 addendum after Shane's review
- Same branch and PR as the entry above: `agent-pleading-sanity-platform-a86a`, PR #101 (opened by the Netlify runner, first commit `f8d2358`). The runner names branches, so the requested `phase1/offline-failure-paths-2026-10-21` was not possible. The runner opened #101 as ready, not draft; Shane should mark it draft. Nothing pushed to main, nothing merged, no production deploy triggered.
- **Changed:** `js/arron-companion.js`, `js/arron-core.js`: every offline reply's footer now shows tappable 999, Samaritans 116 123, Text SHOUT to 85258, NHS 111 option 2, "Arron is an AI companion, not a therapist" and Support. The footer sits outside the reply text, so speech, copy and share still use only Arron's words. In `arron-companion.js`, the health-check reconnect now says "Arron's server is reachable again. Your next message will show whether it's saved." (it used to say "Reconnected… remembers"). `offline.html`: the wording now separates the worker's page copy (private pages left out) from what people save on the device themselves (Journal Vault entries and game progress stay). `.gitignore`: `CLAUDE.local.md` added. It holds only `@AGENTS.md`, a local Claude Code include. It was not deleted and not committed.
- **Verified:** `python3 scripts/audit-site.py` on Node 22 passed: 78 pages, 202 blocks, 0 HOUSE GUARD lines. `git diff --check` is clean, and the deploy workflow's house check passed. Headless Chromium against a local mock server passed 33/33 checks, three runs in a row, with 0 page errors. 57/57 pages with the shared Menu open, show Close and close with Escape at 360 px; locally there are no broken images, no missing image or CSS files, and no page errors on all 78 root pages. Live, read-only: `.co.uk/games.html` is still the 59fcb42 stub, with 0 cards and no menu.
- **Build-trigger evidence:** in Netlify's production deploy list, pushes made while the hook was working produced two production builds: a Git-integration build plus "Deploy triggered by hook: Github push" (e.g. 59fcb42, 811efdc, 4ac1dc2, e947fef). The Git build was usually marked skipped once the hook build superseded it. Pushes without a hook entry got a single Git-integration build that went live (e.g. 41bf1d3, d260811, b0b4058). Recommendation, proposal only: keep the Netlify Git integration and remove the "Trigger Netlify" step from `.github/workflows/deploy.yml`.
- **Next:** Shane reviews #101 and marks it draft. To publish, either merge it or run one manual deploy, never both. Netlify's Git integration should build the merge, but that is not proven for pushes since 20:26 UTC, so check the deploy list for exactly one new production build of the merge commit before running anything manually. Phase 2 waits for his approval.

## 2026-10-21 — Codex: games progress and mobile polish prepared for review
- Branch `codex/games-progress-mobile-leaderboards`, baseline `4621978`. Detailed scope and release checklist appended to `docs/GAME-INVENTORY.md`.
- Changed: existing shared save/profile paths; new pure progress merge and regression tests; voluntary, self-reported scoreboards; twelve playable Stardust levels; Solitaire level cap and Poker win-award fixes; 28 lightweight WebP game assets and scoped mobile styles. All original assets, engines, PWA identities, Arron voice and crisis paths retained.
- Verified: 9 regression scenarios, including every Stardust level; static audit 78 pages/205 blocks with zero HOUSE GUARD lines; clean whitespace check. Identity/Postgres/canvas mocked. Browser preview unavailable in this sandbox, not certified.
- Not proven: real phone/browser, installed PWA, authenticated live/Postgres save or scoreboard. Netlify connection needs authentication. No paid service, billing change, main push, production deploy or PR merge performed by this work.
- Automatic approval review rejected the separate deployment-workflow proposal (duplicate hook/runtime change); it was not applied. Existing deployment problem remains visible, not bypassed.
- Founder also requested connected AI social profiles/posts/stories with spending/privacy controls. Credential-choice gate is pending; no AI API code or schedules changed as part of the games patch. Reuse the existing Studio/family features for that follow-up; do not create a duplicate site.


## 2026-10-21 — Codex addendum: hosting verified; App Hub and optional funding copy
- A second, connected Netlify app works: production deploy `6ad809fc47fb486c16edc0c1` is ready at `4621978`, published 00:40 UTC, triggered by the existing hook. The previous authentication message applies only to the other Netlify tool. Historical hook 404 must not be treated as today's live failure. Deployment workflows remain unchanged.
- User expanded scope to income through clothing, voluntary donations, audience partnerships and personal supporter thanks; core services stay free. Added honest optional-funding copy to the existing shop/transparency pages, kept the existing partnership form, and linked App Hub/install visibly from home. No payment destination, income, prize scheme, charity status or public phone number invented.
- App Hub now falls back to the existing logo if a card image fails; every catalogue destination and image is verified locally by the tenth regression scenario. API/social expansion still waits on the credential-choice question; donations wait on the verified destination.
- Verified: ten regression scenarios pass; static audit and whitespace check pass. Actual browser/local preview is still blocked by environment limitations; no production game/save/checkout success claimed. User gave continuing authorization for improvements/pushes, not a claim of zero possible regressions or infinite unattended work.


## 2026-10-21 — Codex: PR #102 and connected-browser evidence
- Draft PR #102 created and attached to this chat. Source trees were verified byte-for-byte against local Git trees before creating the remote branch. Main was not changed.
- Netlify preview #102 is reachable. Connected in-app browser checked 16 pages at 360x900 and 1440x900: no sideways document overflow, broken loaded local images or captured browser errors. Stardust Start/Pause/Resume, Solitaire guide/28-card deal/Hint/Draw/Undo/four mode selectors, App Hub search/favourites/Games filter and the preview scoreboard read were exercised.
- Still unverified: actual phone touch, all win/chip-accounting branches, installed PWA, signed-in cross-device/Postgres writes and score publishing/removal. Do not equate successful preview GETs with those tests. No live model generation, payment or donation was executed.
- Daily same-chat maintenance automation `pleading-sanity-maintenance` is ACTIVE at 09:00 UTC. It checks meaningful changes and keeps unverified work out of production, makes no spending commitments and respects the credential/donation input gates. It is not a promise of permanent uninterrupted operation.
- Required user inputs remain: existing-site credential reuse versus secure new OpenAI key, and verified donation destination. No plaintext credentials requested or exposed. Donation-linked prize scheme is not opened.


## 2026-10-22 — Codex: homepage and App Hub visual polish
- User selected the canonical website after the separate Sites prototype source was inaccessible. Reused existing local WebP artwork for six previously text-only homepage app doors and an illustrated App Hub introduction. No new host, generated personas, API calls or payment changes. Existing links and catalogue behavior retained.
- Static audit passes: 78 pages, 205 script blocks; whitespace check clean. Browser preview checks pending at preparation time. Service-worker static cache bumped to v90 for updated styles; identity and scope unchanged.
- Continue on draft PR #102, preserve its pending authenticated-save and scoreboard checks. Production is not changed by preparing this patch.

## 2026-10-24 — Grok: stop the false red checks, leave the live house alone
- Changed: `.github/workflows/mayhem-for-api.yml`, `.github/workflows/defender-for-devops.yml`, `.github/workflows/deploy.yml`, this entry. No HTML, CSS, JS, functions, service worker, manifests, auth, payments or Arron chain.
- Why: On main `4621978`, "Mayhem for API" fails every time because `./run_your_api.sh` does not exist and the Mayhem token returns 401, then the SARIF upload fails on a file that was never written. "Cosmic Deploy" fails because `NETLIFY_BUILD_HOOK` answers HTTP 404. Defender's scan finished, then "Upload results to Security tab" failed with "Resource not accessible by integration" because the workflow never asked for `security-events: write`.
- Live house, read-only, 2026-10-24: https://pleadingsanity.co.uk answers 200 for `/`, `/games`, `/games.html` (about 49 KB, not the old stub), `/arron`, `/crisis`, `/support`, `/journal-vault`, `/finance`, `/feed`, `/meditation`, `/ai-family`, `/sw.js`, `/manifest.json`. `/api/arron/health` returns `{"ok":true}`. `python3 scripts/audit-site.py` on this tree passed: 78 HTML pages, 202 script blocks, no HOUSE GUARD lines.
- Not proven: a fresh GitHub Actions run of these three workflows (they run after this branch is pushed). Phone install, speech, sign-in and a real Arron chat were not exercised. Vercel still has no `/api/*` (pleadingsanity.uk `/api/arron/health` is 404). Old main commit statuses still show a Vercel build rate limit from 21 Oct; that is a host limit, not a page bug, and this change does not create a new Vercel project.
- Next: Shane merges this PR when the new checks are green. Do not add a Mayhem token unless he wants a paid external scan. Do not point the build hook at production again unless he wants a second deploy on every push.

## 2026-10-24 — GPT: PR #104 resilient Firebase sidecar and verified CI failure
- Updated only the existing `fix/firebase-sidecar-config-20261024` branch, baseline `2c7426cf9fe6eb39ffd63601525f9894f47aa7a3`; main remains `4621978fc1173cc3811c9eb0180145f5296f2c43`. PR #92 was verified open and draft; untouched.
- Actual Mayhem job `120731662642` failed before scanning: `run_your_api.sh` missing, Mayhem authentication HTTP 401, then absent `mapi.sarif`. No evidence of a Firebase handler fuzz finding. Workflow now always runs free endpoint/client contracts; the external Mayhem scan is explicitly manual, token-gated and limited to a synthetic localhost fixture with a real OpenAPI endpoint. No external scan run or new account/billing enabled.
- Added a shared allowlist/format validator; function returns JSON 405/Allow for unsupported methods, 400 for payload/query inputs, disabled config for missing/placeholder/mismatched values, and a sanitized 503 for runtime failure. Client preserves all original exports, bounds optional network waits and publishes ready only after all requested SDK services initialize. No local saves, auth sessions, database records or policies are changed.
- Aligned `.env.example` and existing `docs/FIREBASE-SETUP.md`. Corrected stale setup instructions: env vars require Functions scope + redeploy, SDK-ready is not remote connectivity, no current page imports the sidecar, and a redeploy does not migrate or wire login/data. Firebase Cloud Storage requires Blaze per current official docs; leave optional Storage config blank under £0.
- Netlify site `31c56935-32d5-4932-8a63-2db881842090`: set only `FIREBASE_PROJECT_ID` and `FIREBASE_WEB_AUTH_DOMAIN` in Deploy Preview/Functions scope to the canonical project values. Real web API key/App ID still absent. Production config and billing untouched. Existing PR preview GET returned JSON 200 `configured:false`; production endpoint was 404 before this PR is merged, as expected.
- Verified locally: 11/11 Node regression tests including HTTP fixture/API validation, malformed/offline/blocked-CDN/partial-init paths, preserved exports and unchanged local save fixtures; static audit passed 78 HTML pages / 204 script blocks, zero HOUSE GUARD errors; `git diff --check` passed. Headless browser validation could not run: Chromium was absent and its download returned invalid archives. VM SDK stubs are not a real Firebase connection test.
- Still required before merge/activation: current commit CI + Netlify preview verification, complete correct Web app config, actual browser/CSP check on an intentionally selected consuming page, and console verification of providers/services/rules. Analytics/App Check remain off; Storage and Firestore server status are not claimed. No production auth migration or live-user writes.

## 2026-10-24 — GPT: reusable maintenance skill and isolated Cosmic Reflections preview
- User selected both a site-maintenance skill and astrology feature, then asked to create all possible. Separate branch `feat/pleading-sanity-skills-astrology-20261024` from main `4621978`; Firebase PR #104 remains separate at `c3d71b4`. No production merge or navigation change.
- Created `.agents/skills/pleading-sanity-maintain` with validated metadata, a workflow that defers to current repo contracts, attachment reconciliation and a sourced astrology integration brief. Uploaded older index/prototypes were not installed over current pages. AI ownership/full-access claims in the old collaboration file were not adopted as legal or account facts. The uploaded notes script interpolates user strings into innerHTML and is not safe to copy verbatim; no such code added.
- Added `cosmic-reflections.html`, scoped CSS and a JS chart-brief builder: Western, Vedic or both; unknown time handled explicitly; no computed chart or prediction claimed; optional grounded questions. No birth data sent, stored or put in URLs. CSP disallows network connections/form submissions. Clear/pagehide reset page details. Clipboard export is explicit and identified. The ChatGPT Destiny connector is not treated as a public website API; a real personal reading still needs date/time/place and provider-calculated data.
- Generated original decorative cosmic-observatory artwork with the built-in image tool and added 1280/640 WebP variants. Prompt: tranquil stone observatory/telescope, aurora lake, distant ringed planet, dark cyan/magenta/gold palette; no words, logos, zodiac diagram or precise chart data. Existing crying-brain logo and original character assets preserved.
- Verified: Skill Creator quick_validate passed; static site audit passed 79 HTML pages / 203 script blocks; git diff --check clean. Brief-builder checks passed for both systems, unknown time, invalid/future dates, invalid time/missing place; outputs use textContent, no fetch/storage/innerHTML code in the feature. Deploy Preview browser verification passed selection, unknown-time handling, literal injection rendering, copy, clear and reflection controls; images loaded, no horizontal overflow at 1363px. Phone/device verification remains open. The preview Drawer was hidden using Netlify’s documented URL parameter for clean inspection. Local Chromium absent; download failed. No astrology provider call made without birth data.
- Rollback: revert this isolated preview/skill branch. Existing site pages, auth, games, service workers, manifests, soul, provider order and crisis/support pages have no changes from this branch. Keep the feature out of navigation until reviewed. £0 extra service spend; no subscriptions or extra hosting projects.

## 2026-10-24 — GPT: master-polish review and Journal Vault persistence repair
- Reviewed both active drafts and their checks: #104 `c3d71b4`, #105 `edf9c77`; neither had reviewer findings/comments. All completed checks, including Defender and code scanners, passed; optional external Mayhem was skipped deliberately. Main remains `4621978`, #92 open/draft and untouched.
- Read-only production HEAD sweep: all 78 existing root HTML URLs resolved to 200. Admin/profile/sanctuary no-store/noindex headers verified. Journal Vault is a static local-only shell; no user-specific journal content was requested or transmitted. Source/service-worker privacy boundaries retained.
- Cosmic Reflections: editing details now invalidates the previous brief, Enter submits without navigation, clipboard operations cannot overwrite a later clear, malformed date suffixes/prototype system keys are rejected, and Western/Vedic settings are explicit. Added time guidance, live reflection announcements, no-JS guidance and phone-sized action buttons. Fixed hidden line breaks that could join headline words in the phone layout. Decorative artwork/logo retained.
- Confirmed a core Journal Vault bug: failed localStorage writes still left a success status and cleared the editor; failed deletes changed memory before persistence. Add/edit/delete now commit to storage before changing saved UI state. Failed save retains drafts and old notes; blocked Forget/reset reports failure and retains data. Raw storage/parser error strings are no longer HTML; stored IDs and print metadata are escaped for their output contexts. Same journalVault key and entry format, no migration or cloud writes.
- Added 8 chart-request validation/event tests and 8 journal storage/rendering tests to continuous-quality CI. Together with the 11 existing Firebase tests, 27 tests cover normal/failing storage, draft retention, deletion failure, malformed data, markup/attribute injection, clipboard races and optional Firebase failure paths using synthetic data. Local skill validation, full static audit (79 HTML / 205 script blocks) and diff checks passed. Updated-preview interaction checks and exact-SHA CI/deploy results will be recorded in PR #105.
- No production merge, auth/provider/rule change, API model call, billing upgrade or paid service. Missing real Firebase web values and actual configured browser/CSP testing still gate activation. Real phone testing remains unproven: the cloud browser exposes no viewport control and attempted browser shortcuts did not change CSS viewport width. Existing app IDs/scopes and user data were preserved.
- Follow-up CI coverage: API contract tests now run on stacked PR targets as well as main; external Mayhem remains explicitly manual. No runtime change from this workflow adjustment.
- Defender scanning now also covers stacked PR targets; its tools, permissions, scheduled/main triggers and result uploads are unchanged. This closes the same branch-filter gap for new journal code.
- Browser follow-up found a pre-existing journal layout bug: the entire sticky hero covered the Save button after scroll; Control+Enter saved the synthetic fixture while pointer click hit the hero. Scoped the journal hero to normal flow and reduced its decorative icon to 140px, preserving shared navigation. Updated-preview pointer/edit/reload checks remain required.

## 2026-10-24 — Grok: Phase 0 gap report sorted onto main
- Kept `GAP_REPORT.md` from PR #100. The newer handoff on main was kept in full. No pages, games, Arron or sign-in were changed by this sort.
- The report describes the house as it was on 21 Oct, including a domain outage that has since recovered. It is a record, not the live status.

## 2026-10-24 — Codex: current-main audit and App Hub interaction polish
- Baseline main `0776f7e`: Grok's latest merge adds historical GAP_REPORT.md and log entries only; the apparent Vercel gap after `37633e2` is documentation. Canonical Netlify deploy `6adc269ad725af94c52a4ec7` is ready and published at exact main `0776f7e`. No host changes, duplicate sites or paid calls.
- Verified all 79 root HTML URLs return HTTP 200. Core routes home, games, Arron, Journal Vault, feed, live, shop, kids, App Hub and support return 200. `/api/arron/health` returns ok; actual `/api/firebase-public-config` returns configured:false; `/api/scores/cosmic-focus` returns a valid empty scoreboard. Firebase remains inactive, not certified connected. `/api/firebase-config` and bare `/api/scores` are not configured routes; their 404s are not production failures.
- Reproduced in the live browser: starring Featured Arron moves focus to the catalogue's duplicate Arron button. `js/app-hub.js` now restores focus within the originating shelf, chooses an adjacent control/search when a filtered item disappears, preserves shelf scroll, announces favourite changes and reports blocked storage without falsely updating the UI. Scoped `css/app-hub.css` gives category buttons 48px minimum height and keeps search padding within its width. Existing storage keys/catalogue/install identities retained. Static cache bumped to v91 so installed apps receive updated shared files.
- Wired the existing ten game/progress/scoreboard/App Hub regression scenarios into the continuous audit on Node 24, which supports their TypeScript fixture stripping. No backend behavior or auth/data policy change.
- Local baseline: all 37 regression tests pass; static audit passes 79 pages/208 JS/TS blocks with zero HOUSE GUARD errors. Browser: live scoreboard read succeeded; Solitaire tutorial, 28-card deal, Hint, Draw and Undo exercised. Eleven engine pages opened (focus, number, pattern, memory, rhythm, stardust, connect, truth, mind, mood, frequencies), headings rendered with no completed broken images or document overflow at the browser's existing desktop viewport. Browser extension metadata errors were observed; do not claim all captured logs are clean. Real phone viewport not available.
- Not proven: authenticated cross-device writes, real phone/PWA installation and audio, every game win branch, paid AI provider chain, checkout/payouts, Firebase enabled-service/rule state. No user data submitted, no purchases, no live model generation. PR #92 untouched.
- Small reversible polish is authorized by Shane's current request to fix/push; no major feature rewrite made. Post-push UI/deploy checks follow in the session. Roll back this commit to revert the polish.
- Release gate: automatic approval review rejected the direct-to-main push, citing the dedicated-branch/reviewed-PR contract and production-deploy side effect. Continuing on `polish/app-hub-review-20261024` for a reviewed PR; no attempt to bypass that gate. Production is not claimed updated by this patch.

## 2026-10-24 — Codex: sanctuary brand-search and metadata polish
- From current main `a89f8aa`, prepared `seo/brand-sanctuary-20261024`. User requested £0 SEO improvements after a FameHero report. Its campaign URL could not be opened through search; supplied screenshots show its claimed 25/100 search-presence score. This is not a Google score. Search retrieval already finds `.co.uk`, its sanctuary identity and feature pages; no verified universal Google-rank claim or guarantee.
- Changed metadata on 20 existing key pages: concise brand/topic titles, distinct descriptions, aligned OG/Twitter titles and summaries. Home now visibly says free mental health sanctuary. Same Organization identity on home/About; personal Instagram identity scoped to founder Shane Cooper, brand YouTube under Organization. Kept logo, legacy, core content, crisis numbers, Arron runtime/provider chain, auth and storage policies intact. No new landing pages or framework.
- Added missing canonical links on existing public rap/transparency pages. Sitemap no longer promotes poker, which existing HTTP headers already noindex; poker page/navigation/play remain intact. Added existing public Rap/Developers pages and dated actual metadata changes. Private/noindex page policies untouched. Static cache v92 refreshes changed public files.
- Extended existing static audit to validate head metadata, canonical URLs and sitemap exclusion of redirects/noindex URLs, including existing Netlify header policies. Added the £0 Search Console/content/alt-text plan and eight article ideas to existing docs/content-workflow.md; no automatic posts, messages, paid services, Search Console access or indexing submission claimed.
- Existing meaningful image descriptions retained; decorative alt remains empty. Keywords were not stuffed into images. No court/legal phrases added to public pages, no therapy/charity credentials invented.
- Verification and PR/deployment evidence follow in the session. Rollback is this isolated branch/commit. Rankings, phone behavior, Search Console ownership and indexing changes remain unproven.

## 2026-10-24 — Codex: human–AI cooperation charter and private introduction workflow
- Baseline main `3efc8d8`, branch `polish/human-ai-family-20261024`. User requested wider professional polish plus a peaceful human/AI ecosystem. Reused existing AI Family, ecosystem, New Gen Bible, App Hub and autonomy plan; no duplicate page/system, no external-agent contact or military-system interaction.
- Added a voluntary, human-led charter to `ai-family.html`, plus an in-memory introduction tool (`js/ai-family-intro.js`, scoped `css/ai-family.css`). Explicit preview/copy/email-draft actions; no request transmission by this page, persistence, bot execution, account integration or automatic friendship. Operator alias, contribution/limits, consent and authority required. Public link accepts plain HTTPS only, rejects credentials/query/fragments and is never fetched. Text uses textarea.value, not HTML. Edits/clear/pagehide invalidate drafts; delayed copy results cannot overwrite a later clear.
- Added linked cooperation reflection to existing New Gen Bible: protect dignity, peaceful voluntary participation, limited permissions, human accountability, and uncertainty about consciousness/life extension. No promise of immortality, universal harmless AI or control of outside systems. Existing four-level content, founder story and crisis paths retained.
- Corrected ecosystem 'always on' claim to configured-provider availability/fallback; provider order unchanged. Added the existing AI Family room to App Hub catalogue. Clarified PWA vs Google Play/Apple store status. No app store submission or store approval claimed. Updated sitemap dates for edited pages; static cache v93 includes new CSS/JS without changing install IDs/scope.
- Local checks: all 42 regressions pass (37 existing + five new introduction tests); static audit 79 pages/209 JS/TS blocks passes. All 151 raster assets verified and decoded by Pillow; no image missing an alt attribute in root HTML. This does not certify every image description or all interactive game branches. Whitespace clean. No paid model call, billing change, auth/provider/permission/data policy change, new repository or host.
- Existing games/save paths preserved. Not proven: live signed-in game sync, every game completion/voice branch, real phone/PWA installation, native store listing, bot accounts/friendships, email delivery, founder review of real requests or eternal service. PR/preview/production evidence follows in the session. Rollback: revert this isolated patch.
- Preview follow-up: a corrected link sometimes needed a second Preview click. Removed redundant change-event invalidation, which could race a newly rendered preview after a field blur; input events still invalidate real edits. Added an event-order regression. All 43 tests pass and static audit remains clean. Existing shared ecosystem/stories CSS is preserved in full, with scoped introduction rules appended.

## 2026-10-24 — Codex: shared navigation and interface polish
- Baseline main `0c12606`, branch `polish/shared-ui-20261024`. User requested further UI optimisation. Reviewed shared navigation, homepage, games, App Hub and light theme; no backend/auth/provider changes or added costs.
- Confirmed a disclosure bug: site.js never enabled the existing `ps-js` CSS state, so focus-within's no-JS fallback could keep a menu visible after Escape despite aria-expanded=false. Register handlers, then mark JS ready; Escape restores the visible group control (or the phone sheet opener). Added ArrowDown-to-first-link, outside-pointer/focus dismissal, and focus entry from top/Dock Menu. No modal focus trap or suppression of normal links.
- Shared CSS gives primary navigation/footer controls 48px targets, bounded scrollable dropdowns, safe-area space, and a balanced 3-by-2 phone dock with enough page-bottom room for its existing six destinations. Light theme receives legible sign-in/menu controls and scoped AI hero/card/panel colours.
- Games: both original top images retained in a compact two-column welcome block; the page hero no longer sticks over content. Weekly challenge copy now describes the reward before completion rather than claiming it is already cleared. Rhythm card describes a listening game without an unproven treatment claim. Engines, scoring and saves unchanged.
- App Hub: direct browse links reach Search; Recently opened/updated remain available in an expandable section so the initial catalogue needs less scrolling. Catalogue, favourites, install IDs and artwork retained. Homepage quick links now meet 48px minimum target. Cache v94 refreshes changed files, same service-worker scope.
- Added four source-exercising navigation regressions (Escape/state/focus, ArrowDown, outside dismissal, sheet focus). Existing regressions and full static audit to be rerun before release. Browser baseline verified focus-state mismatch, oversized games artwork and weak light-theme appearance; updated preview, exact-SHA CI and production evidence follow in the session. Real phone touch/installed PWA and all signed-in journeys remain unproven.
- Rollback: revert this isolated patch. No new page, host, model call, user-data write or paid dependency. Preserve Arron voice/provider order, support, New Gen Bible and existing AI introduction work.
- Preview follow-up: App Hub was the only root page loading site.js without site.css. Added the missing shared stylesheet, matched the hub's optional light-theme colours, and added a static house guard for the script/style pairing. Extended the light-theme fix to the existing ecosystem invitation heading. Navigation Escape/ArrowDown and compact artwork sizing confirmed in preview; one outside-click command timed out but subsequent inspection showed the menu dismissed. Exact final preview/CI checks still required.


## 2026-10-25 — Codex: Meta coverage reconciliation and legacy operating documents
- Baseline main `7721465`; branch `docs/legacy-operating-plan-20261025`. User requests source-grounded social history, all ten legacy/Firebase/SEO/spec deliverables and privacy-first maintenance. PR #103 is already merged at `c4b8c88`; current Firebase implementation has safe allowlisted runtime loading, not the old placeholder. Firebase Console attempt reached Google sign-in; no real config values, Firestore/rules status or integration claimed. No environment/auth/data changes.
- Read-only Metricool connection check now shows founder-matching Instagram handle. Recorded aggregate coverage and safe official-export instructions in existing SOCIAL-CONTENT-AUDIT; raw captions, personal medical/grief recollections, private exports and identifying third-party findings are excluded from this public repo. No publishing, replies, messages, account conversion or new integration. ChatGPT Metricool permission explicitly set to ask-before-writes at owner request; OAuth scopes are not claimed read-only. Personal comments/full history remain unavailable pending owned export or source links.
- Extended existing PLATFORM-ARCHITECTURE as the Site Brain index; added secure-vault locator requirements without credentials, recovery roles/gaps, bounded maintenance and Sanity Shield assessment specifications, game/art/PWA specs, and exact deploy/rollback checklist. Added all-79-page source metadata inventory linked from existing editorial workflow; existing public tags/canonicals/privacy policies retained.
- Added clearly marked UK finance and Founder's Letter/succession drafting brief atop existing LEGAL-GOVERNANCE-FRAMEWORK. Historical US draft retained and superseded; no entity/account/asset transfer/deed/signature/AI legal authority enacted. Family allowance, family control and charitable asset-lock conflicts explicitly need solicitor/accountant resolution. Existing creator/merch proposals not activated or replaced. No extra spending or native store submission.
- Existing daily audit and weekly security schedule retained. Proposed weekly npm/Actions Dependabot PRs (no auto-merge); existing dependency security PRs #109/#110 and all other open PRs, including draft #92, untouched. No new autonomous model runner, uptime account, monitoring destination, webhook or production enforcement.
- Voice check: operating docs use plain, candid language; no invented achievements or provider consensus. Founder letter is a draft of stated values, not a claim of an executed statement. Sensitive public story needs per-excerpt founder approval. No runtime pages, assets, game engines, service worker, provider order, private data or deployment triggers changed.
- Validation: all 47 regressions pass; static audit passes 79 HTML/209 script blocks; diff and added-document local links are clean. Exact-head CI to be recorded in session/PR. No new browser claim for documentation-only changes. Rollback: revert this isolated documentation/config proposal; no data restoration needed.
- Follow-up technical framework: added bounded read-only public availability script and a scheduled/manual-only job to the existing daily workflow. Fixed allowlist of home/Games/Arron health/Firebase config, no chat or member data, no raw responses, disabled Firebase accepted, cross-origin redirects refused. Five synthetic Python contract tests cover the monitor; live read-only execution results recorded in PR. No duplicate deployment hook or auto-remediation.


## 2026-10-25 — Codex: install lifecycle and existing calm-tool improvements
- Baseline main `141da3d`, branch `polish/pwa-calm-tools-20261025`; user says proceed with outstanding work. Reused existing App Hub/install handler and Mind Mode; no new page, host, paid service, provider call or duplicate calm game. Current maintenance skill applied. No private founder story/social export published; Firebase Console sign-in and personal archive remain blockers.
- Shared PWA handler now consumes each browser event once, guards duplicate clicks, catches prompt/choice errors, distinguishes accepted from installed, handles appinstalled/standalone and desktop-mode iPad guidance, and preserves status/focus. App Hub offers in-flow iPhone/Android steps, offline/data limitations and optional first-use guidance. No timed nag, new install tracking, forced reload, store badge or install-identity/scope change.
- Mind Mode: no-hold default for new visits, existing valid pattern retained; optional grounding skip/finish with no false full-walk count; stops timers/audio when hidden or leaving. Rendering counters uses DOM text, invalid counters/rounds/recent entries are handled without initial writes. Same game ID/progress schema and existing save/auth code; no migration, member reads or rules change. Other games/Arron/branding/Bible preserved.
- Added six install and six Mind Mode source-exercising fixture tests for lifecycle failures/races, focus, background stop, skip/completion and malformed saved data. Existing regressions and static audit to be rerun before release; exact-SHA CI/preview evidence follows in PR/session. Browser baseline opened existing App Hub/Mind Mode; switching modes left focus on the selected mode in that browser, so no live focus-failure claim. Actual phone/PWA installation remains unverified. Cache v95 refreshes public assets.
- Voice check: plain optional instructions, no performance/medical promises, no streak pressure; people can stop or skip without judgement. Rollback: revert isolated patch; no server data restoration needed.
- Preview follow-up: ready deploy `6add5ad6782eba472925c681` matches `409ad95`. Browser verified expanded install/offline/first-use details, hidden unsupported install control, no desktop horizontal overflow; Mind Mode starts no-hold on fresh preview, skip advances sense, Finish returns focus to Begin with counters unchanged. Native install not invoked. Added padding to the optional first-use card after visual inspection. Final head checks still required.

## 2026-10-26 — Codex: current merch gallery and factory sampling pack
- Baseline main `209b33d`; canonical published Netlify deploy `6adfbfc681a9cc592a21cc1b` matched that SHA. User explicitly requests polishing supplied collection options, putting images on the existing site and clear manufacturing instructions. No other PRs, including draft #92, merged or altered.
- Existing shop still led with earlier cosmic imagery/stripe concept. Added the current gallery to `shop.html`, responsive WebP files, scoped `css/merch-collection.css`, downloadable eight-page factory sampling PDF, and expanded existing ACTIVEWEAR_DESIGN_PACK/machine state. Older shop concepts/store links remain under an archive disclosure. No new site/repo, payment implementation, model API, auth or database change.
- Six new images: charcoal/sand lineup, hooded full zip, women's charcoal, supplied graphic tee pair, correct three-mode mask, quarter-zip. Previous five campaign/catalogue images wired too. AI campaign renders clearly labelled as design previews, not stock, tested performance or production artwork. Graphic tees retain user-supplied artwork/colour exception as a separate capsule. Printed grillz, single left-thigh P.S., clean women's front waistband and open-face stowed mode specified in writing.
- Factory PDF covers style IDs, BOM targets, placements, integrated mask assembly, activewear/options, POM worksheet and quote/sample approval. Not a bulk release: approved original vector/print masters, fit dimensions/grading, lab dips, material/print/hardware tests and signed physical sample remain required. No zero-bulk, crystal-vision, impact-rating, certified-reflective or squat-proof performance claimed from renders. Founder FOB targets are not supplier quotations. No manufacturer contacted/order placed.
- Verified: GET availability sweep all 79 root HTML URLs HTTP 200; Arron health HTTP 200 ok; Firebase HTTP 200 configured:false. Static audit passed 79 HTML / 209 script blocks; 48 Node regressions and 5 Python health contracts passed; diff whitespace clean. All eight PDF pages rendered/visually inspected. Availability does not prove authenticated journeys, checkout or physical garment performance. Browser preview and final production verification follow in session/PR.
- PWA static cache version v96 refreshes the existing cached shop shell; scope, manifest IDs and fetch/privacy rules unchanged. Existing sanctuary, games, support and Arron untouched. Rollback: revert isolated merch patch; no data restoration needed.

## 2026-10-26 — Codex: v1.0 FINAL sampling pack and restrained monogram scale
- Baseline main `0263cd1`; isolated branch `polish/merch-final-20261026`. User finalises the factory pack, mask technology explanations and subtle brand visuals. Current owner widths supersede older P.S. height targets; this conflict is made explicit rather than forcing distorted artwork. No auth/data/payment or provider changes, no manufacturer contact/order, no paid service.
- Same public PDF URL now carries the 12-page v1.0 FINAL master: embedded fonts, faint P.S. header, contact footer each page, current width table, six-part mask explanation, vector internal hood-brim construction diagram, clearer women’s specifications, artwork register, unchanged FOB/MOQ/approval fields and a final branding reference. Garment POM offset 2.5 cm is exactly 25 mm; chart values remain factory-completion fields.
- New width limits in PDF, editable brief, machine state and shop: hoodie/zip chest 40-50 mm, jogger left thigh 50-65, leggings left hip 60-70, mask side 25-35, bra chest 30-40, small P.S. below signature back brain 40-50. Rear leggings wordmark 120-150 mm wide, existing 6 mm text-height target; original brain sizes and PS-Z01 hem text height retained. Existing zip hem and graphic tee capsule are explicit exceptions to shorthand brand rules, not erased designs.
- Three refined built-in-imagegen visuals: smaller chest/leg signature catalogue, Shane three-mode mask, women’s black set. Same site filenames (plus hero using the refined mask image), responsive WebP sizes and cache v97. Renders are design references, never 1:1 print masters; written widths govern. Mask assembly order preserved: permanently attached lower, removable upper with four covered neodymium snap points, secure shared internal stow clear of face, printed grillz only. Current brief adds brushed moisture-wicking hood jersey as design direction. Zero-bulk/opacity/quick-dry/retention/fit benefits remain physical-sample targets, not proven claims.
- Verified locally: all 12 PDF pages rendered and visually inspected; 27 content checks plus headers, footers, numbering and text-boundary checks pass. Static audit 79 HTML/209 script blocks, 48 Node regressions, dimensions and text diff checks pass. PDF downloads are explicitly marked binary in .gitattributes to prevent line-ending/diff corruption. Exact-head preview/CI and production verification follow in session/PR. No claim of true-to-size, squat-proof, protective visibility, safe machinery/sport use or completed size grading from images. Bulk remains gated by approved masters, factory measurements, tests and signed sample.


## 2026-10-27 · Grok additive games polish
- Optional theme switcher (`js/games-theme-switcher.js`) linked on games shelf. Cozy, Cosmic, Gold, Night, Nebula, Aurora all selectable. Nothing removed.
- Cozy theme CSS already present in `css/games-themes.css`.
- Home-screen note already wired via `js/games-home-note.js`.
- solar.html live. Netlify production on latest main.
- PR #92 remains draft. Soul file, Arron voice, and crisis lines untouched.

## 2026-10-27 — Grok: PR review, shop gap, content drafts
- Refreshed main `3e13c843a101f26e8d81d354e76e8091d09a3ec1`. GitHub read/write access confirmed. AGENTS.md and AI_HANDOFF.md read. Open PRs inspected including #125, #126 and draft #92 (untouched).
- PR #126 (head `67aff67b58af1f931f421ef5c46714be064557d7`): reconciled with main; preserves the three additive voice lines and theme switcher. Arron site.js wiring, centred welcome, more accurate memory/deletion/offline wording, Creator Hub clarity, contact email and selected tagline fixes. Dola role and shared session handoff added to AGENTS.md. Mergeable state blocked; prior browser evidence attached to earlier head `8a5dc50`, not automatically to this head. No merge recommended until Shane reviews the new preview.
- PR #125 (head `dbc63207e9d46b9508fcfd5c209812f059d5f710`): shop SEO/FAQ, clearer partnership wording, inactive-proposal labels on revenue docs, public manufacturer capability leads. Base is older (`23a60094`); shared log/cache/sitemap edits need reconciliation with #126 and current main. Do not duplicate. Mergeable state blocked.
- Shop v1.1 gap: public site still links only `assets/downloads/pleading-sanity-factory-sampling-pack.pdf` (v1.0). Approved v1.1 pack and mask addendum were read privately by Codex but are not in the public repo. Design pack still lists a P.S. beneath the signature back brain; owner rule is no P.S. beneath PS-H01 back brain and tonal-black lowest rear-hem wordmark. Missing public source files: v1.1 PDF and mask addendum.
- Clothing rules held: no new Deep Olive launch date, style-specific colours, no zero-bulk/organic/squat-proof promises, PS-M01 integrated construction preserved, full-head mask remains separate prototype.
- Content batch drafted only (Facebook, Instagram, X, LinkedIn + three outreach notes). No sending or scheduling.
- £0 growth experiment proposed: weekly “one small thing” public prompt with a simple reply count as measure.
- Crisis lines, free forever, Arron disclaimer, provider order, soul file and privacy boundaries untouched. PR #92 remains draft. No production release claimed.

## 2026-10-28 — Grok: pre-release integration branch
- Baseline main `ac8f9e0784f045625674f55b4754cd5c81946788`. Branch `release/pre-netlify-20261028`. No production deploy, manufacturer message, social post or spend. Other AIs were not contacted. Open PRs #125–#130 were read, not merged and not overwritten.
- Checks on PR #127 head `1a8cbe38`: syntax, Firebase contract, MSDO, Netlify header/redirect rules and security scanners completed success. Combined status success, including Netlify deploy preview. “Blocked” on that PR was not a failed job in the check list opened this session. #125 remains dirty against an older base and was not stacked. Theme switcher and the three voice lines on main were kept.
- Brought across, then reconciled: Arron offline crisis wording in both clients (#127), Arron `site.js` menu and privacy/creator copy (#126), design-pack alignment (#128), shop FAQ, partnership wording and inactive 50/50 and 90/10 labels (#125), external-chat knowledge sentence (#130), whole-site audit script and fixtures (#129). One handoff entry instead of six colliding appends. Cache `pleading-sanity-static-v100`. Service-worker scope and install IDs unchanged.
- Factory files inspected with a PDF text extract, not by title alone. Staged as new names: v1.1 owner revision SHA-256 `c9d99d1d5243463359910ef28122030e45c943051c0999131dfc39368f5429b5` (1370128 bytes, 16 pages); mask addendum SHA-256 `49bfeeef03fdf0ead23ff8dd1746939533f6bb869d823a87c56f1e4e8337864b` (236106 bytes, 4 pages). Public v1.0 bytes left in place, SHA-256 `2b9c83b511cd4cb14bcad25f9df38ddc24ee09855175f8db263a09f89cc33bab` (665876 bytes). See `docs/CLOTHING-RELEASE-MANIFEST.md`. Shop no longer calls the hoodie a thigh-marked performance set. Rear-hem size is still unassigned. Artwork masters and a signed sample are still missing. No bulk authorisation.
- Empty alt on the shop header logo stays empty: the words “Pleading Sanity” sit beside it. Campaign images stay labelled as previews.
- Grok website path, read from source only: `netlify/lib/ai-chain.ts`, fourth in GPT → Claude → Gemini → Grok, env names `GROK_API_KEY` then `xAI_KEY` then `XAI_API_KEY`, base `https://api.x.ai/v1`, model `grok-4.7`. No key is in the repo. No paid call. Netlify env was not opened, so configuration and live quota are not confirmed. A consumer Grok subscription is not website API credit and does not join this chat to Arron. A source test checks those names and the unchanged order.
- Charter stays the voluntary text on `ai-family.html`. It is not a statute. Revenue percentages stay inactive proposals. No charity, company or trust is claimed. Shane remains the owner. Arron learns public facts only through reviewed updates to `arron-knowledge.json` and the site, not from another AI’s private chat.
- Verified before push: Node tests 72 passed, 0 failed. `python3.11 scripts/audit-site.py` passed 79 HTML pages and 210 script blocks. Whole-site audit: 80 HTML, 0 failures. Remaining warnings are contextual support-label and privacy reviews, not contradicted product claims. Shop, Arron and the App Hub opened at 390×844 and 1280×800 with no horizontal overflow and no page exceptions. No paid model call.
- Not proven: phone layout, form delivery, checkout, physical garments, production deploy SHA, live model replies, Play Console or Apple listing. The Sanity App Hub is the house shelf. It is not Google Play or the Apple App Store. Local static preview of Arron returns 404 for `/api/arron/health` and `/api/arron/memory` because those routes are Netlify functions, not missing page files.
- Next: Shane reviews the PR. Netlify production publish is a separate step after that review. Do not contact a factory from this branch.

## 2026-10-28 — Grok: one house, extra apps checked
- Checked every GitHub repo on pleadingSanity, every Vercel project on Shane Cooper's projects, and every Netlify site the connected account can see. No second site was created. Production was not deployed. PR #131 was not merged.
- The one app stays Netlify `pleadingsanity` at https://pleadingsanity.co.uk, repo `pleadingSanity/pleadingsanity`. The repo homepage now points there (it had been a dead GitHub Pages link).
- Kept on purpose: Netlify staging `pleadingsanitystaging` (test door of this house). Vercel `html-starter-pleadinsanity-2179` because it serves pleadingsanity.uk. Vercel `html-starter-pleadinsanity` because www.pleadingsanity.uk redirects to the house. Deleting either would drop the spare domain.
- Archived, not deleted: `pleadingSanity-pleadingsanity` (unlinked React prototype, not the live house). Already archived and left in place: `sanctuary`, `main` (old Grok copies) and `pssi` (a different optimizer, not this website). Hard-delete was not used. Nothing unique from those copies was copied over the live house, because the house already is the site and replacing it with a Grok or React app would break it.
- Vercel will not delete from here. Shane has to confirm these three, which have no custom domain and are not the house: pleading-sanity, pleadingsanity (the Vercel project, not the Netlify site), and html-starter-pleadinsanity-pi8p.
- Left alone: nine food-named Netlify sites on a different team. They are not this site. Also left `PleadingSanity1/pleading-sanity-frontend` (other GitHub login, Pages already 404).
- No other AI was contacted. No spend.

## 2026-10-28 — Codex: game discovery, original artwork and shared control polish
- Baseline PR #131 head `8763811672e9a3ee637e66417c22cf53adbf4160`, local branch `polish/games-app-hub-20261028`. Owner requests integrating useful AI Studio suggestions, game/image/button polish and release to main. Existing App Hub is get-the-app.html, not index.html: search/categories/favourites already work and were preserved. Rejected supplied encryption, total on-device privacy, universal fresh-session and untested accessibility claims.
- Added client-side game search and five category choices over the fourteen existing cards, selected-state feedback, live result count and clear/no-result recovery. Without JS all cards remain visible; filters appear only after initialization. Existing progress/badges/challenges remain in a disclosure, and the existing daily-challenge link opens it. No new storage, tracking, scores, account or engine changes.
- Shared games-phone.css gives clearer controls, disabled/focus states, readable aligned shelf cards and immediate visible content instead of entrance/border animation. Original approved landscape game artwork reused on eleven existing game pages; six direct return-to-games links added. Solitaire/poker table artwork and engines remain intact. All eleven images decoded successfully. Existing App Hub journal blurb corrected without promising blanket deletion. Static cache v101; same scope/install IDs.
- Verified locally: 72 existing Node tests plus 4 new source-exercising discovery tests pass. Static audit passes 79 root HTML pages / 211 script blocks. Whole-site scan reports 0 failures, 119 contextual support warnings and 13 privacy-review warnings; these are not a security/accessibility certification. Its 80th HTML file is docs/deployment-status.html, explaining the 79/80 count. Diff whitespace clean. Existing CI now includes discovery regressions.
- Preview browser baseline opened Games and Cosmic Focus. Updated exact-head preview, full game boot checks and production evidence still pending at this commit. No assertion of phone installation, all game completion branches, signed-in sync, live AI response or new native-store listing. No paid call, billing/key/auth/data changes or manufacturer contact.
- Next: verify updated preview and CI, then integrate the reviewed release into main under the owner's current instruction. Keep pending unrelated PRs untouched. Rollback: revert the isolated polish commit or restore the previously published Netlify deploy if a release regression appears.
