# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-13 by Grok (full audit polish). Read `CLAUDE.md`, `AGENTS.md` and
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
| Latest main | `31b7fe8190e85a76db9f82f8ba491deb0c404d29` (design-system polish) | GitHub |
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
- Showcase images may still 404 if not binary-dropped.
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
