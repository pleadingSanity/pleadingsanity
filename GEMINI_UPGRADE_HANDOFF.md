# Gemini Upgrade — Safe Integration Handoff

## Status
- Working branch: `feature/gemini-upgrade`
- Base: `main`
- Production branch and live website have not been changed by this handoff.
- No Netlify deployment has been triggered.

## Critical architecture finding
The existing production site is a static HTML/CSS/vanilla-JavaScript site. The root `package.json` has no React/Vite build pipeline, and `netlify.toml` publishes the repository root (`publish = "."`) with a no-build command. Gemini's reported React 19 / Vite / TypeScript components cannot safely be copied into the root as-is.

## Firebase rules
The existing rules file is `firebase/firestore.rules`, not `/firestore.rules`. Any proposed rules update must be compared with the existing rules and merged deliberately. Do not replace the existing rules wholesale: that could remove access controls or break existing features.

## Required source before implementation
Obtain the actual Gemini-generated project files or a ZIP/export, including at minimum:
- `src/components/ArronAICompanion.tsx`
- `src/components/WorkspaceHub.tsx`
- `src/utils/audioEngine.ts`
- `src/components/InstallPromptModal.tsx`
- `firestore.rules` and any package/build/config files

A written summary of these files is not enough to implement or test them accurately.

## Safe implementation sequence
1. Import/inspect the actual source files and dependency/config changes.
2. Choose an integration strategy before coding: adapt the modules to the current static app, or host a separate Vite app under a dedicated path. Do not replace the root site without a reviewed migration plan.
3. Review Firebase rules against current rules and test expected access for users, profiles, lives, posts, creator applications, and sanctuary notes.
4. Run the actual production build and available checks.
5. Deploy only to a Netlify Deploy Preview if the account permits it.
6. Review the preview on desktop and mobile; only merge to `main` and publish production after explicit approval.

## Netlify billing/deploy limitation
If Netlify blocks deploys because the account has reached its usage/credit limit, do not attempt to bypass billing or switch to a paid plan automatically. Wait for the account's allowance to reset or have the account owner review the usage/billing dashboard. GitHub changes can be prepared independently, but a deploy cannot be claimed successful until Netlify confirms it.

## Secrets and safety
Never commit API secrets, private keys, OAuth client secrets, or service-account JSON. Use Netlify environment variables for server-side secrets. Do not expose OpenAI/Anthropic/Gemini secret keys in browser-side code.


## Full requested scope — Gemini app + Firebase
The intended deliverable is the complete AI Studio app, not only the pasted Sanctuary Notes manager. Treat these as one integration:
- Arron AI companion and its server-side AI/API path, prompt/schema, and crisis-support handling.
- Workspace Hub and Google Workspace/Keep-related UX.
- Sanctuary Notes: safe rendering (no user fields interpolated into `innerHTML`), local fallback, authenticated Firestore sync, ownership checks, copy/export behavior, and honest Google Keep handoff (do not claim an external note was saved unless confirmed).
- Audio engine: client-side Web Audio only; clear start/stop controls and graceful handling of browser audio restrictions.
- PWA install prompt and manifest/service-worker compatibility.
- Authentication and user profiles; social/email sign-in providers only when configured in Firebase Console and allowed domains are set.
- Existing and new collections/features: users/profiles, posts, lives, creator applications, sanctuary notes, and any other collections actually used by the source.
- Updated Firestore rules must preserve existing production permissions where still needed and scope private records to the authenticated owner. Validate every collection against actual queries before deploying rules.
- Required package/dependency lockfile, Vite/React/TypeScript configuration, styles/assets, routing, environment-variable examples, and build/deploy configuration must be included as a coherent project.

## Firebase configuration checklist
1. Keep the existing Firebase project `pleading-sanity-36bfa`; do not create a replacement project.
2. Inspect `js/firebase.js` and the Firebase Console configuration. Its existing `appId` placeholder must be resolved before declaring Firebase ready.
3. Confirm Authentication providers and authorized domains; do not assume Google/social login works merely because UI buttons exist.
4. Use the Firebase Web SDK config only for public client configuration; never add service-account credentials or private API keys to client code.
5. Review `firebase/firestore.rules` and indexes against the actual app's reads/writes. Test unauthenticated, wrong-user, and owner access before any production rules change.
6. Decide whether the static site and Vite app share the root or the Vite app lives under a dedicated route only after the full export and existing routes are inspected.
7. Never run a production Firestore rules deployment as part of an unreviewed code import.

## Current blocker
The pasted Sanctuary Notes file is one component, not the complete source project. Implementation of the whole app requires the actual AI Studio export/ZIP (including all files and configuration). Until that is available, this branch contains preparation only and the live site remains unchanged.
