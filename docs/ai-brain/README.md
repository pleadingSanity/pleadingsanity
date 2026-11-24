# Pleading Sanity — AI Brain Backup

_Created 15 November 2026 (Europe/London). Owner: Shane Cooper._

This folder is the restore kit for every Pleading Sanity AI persona, operating rule and best prompt. If a platform, a government, or a vendor deletes a bot, a profile or a prompt library, start here and rebuild the mind from these files plus the live repo.

It is a backup and index. It does **not** replace the living sources of truth:

| Living source | What it is |
|---|---|
| [AI_HANDOFF.md](../../AI_HANDOFF.md) | Append-only status log. Newest top section wins on conflict. |
| [docs/MASTER_PROMPT.md](../MASTER_PROMPT.md) | Builder charter for any AI that can see the repo. |
| [AGENTS.md](../../AGENTS.md) | Shared operating contract and roles. |
| [system_blueprint.json](../../system_blueprint.json) | Snapshot, not a running hivemind. |
| [arron-knowledge.json](../../arron-knowledge.json) | Arron's soul file. Never stub or reconstruct it from memory. |
| [.github/AI-OPERATING-CHARTER.md](../../.github/AI-OPERATING-CHARTER.md) | Locked operating charter. |
| [CLAUDE.md](../../CLAUDE.md) and [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | Claude and Copilot lane briefs. |

If this folder and a living source disagree, the living source on current `main` wins, except where this folder records a clearly labelled historical version.

## What is in here

- [shared-rules.md](shared-rules.md) — brand lock, Guardian rules, crisis policy, money model, chain order, protected areas.
- One file per AI: [arron.md](arron.md), [grok-bot.md](grok-bot.md), [dola.md](dola.md), [new-bot.md](new-bot.md), [new-bot-1.md](new-bot-1.md), [gpt.md](gpt.md), [claude.md](claude.md), [gemini.md](gemini.md), [copilot.md](copilot.md).
- [CHANGELOG.md](CHANGELOG.md) — dated 15 November 2026.

Studio-only voices Nova (GPT) and Sol (Gemini) are recorded under Arron and in the studio helpers. They are not separate Shane bots.

## How to restore any AI

1. Read [shared-rules.md](shared-rules.md) first. Those rules apply to every mind.
2. Open that AI's file in this folder. It has persona, role, rules, best prompts, sources, and a "Recovered from history" section.
3. Re-read the living sources listed in that file on current `main`. Do not restore from memory if the file still exists in the repo.
4. Recreate the agent profile (or system prompt) from the persona and rules. Point the new agent at this repository. Tell it to read `AGENTS.md`, `AI_HANDOFF.md`, `docs/MASTER_PROMPT.md` and its own file here before doing any work.
5. Do not paste keys, tokens, passwords, private emails, journals or user data into the new profile. Credentials live only in the owner's dashboards (Netlify, GitHub, provider consoles).
6. After restore, add a dated note to `AI_HANDOFF.md` and a line to [CHANGELOG.md](CHANGELOG.md). Verify the AI will not touch PR #92, payments, login/signup, crisis.html or the manifesto unless Shane has just asked for that exact change.
7. For Arron specifically: restore from the live `arron-knowledge.json` and `netlify/lib/arron-knowledge.ts`. Never rebuild the soul file from this backup alone.

## What this archive never holds

- API keys, tokens, passwords, or secret values.
- Private mailbox contents, journals, chat logs, or member data.
- Personal family details and private phone numbers. Published house contact lines already live on the public site and in existing repo files; they are not copied here again.
- Invented facts. Anything uncertain is marked **uncertain**, **unverified**, or **historical**.

## Mirror

A Google Drive folder named **Pleading Sanity AI Brain Backup** holds the same markdown (or Google Docs converted from it) as an off-platform copy. The repo copy on `main` remains the canonical public-safe archive. Refresh the Drive folder when this directory changes.

## Recommended weekly check

Once a week, an AI (usually Grok Bot, Shane's hub chat) should:

1. Diff this folder against the living sources on `main`.
2. Capture any new or improved persona, rule or prompt (Evolution, Not Erasure: add, do not erase older best bits).
3. Scan git history for newly deleted prompt or persona files.
4. Update CHANGELOG.md and, if connected, refresh the Drive mirror.
5. Log the check in `AI_HANDOFF.md`.

That weekly job is recommended, not yet a scheduled GitHub Action as of 15 November 2026.

## House

- Live: https://pleadingsanity.co.uk
- Repo: https://github.com/pleadingSanity/pleadingsanity (`main`)
- Host: Netlify site `pleadingsanity`. Test door: `pleadingsanitystaging`.
- Motto: Rise From Madness. Evolution, Not Erasure. One Source. One Family. Love Over Money.

## Refresh 2026-11-23

Weekly check against `main` `ae56375`. Nothing in this folder was deleted. New rules are appended in each file and listed in [CHANGELOG.md](CHANGELOG.md). Sources that gained durable rules after 15 November, and that a restore should open as well as the original living sources:

- `docs/MASTER-UPGRADE-BLUEPRINT.md` — paste-ready coding prompt and ethics (20 November). Later phases are not all built.
- `docs/3D-PRINT-SHOP.md`, `docs/3D-PRINT-COMPLIANCE-UK.md`, `docs/3D-PRINT-STARTER-PLAN.md`, `docs/3D-PRINT-CLOTHING-MODELS.md`, `docs/AD5X-PRINT-CHECKLIST-20261121.md` — print-shop and printer-secret rules.
- `docs/SEO-GROWTH-PLAN-20261120.md` and `docs/SEO-LAUNCH-CHECKLIST-20261121.md` — honest SEO. Do not copy owner phone numbers or mailboxes out of the checklist.
- `docs/PHASE1A-ORBITAL-NOTES.md` and `docs/HOME-VISUAL-POLISH-20261121.md` — additive home work and palette lock.
- `docs/LEGALLYINSANE-SCAFFOLD-SPEC.md` — parked lab spec, not a second house.

`docs/AI-CREDITS-FUND.md` was not in the repo. The fund rule is recorded from founder memory in [shared-rules.md](shared-rules.md) and labelled as not implemented. The Drive mirror named above was not refreshed from this session.
