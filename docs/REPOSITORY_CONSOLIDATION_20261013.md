# Pleading Sanity — repository consolidation and release gates (2026-10-13)

## Intended architecture
- **Canonical repository:** `pleadingSanity/pleadingsanity`. `main` is production source.
- **Integration branch:** `staging` (created from main at `fddf51a`). Use pull requests to staging for integration; promote reviewed, tested changes to main via a separate PR.
- **Deploy preview:** Configure Netlify branch deploy/preview for staging using **isolated test accounts and test data**. A branch alone is NOT a deployed or isolated test environment. Keep production domain on main. Independently verify Vercel backup parity.
- **No new repo or duplicate application.** Archive other repositories as historical sources until their unique code has been inventoried and any useful functionality ported with tests.

## Inventory observed from GitHub
| Repo | State | Branches | Open PRs | Decision |
|---|---|---:|---:|---|
| pleadingSanity/pleadingsanity | active | 48 before staging | 5 (#86, #78, #69, #48, #46) | production source |
| pleadingSanity/pleadingSanity-pleadingsanity | active | 2 | 1 (#1) | Firebase/React source; review unique features and migration risks before archive |
| pleadingSanity/pssi | archived | 9 | 3 (#1, #2, #4) | preserve desktop agent history; do not delete |
| pleadingSanity/main | archived | 1 | 0 | compare unique React games before cleanup |
| pleadingSanity/sanctuary | archived | 1 | 0 | preserve auth/sanctuary code until comparison |

**Do not delete branches or repositories yet.** Active PR heads, unmerged features, historical provenance and backup recovery are not yet inventoried. Archive status is not deletion.

## Release priorities
1. P0: finish and test PR #86 private media authorization. Its proposed changes are unverified; inspect public, private, friend, blocked, banner and video access. Fix any guest or cache regressions. Never merge without preview tests.
2. P0: inspect production secrets, Identity, Firestore rules, privacy and authenticated social uploads.
3. P1: audit #78, #69, #48, #46 for conflicts and feature duplication; merge only genuinely missing improvements.
4. P1: compare AI Studio React CreatorHub, Arron, games, WorkspaceHub and Firebase integrations against canonical pages. Port unique working features in small, testable PRs, not a wholesale overwrite.
5. P1: inventory PSSI desktop agent and archived main/sanctuary for unique working code; retain historical repos as read-only until reviewed.
6. P2: accessibility, responsive design, creator live workflows, site builder, visual media and performance.

## Branch cleanup criteria
A branch may be deleted only after: no open PR depends on it; unique commits/files have been reviewed; any desired code has been merged or explicitly rejected; recovery tag or commit SHA is recorded; CI/deploy preview has passed; founder has approved the deletion. Do not bulk-delete based on branch age or name.

## Verification still outstanding
No claim of production parity, preview isolation, passing CI, end-to-end auth tests, or complete cross-repo code parity is made here. These require live Netlify/Vercel configuration access and tested deployments.

## Shared-agent coordination
Read `AGENTS.md`, `AI_HANDOFF.md`, `CLAUDE.md` before changes. Each agent should read latest main and staging, work on one scoped PR, and record evidence. Credits are not a prerequisite for repository housekeeping.
