# Recovery — Netlify agent run 6ad7b3ca

Date: 20 October 2026
Main SHA before this note: `59fcb42634a49accd56e81fb0923575547870bb8`
Run: https://app.netlify.com/projects/pleadingsanity/agent-runs/6ad7b3ca09b1cb5909d83ab9
Database branch name reported by the brief: `agent-6ad7b3ca09b1cb5909d83ab9`

This file records what was searched. It does not contain recovered game code. None was found.

## Result: not recoverable from here

| Check | Result |
|---|---|
| GitHub branch `agent-6ad7b3ca09b1cb5909d83ab9` | 404. Not a branch. |
| Pull requests containing `6ad7b3ca09b1cb5909d83ab9` | None. |
| Code or commits containing that id | None. |
| `docs/PLATFORM-MASTER-AUDIT.md` on `main` | 404. |
| `docs/REMAINING-WORK.md` on `main` | 404. |
| Game-rule test files on `main` | None. Poker, solitaire and pyramid logic live in page and function files, not in an automated test suite. |
| Netlify agent page from this session | Login wall. No commit SHA, no diff, no button error. |
| Netlify API token in this session | Not present. Deploys and agent logs could not be read. |

A Netlify database branch is not a GitHub branch. Nothing from that run was pushed under the run id. The Create Pull Request failure cannot be diagnosed further without the Netlify session log. This repository cannot repair Netlify's own button.

Do not delete the Netlify preview, the agent session, or the database branch. Do not invent the nine poker fixes or the eleven tests.

## What is already on main (do not rebuild)

Recent `main` commits, newest first:

- `59fcb42` restore full `games.html` from `9117408`, plus the cozy CSS link
- `d260811` optional cozy tavern theme. Existing themes stay selectable.
- `9117408` solar referral page in the sitemap
- `3de2411` via merged PR #96: Arron knowledge file restored. Provider order left as GPT → Claude → Gemini → Grok.

PR #92 stays an open draft. It was not edited, merged, or closed. Head: `fix/ai-chain-hop-logging-20261016` at `f59372a`.

## Cozy portraits branch

`polish/games-cozy-assets-20261020` at `350112b` is 2 commits ahead of an older base and 7 behind `main`.

The character SVGs on that branch (`ollie.svg`, `zara.svg`, `max.svg`, `mia.svg`, `blinky.svg`, `bruno.svg`) are already on `main` at the same sizes.

The only file `main` does not have is `assets/games/characters/ollie-portrait.jpg`. It is 47 bytes. The bytes are the text `placeholder - binary not supported in this call`. It is not a picture. It was not imported.

## Other open PRs, not merged

| PR | State | Head | Why it was left |
|---|---|---|---|
| #92 | Open draft | `f59372a` | Owner said leave it. AI-chain logging. |
| #78 | Open | `4da61f1` audit/agent-safety-quality-20261011 | Old CI and instruction edits. Not compared line-by-line against today's `main`. Do not merge blind. |
| #69 | Open | `22d5ff5` codex/human-homepage-current | Homepage work from before the later home restores. Likely stale. |
| #48 | Open | `1322b3f` agent-on-sane-finance-gbt-page-36c4 | Known to import `providerRegistry()`, which `ai-chain.ts` does not export. Copying it would break the build. |
| #46 | Open | `aa2cd1d` polish-ai-family-brand-core | Diverged identity polish. Do not overwrite later logo and home work. |
| #96 | Merged | `3de2411` | Already on `main`. |

## Legacy repo

`PleadingSanity1/pleading-sanity-frontend` default branch `main`, last push 2 September 2025.

Not copied. Its root still has `clip1.mp4`, `clip2.mp4`, `crying-brain.gif`, `crying-hoodie.png`, `crying_brain_hoodie.png`, `hoodie.jpg` and `brain-logo.png`. Those paths are not on production `main`. Production already has crying-brain logos as webp under `assets/images/brand/`, and a feed at `content/content_feed.json`.

Also not copied: `Nuke-and-pave.yml` and the old deploy YAML files. They are outdated and unsafe to drop onto the live site.

Importing the clips and hoodie pictures needs the owner to confirm the files are the ones they want, and that they are free to publish. This pass did not download them.

## Support-ready note for the PR button

- Site: `pleadingsanity`
- Agent run id: `6ad7b3ca09b1cb5909d83ab9`
- Symptom: Create Pull Request darkens and returns, no GitHub PR
- GitHub check at 20 October 2026: no branch, no commit, no PR with that id
- This environment: Netlify dashboard requires login; no Netlify token was available to read the run log
- Ask Netlify support for the agent run's git push error and whether a repository branch was created outside GitHub

No extra spend. No production deploy from this note. No security change.
