# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-13 by Grok (Sane Builder). Read `CLAUDE.md`, `AGENTS.md` and
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
