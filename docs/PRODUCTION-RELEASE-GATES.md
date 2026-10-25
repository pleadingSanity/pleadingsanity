# Production Release Gates

Use this checklist for every meaningful release. It is intentionally conservative because the site handles sensitive journal entries, AI conversations and community content.

## Gate 1 — source and CI
- [ ] Changes are on a dedicated branch and reviewed as a focused diff.
- [ ] npm ci and npm run build succeed.
- [ ] python3 scripts/audit-site.py succeeds.
- [ ] No credentials, deploy hooks, personal data, debug output or default production passwords are committed.
- [ ] No dependency, redirect, service-worker or content-security-policy changes were introduced without review.

## Gate 2 — assets and experience
- [ ] All referenced images, icons, fonts and audio assets exist locally or use a deliberate, documented external source.
- [ ] Meaningful images have useful alt text; decorative images have empty alt text.
- [ ] Images reserve layout space and use responsive sizing where appropriate.
- [ ] No large, redundant or unlicensed image files were added.
- [ ] Mobile widths, keyboard navigation, visible focus, contrast and reduced-motion preferences are checked.

## Gate 3 — sensitive data and security
- [ ] Journal and AI data flows match the privacy notice.
- [ ] Deletion/Forget Me is verified at every actual persistence layer; UI confirmation alone is not proof of deletion.
- [ ] Authorization is enforced by server functions, not merely by hiding browser buttons.
- [ ] Private pages have appropriate cache and indexing headers and are excluded from service-worker caches.
- [ ] API keys remain server-side; logs do not contain message bodies, tokens or raw network addresses.
- [ ] Crisis support remains accessible without sign-in or an AI provider.

## Gate 4 — production deploy
- [ ] Netlify publishes the expected Git commit.
- [ ] The primary domain and HTTPS work.
- [ ] Core routes and API endpoints are smoke-tested using a test account.
- [ ] Netlify function and database logs show no new critical errors.
- [ ] Vercel backup and rollback route are known and tested before any DNS failover.
- [ ] A named person can restore the previous known-good release.

## Smoke-test matrix
| Area | Minimum test | Evidence |
|---|---|---|
| Authentication | sign-up, confirmation, sign-in, sign-out, recovery | test account and expected email/UI result |
| Arron | message, provider failure fallback, delete/forget | function logs without sensitive message contents |
| Journal | create, reload, export, delete | verify database/device storage directly |
| Community | private/public post, block, report, moderation role | test users with different permissions |
| Feed/video | live API and no-key fallback | response status and rendered state |
| PWA | install, offline page, update, private-page cache exclusion | mobile browser test |
| Accessibility | keyboard, focus, contrast, reduced motion, image alt | manual checklist |
| Backup | open backup domain and test dependencies | verified commit and HTTPS |

Do not claim a feature is fixed based only on static checks. Record any untested gate as outstanding.


## Meta handoff review branch — 25 October 2026

- [x] Current main and named remote branches inspected; supplied Meta patch branches/archives not available to apply.
- [x] Read-only primary/backup checks: both homepages 200; primary Arron health 200/ok, backup health 404; root soul identical on both. No model call or raw user-content request.
- [x] Soul read-only fingerprint: Git blob `7055cb714f70342ef6e1c0ecfc43bd6cde3e8825`, 44,561 bytes before changes.
- [x] Existing client fallback reused; add server-parity crisis detection with legacy phrases retained, and a nonblank string reply guard.
- [x] Five synthetic offline/HTTP failure/response-contract regressions pass via `node --test scripts/test-arron-offline.mjs`.
- [x] Complete local run: 64 JavaScript tests + 5 Python monitoring tests pass; audit passes 79 HTML/209 script blocks; diff clean; root soul Git blob unchanged.
- [ ] Exact-head CI and preview verification — required before approval; not inferred from local tests.
- [ ] Shane's review/merge approval — required for this branch; no production merge by this agent.
- [ ] Actual Meta archives/patches, complete personal comments, native-phone/PWA and live provider-chain tests — still missing.

Do not test the chat endpoint with GET and label its method error an outage. Do not make paid provider calls merely to fill a test checkbox. Browser observations, if performed, are recorded separately; local fixtures do not prove deployed behaviour.
