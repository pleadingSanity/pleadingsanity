# Deployment Status and Release Readiness

This file is a checklist, not a claim that every feature is currently production-ready.

## Current intended architecture
- **Primary:** Netlify publishes the static site and Netlify Functions for https://pleadingsanity.co.uk.
- **Backup:** Vercel hosts https://pleadingsanity.uk for recovery.
- **Source of truth:** GitHub repository pleadingSanity/pleadingsanity, with reviewed changes merged to main.
- **Domain registrar:** Namecheap, according to the current owner-provided setup. Confirm nameservers and DNS records in the relevant dashboards.

## What code checks prove
The static audit can catch selected file, asset, script and backend syntax issues. It does not prove that sign-in, email delivery, AI provider calls, database migrations, permissions, deletion or third-party integrations work in production.

## Release gate
A release is ready only when:
1. CI checks pass on the exact commit.
2. A Netlify deploy preview is reviewed.
3. Netlify publishes the intended commit.
4. The live canonical domain and key assets respond correctly.
5. Critical user journeys pass with a test account and non-sensitive sample data.
6. Privacy/security claims match the actual implementation.
7. The backup deployment and rollback path are known to work.

See [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md), [SETUP-ROLES-AND-CHECKLIST.md](SETUP-ROLES-AND-CHECKLIST.md) and [SECURITY.md](SECURITY.md).

## Outstanding dashboard checks
- [ ] GitHub Actions secret NETLIFY_BUILD_HOOK is present and points to the intended Netlify site, or the workflow is aligned with Netlify's native Git integration.
- [ ] Netlify environment variables and database configuration match the functions actually deployed.
- [ ] Netlify deployment logs show the intended commit.
- [ ] Vercel backup pleadingsanity.uk serves the intended fallback commit and has working TLS.
- [ ] Namecheap registration, nameservers and renewal status are confirmed.
- [ ] End-to-end authentication, Arron, journal, community, video and PWA tests pass.

Until these are checked, describe the site as deployed with verification pending, not universally fully fixed or ready.
