# Repository and branch sweep — 2026-11-20

Read-only inventory first, then safe deletions only. No PR was merged and no
default branch was touched. Irreversible repository deletions are listed for
explicit owner approval and were **not** executed.

## 1. Repo inventory (9 accessible repositories)

| Repo | Default | Visibility | Archived | Pushed | Size | Branches | Disposition |
|---|---|---|---|---|---|---|---|
| `pleadingSanity/pleadingsanity` | main | public | no | 2026-11-20 | 96.8 MB | 12 | Active production; keep |
| `pleadingSanity/pleadingsanity-dev-lab` | main | private | no | 2026-11-20 | 14.4 MB | 7 after cleanup | Private audit/security lab; keep |
| `pleadingSanity/orca` | main | public | no | 2026-11-20 | 3.19 GB | 1 | Orca app source; keep, never delete |
| `pleadingSanity/Ps` | main | public | no | 2026-11-04 | 43.8 MB | 1 after cleanup | Dual-repo sandbox history; hold pending owner call |
| `pleadingSanity/astro-platform-starter.ps` | main | public | no | 2026-11-02 | 2.8 MB | 2 | Template starter; open dependabot PR #1; hold |
| `pleadingSanity/pleadingSanity-pleadingsanity` | main | public | **yes** | 2026-10-09 | 2.9 MB | 2 | Archive candidate; approval required |
| `pleadingSanity/pssi` | main | public | **yes** | 2026-10-06 | 2.1 MB | 9 | Archive candidate; approval required |
| `pleadingSanity/sanctuary` | main | public | **yes** | 2026-10-04 | 1.7 MB | 1 | Archive candidate; approval required |
| `pleadingSanity/main` | main | public | **yes** | 2026-10-04 | 40.4 MB | 1 | Archive candidate; approval required |

### Repository deletion note
Repository deletion removes issues, releases, settings and history permanently.
The four archived repositories above were not deleted in this sweep. The token
also lacks a confirmed repository-administration delete capability; deletion
should be a dashboard action by the owner after downloading any wanted archive
tarball. Recommended order if approved: download tarballs first, delete only
after confirming local copies.

## 2. Branch deletions executed (safe: merged or fully contained)

| Repo | Deleted branch | Recorded tip | Why safe |
|---|---|---|---|
| `pleadingSanity/Ps` | `docs/dual-repo-release-gates-20261104` | `3a06e2ef69f79a3f0787e4351cff209f7fae5ef6` | PR #1 merged; ahead 0, behind 1 vs main |
| `pleadingsanity-dev-lab` | `copilot/fix-219383229-1447621462-31570126-881a-4b4f-913e-8c4782e72eeb` | `cb4b873a200ba958c87a13ebadf3e019d16e6615` | PR #1 merged; ahead 0, behind 6 vs main |
| `pleadingsanity-dev-lab` | `guardian/monitor-2026-11-17` | `abfc2525` | Contained in `guardian/monitor-2026-11-20` (ahead 0) |
| `pleadingsanity-dev-lab` | `guardian/monitor-2026-11-18` | `3fac1861` | Contained in `guardian/monitor-2026-11-20` (ahead 0) |
| `pleadingsanity-dev-lab` | `guardian/monitor-2026-11-19` | `fb8df486` | Contained in `guardian/monitor-2026-11-20` (ahead 0) |

Raw machine record: `artifacts/branch-sweep-20261120/deleted-branches.json`.
Closed-PR commits remain reachable by their SHA; do not assume permanent GitHub
commit retention after force-push periods, which is why tips are recorded here.

## 3. Branches kept because they carry unique work (no deletion)

### Production repo `pleadingsanity/pleadingsanity`

| Branch | Open PR | Unique value kept | Future phase |
|---|---|---|---|
| `fix/shop-live-first-batch` | #372 | First valid live catalogue batch; gate-compatible | Shop (Phase 5) |
| `chore/orca-workspace-file` | #373 | Root `orca-workspace.yaml` for Orca Join | Hardware tooling |
| `feat/maker-pack-sources-20261120` | #374 | 35 verified STLs, sources, renders, manifest, catalogue rows | P.S Studio archive |
| `chore/upgrade-blueprint-audit-20261120` | #375 | Audit, master blueprint, sweep and bring-up docs | Phases 1–6 reference |
| `feat/ps-playlists-benchmark` | none | `data/ps-playlists.json`, `js/ps-playlists.js`, CSS, benchmark doc, test | Phase 1/2 radio content |
| `fix/arron-cheap-grok` | none | Cheap default provider config, `AI-CREDITS-FUND.md`, provider test | Phase 3 Arron cost control |
| `grok/arron-anthropic-workspace-20261115` | none | Optional Anthropic workspace header, env examples, provider tests | Phase 3 Arron |
| `release/music-radio-vercel` | none | `music-creator.html`, 521-line creator JS, 268-line test, release guard, Vercel release audit | Phase 5 music revenue engine |
| `content/power-for-our-people-polish` | none | Unpublished editorial post draft (+47 lines) | Editorial queue |
| `daily-guardian-17nov` | none | Daily Guardian content draft (+37 lines) | Editorial queue |
| `staging` | none | Historical migration provenance, consolidation doc, old Firebase-key cleanup notes | Archive reference only; not a deploy target |

### Private lab `pleadingsanity-dev-lab`

| Branch | Open PR | Unique value kept |
|---|---|---|
| `guardian/monitor-2026-11-20` | none | Cumulative latest guardian findings (supersedes deleted 17–19 Nov branches) |
| `guardian/arron-fetch-bounds-20261119` | none | Bounded Arron URL-fetch security patch and test; Phase 3 security candidate |
| `fix/arron-session-review-20261106` | #4 | Arron session recovery candidate and regression harness |
| `audit/ecosystem-20261106` | #3 | Security patches, reports and provenance snapshots |
| `audit/house-check-20261113` | none | House-check regression root cause and rollback note |
| `import/ai-studio-verified-20261105` | none | AI Studio source snapshots (server, App, music player, consent banner) for the music engine |

### Template/dependency branch
- `astro-platform-starter.ps` `dependabot/npm_and_yarn/...` PR #1 remains open;
  dependency bumps wait on owner review, not deletion.

## 4. Harvest rules before any future cleanup
1. Unique code (provider config, music creator, fetch bounds) must be ported to
   an approved feature branch or cited in the relevant phase plan before the
   source branch could ever be removed.
2. Unique docs (credits fund, benchmarks, security reports) get consolidated
   into the production `docs/` tree on an approved PR; this sweep recorded
   locations instead of rewriting history.
3. Content drafts stay until published or explicitly dropped by the owner.
4. Lab experiment patches remain in the private lab; public production receives
   only reviewed, tested changes behind PRs.

## 5. Local workspace note
Several disposable local clones and checkout directories exist under the chat
workspace (historical worktrees and branch checkouts). They are not remote
branches and were left untouched; disk can be reclaimed later after confirming
every referenced commit is present in a pushed branch or this report.
