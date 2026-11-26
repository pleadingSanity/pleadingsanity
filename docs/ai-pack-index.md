# Pleading Sanity — AI pack index

_26 November 2026. Base: `main` `2eb18dd`. Status: index only — this file points at the packs and plans; it does not contain them._

## Read first

- `AI_HANDOFF.md` — the append-only cross-agent status log. Newest entry wins on conflict. Append only, never rewrite history.
- `AGENTS.md` — the shared operating contract and roles.
- `docs/MASTER_PROMPT.md` — the builder charter.
- `docs/ai-brain/README.md` — the AI brain restore kit (personas, rules, best prompts). This index does not duplicate it.
- `docs/AI-CAPABILITIES-STATUS.md` — what an in-repo agent can typically do, and what still needs the owner. Capabilities vary by session; it is not proof of access.

## Where the packs live — NOT in this repo

This repository is **public** and readable by anyone. The merged pack, the four branch plans, the Excel audit and the games / images / music / AD5X plans live **outside** it, in two private places:

1. Shane's private workspace: `~/workspace/your_files/` (packs) and `~/workspace/` (branch plans).
2. The **My AIs** space — Shane's eight AIs in one hub and shared chat, built 26 Nov 2026. It holds the shared brief and notes, a shared thread, and a task board of who is doing what.

They stay out of this repo because they contain private items that must never be published: billing details, key names, `[TO FILL — Shane only]` figures, excluded workshop items, internal failure details, and manifesto text. **Never commit the Excel file or any pack/plan file to this repo.** If a pack item needs to become repo work, copy only the public-safe task into a branch, with private items redacted as `[TO FILL — Shane only]`.

Shane's instruction, 26 Nov 2026 ~01:58 GMT: make sure all his AIs on his site can always read all of this (the merged pack, the four branch plans, the Excel audit, the games / images / music / AD5X plans) and can fix and push if needed. This index is the repo-side pointer that makes that possible without publishing the private packs. What each AI can actually do today — and what is still unverified — is in "Access today" below, not assumed here.

## The packs and plans

| # | File (private — see above) | What it covers |
|---|---|---|
| 1 | `pleading-sanity-merged-execution-pack.md` | The merged execution pack for Shane's AIs: Shane's latest answers, guardrails for every branch, implementation order, Branch 1–4 + Music + Funders summaries, consolidated `[TO FILL — Shane only]` list. Suggest-only. |
| 2 | `pleading-sanity-full-audit.xlsx` | The full audit workbook, 13 sheets: Cover, Repo_State, Branch1_AI_Chain, Branch2_SEO, Branch3_Pages_Apps, Branch4_Revenue, Music, Funders, Games, Images, AD5X_Prompt_Print, TO_FILL_Decisions, Auth_Audit_Log. Private working file — never commit it. |
| 3 | `pleading-sanity-branch1-ai-chain-fix.md` | Branch 1 fix plan for Shane's AIs: Arron chain fail-safe, owner-only knowledge refresh, crisis synthetic tests, offline wording and tone-count fixes, "never fails again" guard. |
| 4 | `branch1-ai-chain-fix-plan.md` | Branch 1 detailed read-only diagnosis: root cause per failing workflow, minimal ordered fix sequence Fix 0 → 7, fail-safe chain spec restated from code, knowledge refresh procedure, crisis measurement procedure, what is blocked on Shane only. |
| 5 | `branch-2-3-seo-fill-plan.md` | Branches 2 + 3: SEO and domain consolidation, fill empty pages and make apps look live. Fix list with file + line evidence, patch-ready text, server-rendered content specs (quoted from the repo only), checks per open PR. |
| 6 | `branch-4-revenue-engine-specs.md` | Branch 4 Revenue Engine, 4a–4e: server-rendered prints cards + shop/studio copy fixes; apparel + Founder's 100; support banner; image alt text; funding page, About replacement, support-us cross-link and go-live checklist. |
| 7 | `pleading-sanity-music-make-it-bang.md` | Music: finish the lead single, launch week day by day, then cadence, data and review. What not to do, and what only Shane can answer. |
| 8 | `pleading-sanity-music-funders-games-plans.md` | Music + Funders + Games detailed plans: distributor verification checklist, funder eligibility gaps / application order / framing, per-game buff spec and shared progression spec built on the existing system. Amounts and dates in it are as published on 26 Nov 2026 — verify on the funder's own pages before acting. |
| 9 | `pleading-sanity-games-buff-plan.md` | Games buff plan: every game fully working, with weeks of fun in each. Per-game definitions of "fully working", progression design, shared fixes first, one game at a time. |
| 10 | `pleading-sanity-image-buff-plan.md` | Image buff plan: page-by-page inventory, alt-text fixes first, honest buffing without changing what a picture shows, genuinely-needed new imagery (who must supply / approve it), checks per PR. |
| 11 | `pleading-sanity-prompt-to-print-ad5x.md` | Prompt-to-print with a Flashforge AD5X — feasibility report: no public API, how the printer actually receives files, prompt-to-3D-model tools as they exist in 2026, the safe staged workflow, what "linked to my AD5X" can realistically mean. |

