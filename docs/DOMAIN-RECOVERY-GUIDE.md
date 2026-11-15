# Domain and Hosting Recovery Guide

**Last corrected:** 24 October 2026. The earlier version contained time-critical expiry claims dated September 2026 and instructions for Fasthosts/Cloudflare. Those instructions are stale and must not be followed.

## Current intended setup
- Primary site: https://pleadingsanity.co.uk
- Primary host: Netlify
- Backup site: https://pleadingsanity.uk
- Backup host: Vercel
- Registrar: Namecheap, according to the current owner-provided setup
- Source: https://github.com/pleadingSanity/pleadingsanity

These roles are distinct. Namecheap may be the registrar while DNS is managed elsewhere. Do not assume Namecheap nameservers, Netlify DNS or Cloudflare DNS without checking the actual records.

## Safe recovery sequence
1. Sign in to Namecheap and confirm both domains are registered, renewed and set to auto-renew if that is the owner's choice.
2. Record current nameservers and export/screenshot existing DNS records before changing anything.
3. Sign in to Netlify and confirm pleadingsanity.co.uk is attached to the intended production site, HTTPS is valid, and the latest published deploy is the expected commit.
4. Sign in to Vercel and confirm pleadingsanity.uk is attached to the intended backup project, HTTPS is valid, and the backup build contains the expected code.
5. Check whether DNS is managed by Namecheap, Netlify DNS or another provider. Make changes only in the authoritative DNS provider.
6. Confirm mail-related DNS records (MX, SPF, DKIM and DMARC) before replacing nameservers; losing these can interrupt email.
7. Test the primary domain, www redirect, backup domain, HTTPS, key static assets and critical function routes.
8. Keep the last known-good deploy and DNS record snapshot until recovery is verified.

## Deploy-hook recovery
The GitHub workflow expects the Actions secret NETLIFY_BUILD_HOOK. In Netlify, confirm the hook exists for the correct site and branch. If stale, create a new hook in Netlify, update the GitHub Actions secret, and run the workflow manually. Never place the hook URL in this repository, an issue or a log.

If Netlify is already connected to GitHub and deploys on pushes, decide whether the hook is still needed before running it; otherwise a push may create duplicate builds. A hook response confirms request acceptance only. Confirm the final published deploy and commit in Netlify.

## If the primary host fails
1. Check Netlify status and latest deploy logs.
2. Do not immediately switch DNS. First establish whether the failure is a build issue, function issue, domain issue or provider incident.
3. Verify the Vercel backup is healthy and has the required environment variables, database dependencies, redirects and TLS.
4. If failover is necessary, document the exact DNS change, TTL and rollback plan. Make the minimum required change and test it.
5. When Netlify is healthy, restore intended primary routing and verify canonical redirects.

## Never do these
- Do not follow old expiry deadlines or contact instructions in the previous version.
- Do not change nameservers based only on a domain registrar label.
- Do not delete DNS records without a backup, especially mail records.
- Do not copy production secrets into GitHub files or share them with a bot.
- Do not assume the Vercel backup works just because a build says READY; test its domain and application dependencies.

_Evolution, Not Erasure._
