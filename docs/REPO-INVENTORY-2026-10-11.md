# Repository and branch inventory — 2026-10-11

Written before anything is deleted. Nothing has been deleted, merged or tagged by this audit.
Source: GitHub public API compare (`main...branch`) and a file-by-file content check of every
diverged branch against `main` at `b6334e3`. "Missing in main" means the file path does not exist in main.

## Repositories

| Repository | Role | State |
|---|---|---|
| `pleadingSanity/pleadingsanity` | Production source of truth (static site + Netlify Functions + Netlify Database) | 48 branches. `main` = `b6334e3` (PR #76), live on pleadingsanity.co.uk |
| `pleadingSanity/pleadingSanity-pleadingsanity` | Separate React/Vite (TypeScript) app, Firebase project `pleading-sanity` | 2 branches: `main` `4a149c6`, `feature/production-hardening` `2aad28a` (+8 / −0) |
| `pleadingSanity/sanctuary` | Historical | Archived on GitHub. 1 branch `main` `f5e4fe9`. Preserve. |

## Primary repo — fully contained in main (30 branches)

These have **zero commits that are not already in main** (`ahead_by = 0`). They hold no unrecovered work and
can be deleted safely once the owner agrees. Record the SHA first if you want a reference:

`add-package-lock-and-apis`, `agent-ai-companion-development-9aaa`, `agent-all-code-repositories-a284`,
`agent-an-ai-companion-app-25c6`, `agent-and-essential-files-2eb1`, `agent-and-ownership-structure-3ef1`,
`agent-and-profiles-957b`, `agent-app-for-pleading-sanity-c0ea`, `agent-arron-integration-f9d4`,
`agent-as-shanes-ai-reflection-7256`, `agent-connection-and-privacy-15c1`, `agent-dependency-conflict-a47d`,
`agent-directory-in-netlifytoml-b1d6`, `agent-fasthosts-to-netlify-5c7e`, `agent-for-pleading-sanity-4ac9`,
`agent-in-packagejson-8812`, `agent-infinity-scroll-73b2`, `agent-issues-on-small-devices-2fe7`,
`agent-mobile-app-development-b375`, `agent-peer-dependency-conflict-b1b3`, `agent-pleading-sanity-project-3a13`,
`agent-pleading-sanity-project-898d`, `agent-pleading-sanity-project-af1a`, `agent-ranks-high-on-google-ads-788d`,
`arron-ai`, `buff/homepage-icons-dock-polish`, `feature/api-parity-nextjs`, `feature/import-legacy-netlify`,
`feature/netlify-health`, `feature/netlify-proxy`.

## Primary repo — no shared history with main (2 branches)

`codespace-updates` and `cosmic-sync`: GitHub cannot compare them with main (no merge base). Treat as
separate historical lines. **Tag before any cleanup** (e.g. `archive/codespace-updates`) and keep.

## Primary repo — diverged branches with unique commits (15)

| Branch | Ahead / behind | Last commit | What is unique | Recommendation |
|---|---|---|---|---|
| `agent-on-sane-finance-gbt-page-36c4` | +5 / −7 | 2026-10-11 | **13 files missing in main**: provenance "passport" (`passport.html`, `netlify/functions/passport.mts`, `netlify/lib/passport.ts`, `netlify/lib/provenance.ts`, `js/page-passport.js`), `netlify/functions/ai-status.mts` + `js/ai-status.js` (provider status), `roadmap.html`, `docs/ECOSYSTEM.md`, `docs/GROK-BRIEF.md`, a 128px logo, and migration `20261008162857_add_provenance_passport` | **Recover in small PRs.** `ai-status` first (honest provider status). The passport needs a NEW migration with a timestamp later than `20261009173403` — do not copy the old-dated one. Also 129 files differ (mostly merges of main): do not merge the branch wholesale. |
| `codex/human-homepage-current` | +3 / −7 | 2026-10-11 | `css/home-clarity.css`, `docs/CROSS-REPO-AUDIT-2026-10-11.md`; edits to `index.html`, `js/site.js`, `sw.js` | Review the doc and CSS; rebase before any merge (main has moved on). |
| `polish-ai-family-brand-core` | +8 / −7 | 2026-10-11 | Shared AI house directive; edits to `ai-chain.ts`, `studio.ts`, `studio-podcast-background.mts`, `content/arron-knowledge.json`, `ai-ecosystem.html` | Review against the current chain (main now has a time budget). Rebase; do not overwrite `ai-chain.ts`. |
| `feature/gemini-upgrade` | +3 / −55 | 2026-10-09 | `GEMINI_UPGRADE_HANDOFF.md` (docs only; notes an AI Studio key exposure audit) | Recover the doc into `docs/`. Confirm any exposed key was rotated. |
| `sane-finance-gbt-complete` | +4 / −224 | 2026-10-08 | Finance decision journey edits (`finance.html`, `js/finance.js`, `finance-adviser.mts`) | Compare with the current finance page; main has evolved. Likely superseded — owner to confirm, then tag and delete. |
| `docs/transparency-and-metrics-20261010` | +5 / −41 | 2026-10-10 | Earlier versions of transparency/metrics/ownership docs | Superseded by PR #75 versions in main. Tag and delete. |
| `feature/my-digital-story-slice-a` | +2 / −41 | 2026-10-10 | Earlier My Digital Story | Superseded by PR #73. Tag and delete. |
| `experience/home-doors-and-nav-20261010`, `fix/restore-homepage-doors-20261010`, `copilot/full-opts-clean-beautif-workin` | +1–3 / −41–43 | 2026-10-10 | Alternative `index.html` versions | Superseded by main's homepage. Tag and delete. |
| `copilot/main` | +1 / −41 | 2026-10-10 | "Wire sky.jpg into pages that lacked it" (7 pages) | Check whether those 7 pages show the sky today; recover only missing lines. |
| `agent-new-code-added-with-grok-cc30` | +2 / −315 | 2026-10-04 | Review of Grok-added code across 21 files | Very stale; main has rewritten these files. Tag and delete after owner glance. |
| `copilot/fix-repositories-and-deploy` | +25 / −467 | 2026-09-26 | Vercel/Next.js era files (`next.config.js`, `vercel.json`, `public/chat.html`, `netlify/functions/arron-ai-core.js`, sync workflow) | **Do not merge** (second host / framework is against house rules). Tag and delete. |
| `copilot/sync-dev-repo-with-main` | +10 / −678 | 2025-11-02 | Same Vercel/Next.js era files | **Do not merge.** Tag and delete. |
| `copilot/add-universal-cosmic-sync-workflow` | +3 / −665 | 2025-09-23 | `pages/404.js` (Next.js) | **Do not merge.** Tag and delete. |

## Secondary repo — `feature/production-hardening` (+8 / −0)

Commits: remove public wildcard Firestore access; production readiness audit; typecheck/build CI;
consolidated navigation plan; stop reporting simulated Workspace actions as successful; report note sync
status accurately; avoid duplicate local note write; multi-AI audit brief.

- The secondary repo's **`main` `firestore.rules` is wide open**: a catch-all `match /{document=**}` with
  `allow read: if true; allow write: if true;`, plus public reads of `users` and `creator_applications`.
- The hardening branch replaces this with explicit, owner-scoped rules. **Merge it into that repo's main**
  after emulator tests, so nobody redeploys the open rules from main by accident.
- It is a React/Vite app with its own Firebase project (`pleading-sanity`). **Do not merge it into this static
  site.** Bring ideas across one at a time.

## Live checks done for this inventory

- Unauthenticated read probes (one document, status only) against Firestore for `users`, `profiles`, `posts`,
  `follows`, `lives`, `creator_applications`, `sanctuary_notes`, `journals`, `messages`:
  - project `pleading-sanity` (secondary app): **all 403 PERMISSION_DENIED**. The open rules from that repo's
    main are **not** what is deployed today.
  - project `pleading-sanity-36bfa` (this site's `js/firebase.js`): Firestore API **not enabled**. This site's
    `firebase/*.rules` are not deployed anywhere, and `js/firebase.js` is inert (appId is still a placeholder).
- Not tested: unauthenticated writes, signed-in cross-user access and Storage rules. These need console or
  emulator access with test accounts.
