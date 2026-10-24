# Production Deployment Checklist

This repository is a static HTML/CSS/vanilla-JavaScript site with Netlify Functions. Netlify is the primary production host for https://pleadingsanity.co.uk; Vercel hosting for https://pleadingsanity.uk is the backup. Do not follow older Next.js instructions unless the architecture is intentionally changed.

## Before every release
- [ ] Work on a branch and open a pull request; do not experiment directly on main.
- [ ] Run npm ci and npm run build.
- [ ] Run python3 scripts/audit-site.py.
- [ ] Check the diff for secrets, personal data, debug output and unrelated changes.
- [ ] Confirm image assets exist, have useful alt text and preserve layout on mobile.
- [ ] Verify private pages are not indexed or cached and sensitive content is not included in service-worker caches.
- [ ] Confirm no browser-facing variable contains a private AI/API key.
- [ ] Check redirects, canonical URLs, sitemap, manifest, service worker and security headers.
- [ ] Review the actual Netlify deploy preview before merging.

## Netlify production configuration
In the Netlify dashboard, confirm the correct site and branch:
- Publish directory: repository root (.).
- Functions directory: netlify/functions.
- Build command: the command in netlify.toml; the static site currently requires no bundling step.
- Domain: pleadingsanity.co.uk, with the intended canonical redirect from www.pleadingsanity.co.uk.
- Environment variables: configure only variables used by current code, server-side. Keep API keys private. Never create NEXT_PUBLIC_OPENAI_API_KEY or expose provider secrets in browser code.
- Database: verify Netlify Database availability, migrations and backup/recovery process where deployed functions require it.
- Deploy trigger: inspect the actual Netlify Git connection and build-hook configuration. The GitHub workflow expects the Actions secret NETLIFY_BUILD_HOOK. If Netlify's native Git integration already deploys every push, avoid a duplicate hook-triggered deployment. Never paste the hook URL into logs or commit it to Git.

## GitHub Actions deploy workflow
The workflow at ../.github/workflows/deploy.yml posts to the configured Netlify build hook after checks. A successful HTTP response means the hook accepted a request; it does not prove the site finished deploying or that the live domain serves the new commit.

After a deploy:
- [ ] Confirm the Netlify deploy is published and identify the exact commit SHA.
- [ ] Confirm https://pleadingsanity.co.uk/ loads and redirects are canonical.
- [ ] Check important page routes and static assets.
- [ ] Check key API/function routes and Netlify function logs.
- [ ] Keep the last known-good deploy available for rollback.

## Required end-to-end smoke tests
Use test accounts and non-sensitive sample data:
- [ ] Sign-up, email confirmation, login, logout and password recovery.
- [ ] Arron chat, provider-unavailable fallback and Forget Me/delete behaviour.
- [ ] Journal create, save, reload, export and delete; verify actual storage location.
- [ ] Community post/profile visibility, block, report and moderation permissions.
- [ ] Netlify Functions and database migrations used by these flows.
- [ ] Video/feed fallback when the YouTube API key is absent or rate-limited.
- [ ] Shop/forms, creator LIVE external embeds, mobile navigation and PWA install/offline behaviour.
- [ ] Crisis links are tappable on mobile and do not depend on an AI provider.
- [ ] Keyboard navigation, focus visibility, reduced motion, contrast, alt text and narrow-screen layout.

Do not mark a feature tested if it was only checked by a syntax scanner. Do not use real member journal entries or production personal data for tests.

## Secrets and configuration
- Keep secrets in Netlify environment variables or GitHub Actions secrets only where required.
- Do not use public-prefix variables for private keys.
- Remove example/default credentials from production configuration; rotate any real secret that has ever been committed.
- Never add API keys, deploy-hook URLs, database URLs or auth tokens to screenshots, issue comments, test fixtures or logs.
- Review environment-variable examples against current code before declaring a variable required.

## Security workflow status
The Mayhem workflow is a template until it starts the real API and points to a valid OpenAPI specification. A successful placeholder step is not a completed security scan. Do not claim a clean API security assessment until the real scan and SARIF upload both succeed.

## DNS and backup
Before changing DNS, record the current Namecheap registrar state, nameservers, DNS records, Netlify domain status, HTTPS status and Vercel backup status. Make one change at a time, preserve working records and verify recovery. Do not infer DNS configuration from the registrar name alone.

_Last reviewed: 24 October 2026. Re-verify dashboard settings before each release._