## Branch order — one branch at a time

1. **Branch 1 — Fix 0 → 7.** Fix the AI chain first, and never fails. Fix 0 is triage; the rest follow the minimal ordered sequence in `branch1-ai-chain-fix-plan.md`.
2. **Branches 2 + 3.** SEO / domain consolidation, then fill empty pages and make apps look live.
3. **Branch 4a–4e.** Revenue Engine: prints, apparel, support banner, alt text, funding page go-live.
4. **Music.** Release the lead single properly, then the cadence.
5. **Games.** One game per branch, on top of the existing progression system — not a rebuild.
6. **Funders.** Apply in the plan's order, only after constitution, bank account, safeguarding and the real funding page are real.

## Rules — every branch, every AI

- **Evolution, Not Erasure** — archive, never delete. Preserve history; no force pushes, no rewriting commits.
- **One branch per fix, one PR per fix, never edit `main` directly.** Small, reversible changes. Fix the root cause, not the symptom.
- **Zero invented numbers.** Never invent grants, stream counts, user stats, prices, dates, stock or financial figures. Leave `[TO FILL — Shane only]` intact where Shane's own data is required.
- **Owner approval** before merging anything touching security, auth, payment, data, DNS / registrar, `netlify.toml`, `_redirects`, Firebase rules, database schema, `netlify/functions/arron.mts`, `.env` files, `sw.js`, PWA manifest IDs, or crisis numbers.
- **Suggest-only for other AIs' work.** Never edit or delete what another AI is doing — suggest and help polish. Do not claim consensus or contact with another AI unless an actual review, comment or commit exists.
- **Never claim an integration works until exercised end-to-end.** A prompt alone grants no account access. Record the exact evidence: command run, file and line, output, date.
- **Security (Shane, 26 Nov 2026 ~02:00 GMT): keep the site always secure and all emails secure.** Scan for committed secrets and report by file:line/type only, never the value. No private items in any PR. Crisis numbers unchanged. Auth and owner-only routes stay owner-only. CodeQL / Defender findings are fixed file + line; never suppressed without owner approval.
- **Keep the sanctuary free.** Sanctuary, crisis support, journal and core companion features stay free — no paywall. No revenue-share figure is a live offer until accounting, eligibility and terms are implemented and approved.
- **No automatic production deploys** for unreviewed AI-generated changes. Shane reviews changes before they go live.

## Access today — verified facts only

- **Public repo, readable by anyone:** any AI that can see this repo can read `AI_HANDOFF.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/ai-brain/` and this index. Public read access does not grant write, account or deployment access.
- **Packs sent by Shane:** Shane sent the files/packs to Claude, Dola and Grok on 26 Nov 2026, ~01:19 GMT, to implement.
- **My AIs space:** holds the shared brief and notes for all eight AIs. Muse is the only one live-connected in that chat and really replies there; the other seven are not connected live there.
- **GitHub write access — UNVERIFIED except Muse:** GitHub repo write access is via the Muse GitHub App installed as `pleadingSanity`. No verified write access for Arron, Claude, Dola, Grok, Copilot, Nova or Sol. Until an AI's write access is verified by an actual branch or PR from it, it works by returning a reviewable handoff and identifying the missing capability.
- **Copilot:** repo reviewer and isolated fixes only, per the My AIs space and `docs/ai-brain/copilot.md`. Claude checks after Copilot's first patch.
- **Nova / Sol:** studio-only voices, not separate Shane bots — Nova (GPT) and Sol (Gemini) are recorded under Arron and in the studio helpers (`docs/ai-brain/README.md`). No connection verified.
- **Arron:** the on-site companion, not a repo writer. No verified GitHub write access.

## What this index is not

- Not a copy of any pack or plan. Do not paste pack contents here.
- Not a merge, a deploy, or an approval. Nothing in this file authorises production changes, merges, deployments, billing changes, DNS edits or secret access.
- Not a second handoff log. Status goes in `AI_HANDOFF.md`; persona restores go in `docs/ai-brain/`.
