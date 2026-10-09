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
