# Pleading Sanity: cross-repository audit and homepage clarity

Reviewed 11 October 2026. Main-site baseline: `f5561fe`.

## Outcome and scope

Keep `pleadingSanity/pleadingsanity` as the canonical static Netlify site. The older unfinished homepage draft was not applied over newer work: this patch starts from current main, preserving its crying-brain logo, sky, showcase images, routes and PWA configuration. PR #56 is already merged; its backend syntax coverage is present.

This is a source audit, repository inventory and focused homepage patch, not an end-to-end security certification. No production deployment, provider login, real user record, payout or private media was exercised. Repository metadata and remote heads were refreshed during this pass.

## Repository inventory

| Repository | Reviewed commit | Observed value | Decision |
| --- | --- | --- | --- |
| pleadingsanity | f5561fe | Canonical static pages, Netlify functions, account/community code, Arron and games | Improve in place |
| main (archived) | 41efee7 | TanStack app with daily prompts, local progress and a smaller home journey (`src/routes/index.tsx`) | Adapt the idea of a gentle first action; do not import its separate app/runtime |
| sanctuary (archived) | f5e4fe9 | Compact entry points and optional further links (`src/routes/index.tsx`), journal and games | Adapt progressive navigation; retain canonical URLs |
| pssi (archived) | 42223ee | Electron/Express system-intelligence application (`package.json`, `app/core`, `app/server`) | Not a drop-in website feature; retain as archive |
| pleadingSanity-pleadingsanity | 4a149c6 | React/Firebase creator tabs, profiles and visual concepts | Do not transplant backend or sample activity into production |

## Important unresolved findings

1. **Canonical image access:** `netlify/functions/images.mts` skips `currentUser()` for GET and returns a blob by key without checking the owning post's audience. This is a source-confirmed missing authorization check; production exposure was not probed. Resolve and test public/member/friend/private cases before claiming private media is protected.
2. **Canonical poker HTML injection:** `poker.html` interpolates `s.name` into `innerHTML`; `netlify/functions/poker-room.mts` accepts a sliced name without HTML escaping. Do not treat slicing as sanitization. Test hostile seat names before shipping a targeted fix.
3. **Existing PR #48:** still open and reported mergeable by GitHub during this audit. Its description proposes fixes for these risks plus substantial privacy, provenance and database changes. Do not mistake its proposed fixes for code on main. Review its current diff and validate its migration/authenticated flows before merging; it is not simply a visual cleanup.
4. **Separate Firebase project's rules:** `firestore.rules` contains a recursive `allow read: if true; allow write: if true;`. This grants unrestricted access if deployed; more specific rules do not cancel that permission. Deployment status is unknown. Do not copy or deploy these rules. A rules repair needs an owner-bound schema and emulator tests.
5. **Separate Firebase project's simulated features:** `ArronAICompanion.tsx` generates keyword-based replies after a timeout; `ResilienceWall.tsx` imports sample community stories; `CreatorHub.tsx` seeds chat and uses a fallback audience of 84; `WorkspaceHub.tsx` can create a mock token. These are not evidence of live AI, real members, real viewers or an authenticated Workspace integration.
6. **Creator capabilities:** `docs/CREATOR-PLATFORM-STATUS.md` distinguishes external-stream preview/feed sharing from native broadcasting, shared chat, automatic edited clips and verified payouts. The homepage now reflects these limits. The 90% / first-1,000 offer remains proposed and conditional on income, eligibility, accounting and approved terms.
7. **Deployment ownership:** the baseline commit has successful statuses from several Vercel projects. Those statuses do not verify the canonical Netlify deployment. No deployment connections were removed or altered.

## Changes made in this patch

- Four clear starting actions: talk, journal, games and community.
- Prominent Live/creators, profile and support links; optional movement links retain the New Gen Bible and founder story.
- Warmer introduction and three original writing prompts, explicitly distinguished from member stories.
- Corrected overbroad Forget Me and device-only game-progress claims using the current backend and `js/progress.js` as evidence.
- Retained finance visibility with clearer link text and less absolute data wording.
- Main landmark, skip link, visible keyboard focus, reduced-motion rules and flexible narrow-screen navigation.
- Fixed the mobile dock Menu button on the newer homepage. It opens its details menu, synchronizes expanded state and supports Escape/focus return. Existing shared navigation remains supported. Pages with neither menu no longer get an inert Menu button.

## Verification actually performed

- Before and after: `python scripts/audit-site.py` passed for 73 HTML pages and 255 external/inline JavaScript/TypeScript blocks, local href/src targets and duplicate IDs.
- `git diff --check` passed.
- DOM interaction checks using the already-available jsdom runtime passed: homepage menu open/close, expanded state, Escape, focus movement, legacy shared menu, clipboard-share fallback, all homepage root-relative links, four primary actions and a single main landmark.
- Cross-page fragment scan found one apparent missing static ID (`ai-studio.html#pod`); inspection confirmed `js/ai-studio.js` reads the hash and selects the matching tab. No broken fragment was established by this scan.
- Chromium is absent. The Playwright browser download repeatedly returned an invalid/truncated archive, so mobile rendering, screenshot review, real browser accessibility and game interactions were **not verified**. DOM tests do not substitute for those checks.
- No authenticated Arron, posting, friend, privacy, deletion or creator flow was tested against production.

## Release gate and rollback

Open this focused patch for review. Complete desktop/phone browser checks and inspect the deployment checks before merging under `AGENTS.md`. Security repairs and PR #48 need their own review and authenticated tests. Do not represent this patch as resolving all security findings.

Rollback is a revert of this patch. No database migration, dependency, secret, account, hosting configuration, manifest ID or service-worker scope is changed.
