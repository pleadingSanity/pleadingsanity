# Secondary repository integration and security review

Reviewed 2026-10-11. Source: `pleadingSanity/pleadingSanity-pleadingsanity`, branch `feature/production-hardening` (8 commits ahead of its own main).

## Findings requiring action before integrating that app

- The separate React/Vite app's production-readiness audit reports a dangerously broad Firestore wildcard rule in its original main. Verify and fix that project's actual deployed Firestore rules before enabling it for users.
- Its hardening branch adds explicit Firestore rules, but those require collection-by-collection emulator tests. Do not overwrite `pleadingsanity/firebase/firestore.rules` with rules from a different project.
- Google Workspace operations and AI responses in the separate project were reported as partly simulated. Never show mock success as real.
- Firebase sign-in providers, authorized domains, server-side AI keys, PWA install and mobile accessibility require independent testing.
- Preserve the existing production static site and its routes. Integrate useful ideas individually through reviewed PRs and preview tests.

## UX integration direction

Prefer a few clear entry points: Home, Arron & Healing, Community, Create & Live, Games & Kids, Story, Shop. Preserve all existing deep links, journals, New Gen Bible and crisis/support pages. Do not remove unique functionality while reducing navigation clutter.

## Current release

Netlify production was verified ready on commit `f65083f3f02201919b6932129588666e52715f0f` (2026-10-11). A ready deploy does not prove end-to-end correctness. GitHub PRs #72–#75 were merged.

## Outstanding verification

Run Firestore emulator security tests on the secondary project, inspect actual deployed Firebase rules, smoke-test production and mobile workflows, verify logos/icons and accessibility, and compare historical branches before deleting anything.
