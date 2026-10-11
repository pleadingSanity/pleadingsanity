# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-11 by Claude (audit + patch run). Read `CLAUDE.md`, `AGENTS.md` and
`.github/copilot-instructions.md` first. This file records **what was verified**, **what was changed**,
and **what is still open**, so the next agent starts from evidence, not assumptions.

The role names below are assignments in `AGENTS.md`. They are **not** proof that an external agent is
connected or running. Only the provider tests in "Arron's AI chain" prove anything about live AI access.

## Ground truth

| Item | Value | How verified |
|---|---|---|
| Production site | `pleadingsanity` (31c56935-…), https://pleadingsanity.co.uk | Netlify API |
| Production commit before this run | `b6334e3` (PR #76), deploy `6acbeae06a59be0008560128`, published 2026-10-11 20:01 UTC | Netlify deploy list |
| Staging site | `pleadingsanity-staging`. It is linked to a **different repo** (`pleading-sanity/pleadingsanity-staging`) and was last published 2026-09-27 | Netlify API. **It is stale. Do not treat it as a preview of main.** Use deploy previews instead. |
| Build | Static publish of `.`, functions in `netlify/functions`, edge functions in `netlify/edge-functions`, Netlify Database (Drizzle) | `netlify.toml` |
| Firebase in this site | `js/firebase.js` is inert (appId is a placeholder). Project `pleading-sanity-36bfa` has the Firestore API **disabled**. | Read-only REST probe |
| Branch inventory | `docs/REPO-INVENTORY-2026-10-11.md` | GitHub API + file-by-file content check |

## How agents coordinate

1. One issue, one branch, one small PR into `pleadingSanity/pleadingsanity`. Netlify builds a deploy
   preview for each PR. Smoke-test the preview, not staging.
2. Every PR states: files changed, evidence (commands or browser output), remaining risks, rollback.
3. Security, auth, payments and data changes need the owner's approval before merge.
4. After a merge, confirm the published commit SHA in the Netlify deploy list and record it here.
5. Never paste secret values into PRs, logs or this file. Env var **names** are fine.
6. Never mark a feature as working until it has been exercised end-to-end. Use the status words below.

| Agent | Contributes | Hands back |
|---|---|---|
| GPT | Plans, architecture review, security risk triage, coordination of the backlog below | Ordered plan, risks, acceptance checks |
| Claude | Inspects code, patches, runs browser and function tests, reports evidence | PR-ready diff + evidence + this file updated |
| Gemini | Firebase and Google AI integration review: deployed rules, emulator tests, AI Studio keys | Emulator test results, rules diff, key rotation confirmation |
| Grok | Original creative concepts: kids series scripts, social copy, editorial ideas | Drafts in `docs/` or `content/`, marked as drafts until reviewed |
| Copilot | Code review and small isolated fixes; owns the first patch of the CLAUDE.md three passes | Small PRs with tests |

## Arron's AI chain (verified 2026-10-11)

Order in code and in `arron-knowledge.json` → `covenant.chain`: **GPT → Claude → Gemini → Grok → free spares (OpenRouter)**.

| Provider | Model | Route | Result |
|---|---|---|---|
| GPT | `gpt-5.6-sol` | Netlify AI Gateway, then `OPENAI_API_KEY` | Answered in a build-environment test. **Production returns HTTP 429** (rate or quota limit) from both the Gateway and the stored key. The chain fails over correctly. |
| Claude | `claude-sonnet-5-5` (creator: `claude-opus-5-5`) | Netlify AI Gateway | Answered (build env). **Production chat answered via Claude** 3/3 times (2–4 s). |
| Gemini | `gemini-3.8-flash` | Netlify AI Gateway | Answered (build env) |
| Grok | `grok-4.7`, then `grok-3` | xAI direct (`GROK_API_KEY` / `xAI_KEY` / `XAI_API_KEY`) | **HTTP 403 on both names.** A key is configured but xAI rejects it. |
| Spares | OpenRouter `:free` models | `OPENROUTER_API_KEY` | Not exercised |

Evidence: `netlify logs --source functions --function arron` shows
`AI chain: gateway gpt-5.6-sol unavailable (HTTP 429)`. Chat requests were sent with `saveToCloud:false`.

What exists: an 8 s timeout per provider; **(new)** a 36 s overall chain budget; a crisis check before
anything else; crisis lines whenever every provider is quiet; 30 chats/min per person; Forget Me (`DELETE
/api/arron/memory`); provider labels in the UI.

Not built: streaming, per-provider cost tracking, a daily chat cap, a retention limit on `arron_messages`.
`MAX_TOKENS_ARRON` is set on the site but **no code reads it**.

## Changes in this run (Claude)

| Area | Change | Evidence |
|---|---|---|
| Security (High) | `poker.html` escaped seat names before `innerHTML`; `poker-room.mts` cleans names on write and read | Faked room response with `<img onerror>`: **alert fired on production**, did **not** fire on the patched build |
| Security (High) | `/api/rap` (open to guests) and `/api/ai-post` gained an `ai` rate-limit bucket (6/min) | Local limiter fails closed without a DB (429). Counting is unverified locally. |
| Privacy | `?author=` listings in `posts.mts` and `creations.mts` honour private profiles (friends and self only) | Type-checked. Not exercised with accounts. |
| Privacy | 10 functions + `social.ts` log the error name and DB code only, not full error objects (query errors carry journal/note text) | Type-checked |
| Arron reliability | `ai-chain.ts`: overall time budget for `runChain`, spares and `workAsOne` | Test: budget spent → stops in 0 ms. Normal run answered via GPT in 1.3 s. |
| Arron safety | `arron.mts`: if chat crashes, the reply still checks for crisis words and returns the crisis signpost | Parses. The crash path itself was not forced. |
| Honesty | UI labels answers from spares ("free backup model"), owner pairs ("GPT, checked by Claude") and the council. Before, these showed no label. | `node --check` |
| Honesty | Arron privacy notes on `arron.html` / `arron-app.html` corrected: account-linked memory when signed in; Grok via xAI; OpenRouter fallback | Matches `privacy.html` |
| Navigation | 56 pages: Home · Arron & Healing · Community · Create & Live · Games & Kids · Our Story · Shop · Truth (LIVE stays first). Every old link kept; page-specific extras carried over. | Browser: desktop dropdown + Escape; phone sheet; no horizontal overflow |
| Mobile | Phone header no longer overlaps (name / Sign in / Light / Menu / Install). Sheet groups no longer stretch; the end of the sheet clears the dock. Wide screens wrap pills instead of clipping. | Screenshots at 390, 1024 and 1280 px |

## Feature status (observed 2026-10-11)

Working · Partially working · Simulated · Broken · Not yet built · Unverified (needs accounts or devices)

| Feature | Status | Notes |
|---|---|---|
| All 75 root pages load | Working | 0 page errors, 0 failed requests on production (mobile emulation) |
| Home and navigation | Working | Regrouped this run |
| Arron chat | Partially working | Claude answers in production. GPT returns 429. Grok returns 403. No streaming. |
| Crisis / support pages | Working (load) | Server crisis path verified locally |
| Sign-in / sign-out (Netlify Identity) | Unverified | Identity settings endpoint answers on production. No test account was used. |
| Profiles, friends, feed, journals | Unverified end-to-end | Code review: every private read and write is scoped to the verified user. No IDOR found. |
| Games (all CLAUDE.md engines) | Working | Engines boot with no page error. Solitaire: 28 cards, brain backs, four suit pictures, new deal, undo, hint, phone scroll. All 14 games-hub cards have their own picture. |
| Feed stories scroller | Working on `/feed.html` | Snap, full-screen lock, Escape unlock, page scroll after. **Not on `/` any more**: the homepage was redesigned by the owner (commit `911e50f`). |
| Sky | Working | `body::before` fixed sky layer on `/`, `/games.html`, `/sanity-solitaire.html` |
| Healing Hz | Working (loads) | Audio playback not verified headless |
| New Gen Bible, Finance, Kids, Kids Series, My Digital Story | Working (load) | Finance AI uses the same chain |
| Creator Hub / livestream links | Partially working | External links and schedule pages load. **Post-live clip creation: Not yet built** (no video processing). |
| Creator revenue (90% founding offer) | Not yet built | A proposal only. Eligibility, fees, refunds, tax, payout and reconciliation terms are not written. |
| Shop and cart | Unverified | A Stripe reference exists. Checkout was not exercised. |
| Kids cartoon episodes | Not yet built | Concepts only. There is no video rendering or YouTube publishing integration. |
| PWA install and offline | Unverified | Manifests and service-worker scope unchanged this run |
| Firebase (this site) | Not in use | API disabled on `pleading-sanity-36bfa` |
| Google Analytics | Present on 70 pages | Added by the owner on 2026-10-09. Blocked by CSP on 15 pages (Arron, finance, account pages). **Not disclosed on `privacy.html`, no consent prompt.** Owner decision needed. |

## Open security items (from the 2026-10-11 function audit)

Medium:
- `GET /api/images/*` serves any blob with no visibility check, including private-post and unshared creation images. URLs are unguessable UUIDs, but anyone with the link can view.
- Uploads have no rate limit or quota.
- Deleting a creation, or an account's banner image, leaves the blob in storage.
- Guardians can see excerpts of "private" content through reports.
- `ytFeed.mjs` is an open YouTube proxy: no rate limit and `Access-Control-Allow-Origin: *`.

Low:
- Votes and hearts can be faked with any `deviceKey`.
- Poker rooms can be overwritten by anyone (play chips only).
- IP hashes use fixed salts.
- The Arron memory id is sent in a GET query string.
- `publish = "."` exposes `docs/`, `scripts/` and `src/` (no secrets found there).

To check in config:
- If Identity autoconfirm is on and an owner email in `NETLIFY_OWNER_EMAILS` has not signed up yet, someone else could register it.

## Next actions (ordered)

1. **Owner:** raise or fix the OpenAI quota or AI Gateway limit (GPT 429). Rotate or replace the xAI key (Grok 403).
2. **Owner:** decide on Google Analytics: add a consent prompt and a privacy-page disclosure, or remove it from the journal and companion pages.
3. **Gemini:** in the secondary repo, merge `feature/production-hardening` after emulator tests, so nobody can redeploy the open `main` rules. Test signed-in cross-user access and Storage.
4. **Claude/Copilot:** add a visibility check to `/api/images/*` and delete blobs on creation and account delete.
5. **Claude:** recover `ai-status` from `agent-on-sane-finance-gbt-page-36c4` as an honest provider-status endpoint. It must use a new migration if it needs one.
6. **GPT:** draft the creator revenue terms (eligibility, fees, refunds, tax, payouts) before any payment work.
7. **Owner:** after agreement, tag the diverged branches listed in the inventory, then delete the 30 fully merged branches.
8. **Grok:** kids series scripts for the three pilot concepts, marked as drafts. No published-episode claims.
