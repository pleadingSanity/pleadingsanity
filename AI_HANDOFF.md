# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-13 by GPT (image and page audit; meditation illustration). Read `CLAUDE.md`, `AGENTS.md` and
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

## 2026-10-13 — journal restore + Arron script + empty states (Grok)

- Commit `341c7a2` on main. Deploy and Continuous quality audit both **success**.
- `journal-vault.html` restored to the full page (917 lines) after two truncated pushes. Purpose line added. Empty state now invites one line.
- `arron.html` loads `/js/arron-companion.js` (the missing `/js/arron.js` reference is gone). Crisis numbers stay on the dedicated crisis page; Arron signposts to support and crisis so the house check passes.
- `games.html` and `finance.html` have purpose lines and calm empty states. No logic changes.
- xAI spending-limit and GPT 429 remain owner actions. Chain untouched.
- Other agent branches exist. Do not mass-merge. One source stays `main`.

## 2026-10-13 — three calm visuals + breathing room (Grok)

- Added three new showcase images: `brain-calm.jpg`, `cards-calm.jpg`, `journal-calm.jpg` under `assets/images/showcase/`.
- Small breathing-room rules appended to `css/design-system.css` (purpose line spacing, card margins, mobile padding).
- No logic, auth, payment, or chain changes.
- Deploy and quality audit were green on the previous restore commit. These are visual only.

## 2026-10-13 — space movement visuals + copyright notice (Grok)

- Three new space images under `assets/images/space/`: `aurora-drive.jpg`, `aurora-planets.jpg`, `aurora-streaks.jpg`. Electric blue Northern lights, shooting stars, distant planets, sense of forward motion.
- Homepage background now uses `aurora-drive.jpg` with a dark overlay. Reduced-motion safe.
- Title and meta description strengthened for search. Honest copyright line added in the footer with a low-cost licence note. No invented penalties.
- `.uk` has a verified custom-domain mapping (`redirect: null`) to a separate Vercel production project (`html-starter-pleadinsanity-2179`). Its READY deployment previously matched `main` at `89ce1e1`; Netlify is the `.co.uk` primary. Direct live HTTP status and whether Netlify-only API routes work on Vercel remain unverified. Recheck both after deployment; do not claim complete functional parity.
- No logic, auth, payment, or chain changes.

## 2026-10-13 — targeted visuals and seven-page audit (GPT)

- Starting `main`: `89ce1e1015fc2537c359733f68e76e045b7587da`. Kept original crying-brain brand and colour palette. No auth, payments, Netlify Identity, functions, API keys, costs or PWA identifiers changed.
- Reused existing `assets/images/showcase/frequencies.jpg` in the Meditation soundscape, with a responsive illustrated panel, descriptive alt text, intrinsic dimensions and lazy loading. Audio and timer logic unchanged. No new binary image needed.
- Reviewed `/`, `games.html`, `finance.html`, `journal-vault.html`, `arron.html`, `meditation.html`, `about.html` from GitHub. The requested purpose lines for Games, Finance and Journal already exist; no duplicate headlines added.
- Confirmed GitHub blobs exist for all six homepage showcase JPEGs, three aurora-space backgrounds, all 15 game-card JPEGs, meditation's new frequency image, the original logo and the key editorial images. The image files were not replaced because they were already coherent, distinctive cosmic artwork.
- `crisis.html` source visibly contains clickable 999, Samaritans 116 123 and SHOUT 85258 contacts without a reveal step.
- Backup check: Vercel has a separate verified `pleadingsanity.uk` domain mapping (no configured redirect) and a READY GitHub-linked deployment; not proof of a direct HTTP 200 or functioning Netlify-only serverless endpoints on the backup. Do not call it a tested, fully functional backup until those checks pass.
- Still open for Claude: live browser checks of all seven page layouts, real mobile interactive flows, media HTTP responses, accessibility contrast and privacy/image access. Gemini owns Firebase rules; Grok owns further content. No staging site was treated as production.
