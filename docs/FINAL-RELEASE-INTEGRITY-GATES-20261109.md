# Final release integrity gates — 2026-11-09

**Release candidate status: BLOCKED — this document is an evidence-based gate, not a claim of full-system verification.**

Canonical repo: `pleadingSanity/pleadingsanity`, `main` at `1f5db86457973a3f3b411e06a21be75bf09caf6f` at audit time. Preserve the latest successful production deployment until the replacement passes all gates.

## Verified read-only observations
- Open PRs: #78, #176, #180, #185, #243–#248. PRs #243–#247 are drafts; do not bulk merge. #248 is a scoped radio playlist change.
- Open issues include #150 (Arron unavailable), #158 (PayPal security), #231 (Sonos/licensing), #232 (master release inventory).
- GitHub check results for #248: continuous quality audit, Firebase API validation, CodeQL and Arron knowledge integrity passed; whole ecosystem static audit, APIsec and Debricked failed. Review logs before assigning causes. No production merge authorized by this file.
- `arron-knowledge.json` on `main` is parseable JSON and 48,146 characters in connector text; historical `052e1aa` version is parseable and 44,445 characters. **Do not blindly overwrite current soul file with historical content.** Compare fields and preserve verified additions.
- The main site has an existing Insane Radio YouTube player, radio library and music backend. Do not bypass music licensing or use YouTube extraction.

## Required gates before final production PR
1. **Inventory:** compare all owned repos (canonical, dev-lab, Ps, astro-platform-starter.ps, archived backups), every branch, open PR and issue. Identify actual unique diffs and merge conflicts; never import prototypes wholesale.
2. **P0 safety:** browser-verify crisis numbers (999, 116 123, SHOUT 85258, NHS 111 option 2), Arron 'AI companion, not therapist', offline support and private journal permissions.
3. **P0 auth/payment:** reproduce and fix #150; validate real provider failover GPT → Claude → Gemini → Grok with secrets kept server-side; test Firebase rules, session boundaries, and PayPal order/enquiry binding (#158/#176) before payment-related merge.
4. **CI:** inspect logs for whole ecosystem static audit, APIsec and Debricked failures; distinguish service/configuration failures from confirmed defects. No bypassing gates just to make them green.
5. **Core regressions:** test homepage, Arron, journal, all games, creator/profile/live, shop, solar and finance, radio, sign-in, PWA/offline, keyboard and 320/390/412/768px mobile layouts.
6. **Music:** test #248 playlist URLs, browser embed/CSP, mobile, playback controls and YouTube terms. Do not claim private YouTube Music access or rebroadcast rights.
7. **Domain verification:** test `www.pleadingsanity.co.uk`, `pleadingsanity.co.uk`, `www.pleadingsanity.uk`, `pleadingsanity.uk` and canonical redirects with real HTTP results. Confirm Netlify production SHA separately from GitHub commit.
8. **Privacy:** do not commit personal email archives, passwords, tokens, family records, journals or OAuth credentials. The founder's four email accounts are sources only with authenticated access and purpose-limited consent; never automatically ingest or publish all mail.
9. **Release:** create focused tested patches, record checks and review outcomes, obtain founder approval for security/payment/privacy changes, deploy with rollback available, then verify real production. Update `AI_HANDOFF.md` with exact SHA and files changed.

## Stop conditions
- A security gate fails or is unverified.
- Protected crisis/Arron functionality regresses.
- Production deploy cannot be independently confirmed.
- New recurring cost, subscription, DNS or payment change lacks approval.
- Proposed 'final PR' contains unreviewed unrelated changes.

**Handoff:** This PR changes only release documentation. No production code, credentials, DNS, Firebase rules, Netlify configuration or email data were modified.
