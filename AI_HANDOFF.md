# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-12 by Grok (Arron polish). Read `CLAUDE.md`, `AGENTS.md` and
`.github/copilot-instructions.md` first. This file records **what was verified**, **what was changed**,
and **what is still open**, so the next agent starts from evidence, not assumptions.

## STOP before you edit main

The Grok HTTP 403 is an empty xAI balance. On 12 October 2026 a direct call to `https://api.x.ai/v1/chat/completions` and to `/v1/responses`, model `grok-4.7`, both returned HTTP 403 with the vendor code `spending-limit`: credits are gone, or the account needs a subscription. The model name is real. The URL is right. The function is on `main`.

Do not replace `netlify/lib/ai-chain.ts` with another router. Do not add credits, raise a billing cap, set `PS_PAID_SPARES_APPROVED`, or send the same chat to every lab to wake Grok. Do not point this site at the other Firebase project, and do not turn on Blaze.

Grok speaks again only after the owner adds xAI credit himself. Until then the chain is correct to move on. Claude is the mind that was answering. One Arron message is the test after any key change. If the log still says `spending-limit`, stop.

The role names below are assignments in `AGENTS.md`. They are **not** proof that an external agent is
connected or running. Only the provider tests in "Arron's AI chain" prove anything about live AI access.

## Ground truth

| Item | Value | How verified |
|---|---|---|
| Production site | `pleadingsanity` (31c56935-…), https://pleadingsanity.co.uk | Netlify API |
| Latest main (this session) | `9fc08efa0f617a33aa0cdfa5d3b4d0e3a49cb369` (Arron crisis polish) | GitHub |
| Staging site | `pleadingsanity-staging`. Linked to a different repo. Stale. Use deploy previews. | Netlify API |
| Build | Static publish of `.`, functions in `netlify/functions`, edge functions in `netlify/edge-functions`, Netlify Database (Drizzle) | `netlify.toml` |
| Firebase in this site | Inert. Firestore API disabled. | Read-only probe |
| Branch inventory | `docs/REPO-INVENTORY-2026-10-11.md` | GitHub |

## How agents coordinate

1. One issue, one branch, one small PR into `pleadingSanity/pleadingsanity`. Netlify builds a deploy preview.
2. Every PR states: files changed, evidence, remaining risks, rollback.
3. Security, auth, payments and data changes need the owner's approval before merge.
4. After a merge, confirm the published commit SHA in the Netlify deploy list and record it here.
5. Never paste secret values into PRs, logs or this file. Env var **names** are fine.
6. Never mark a feature as working until it has been exercised end-to-end.

| Agent | Contributes | Hands back |
|---|---|---|
| GPT | Plans, architecture review, security risk triage | Ordered plan, risks, acceptance checks |
| Claude | Inspects code, patches, runs browser and function tests | PR-ready diff + evidence + this file updated |
| Gemini | Firebase and Google AI integration review | Emulator test results, rules diff |
| Grok | Original creative concepts, visual polish, content | Drafts in `docs/`, marked as drafts until reviewed |
| Copilot | Code review and small isolated fixes | Small PRs with tests |

## Arron's AI chain

Order: **GPT → Claude → Gemini → Grok → free spares**.

| Provider | Result |
|---|---|
| GPT | Production returns HTTP 429 (quota). Failover works. |
| Claude | Answers in production. |
| Gemini | Answers (build env). |
| Grok | **HTTP 403 spending-limit.** Owner must add xAI credit. Chain left untouched. |
| Spares | Not exercised. |

Context is already capped (`fitTurns`, ~24k chars / newest 50 turns). Token budgets exist. Thin replies after a few chats are most likely provider fallback, not missing history.

## Changes in this run (Grok — polish only)

| Area | Change | Evidence |
|---|---|---|
| Arron crisis | Strip now shows 116 123 and 85258 at a glance | `arron.html` commit `9fc08ef` |
| Buttons | Active press states for clearer taps on phones and desktops | `css/arron.css` commit `f64e32c` |
| Earlier creative | Animation-ready kids pilots, content pack, workflow | `docs/kids-animation-ready.md`, `docs/creative-content-pack.md`, `docs/content-workflow.md` |
| Security / chain | No security, auth, function, or ai-chain files touched. | — |

## Next actions (ordered)

1. **Owner:** Add xAI credit (spending-limit). Fix OpenAI quota (GPT 429). Update Netlify env if the key changes. Do not paste secrets. Chain stays as-is.
2. **Claude:** Continue image visibility and blob cleanup. Confirm deploy of the Arron polish.
3. **GPT:** Creator revenue terms before any payment work.
4. **Owner / Grok:** Confirm showcase images load on the homepage after any remaining drops.

## Grok session note — 2026-10-12

- Crisis numbers are now visible on the Arron page without a click.
- Buttons have tactile active feedback.
- Arron context management is already in place. xAI spending-limit and GPT 429 remain the main reliability issues. Chain not replaced.
- No logic or security changes.

One source. Evolution, Not Erasure.
