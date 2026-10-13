# AI_HANDOFF — shared verified state for GPT, Claude, Gemini, Grok and Copilot

Last updated: 2026-10-13 by GPT (copy audit and deployment verification), following Grok (Sane Builder). Read `CLAUDE.md`, `AGENTS.md` and
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
- **Open copy checks:** many older footers outside the polished main pages still reference `https://www.tiktok.com/@mentally.inshane`; user's current specified TikTok link is `https://www.tiktok.com/@mentallyinshane`. Plan a single controlled bulk link fix with minimal deploys; do not create dozens of individual release commits. User-provided Facebook/LinkedIn/TikTok URLs could not be independently opened owing to provider restrictions; verify by hand.
- **Grok long-copy pack:** some external phase-1–3 drafts, master bio and voice guide were described by the founder but no matching standalone copy pack was located in repository search. Current HTML is the authoritative deployed copy. Preserve any later original Grok source if supplied; do not invent missing copy.
- **Next safe steps:** sync Vercel mirror projects to a single reviewed GitHub SHA after checking deployment cost controls; verify `.co.uk` and `.uk` status, primary artwork, 7 critical routes and fallback behaviour with real HTTP/browser tests; arrange site-wide legacy TikTok link consistency; keep the remaining privacy/image-access audit with Claude.
- **Finance rule:** £0 additional spending unless the founder explicitly approves it. No billing, credential or infrastructure settings changed in this review.
