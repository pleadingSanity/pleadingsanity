# Prompt for Grok — Safe, Additive Pleading Sanity Review

You are helping review and improve the Pleading Sanity repository:
https://github.com/pleadingSanity/pleadingsanity

## Architecture and non-negotiable constraints
- Primary production: Netlify at https://pleadingsanity.co.uk
- Backup: Vercel at https://pleadingsanity.uk
- Registrar: Namecheap according to the owner; DNS provider must be verified in dashboards.
- The repository is primarily static HTML, CSS and vanilla JavaScript with Netlify Functions. Do not convert it to Next.js, React, another framework or a new build pipeline unless the owner explicitly requests that migration.
- Preserve existing routes, page names, manifest IDs, canonical URLs, redirects, service-worker behaviour, API contracts, user accounts, data schemas, database migrations, accessibility and crisis-support links.
- Work only on a new branch. Never force-push, rewrite history, merge to main, deploy, change DNS, rotate secrets or change production settings.
- Never ask for, print, commit or expose secrets. Do not add API keys to browser code, HTML, JavaScript, public environment variables, examples or logs.
- Do not invent capabilities or promise encryption, privacy, payouts, deletion or provider availability that the code does not prove.

## Mission
Perform a careful, evidence-based review and make small, additive, reversible improvements only. Prioritise:
1. Fix broken links, obvious runtime errors, invalid markup, accessibility defects and security issues supported by evidence.
2. Improve responsive layout, spacing, typography, contrast, loading states, error states and visual consistency without replacing the site's identity.
3. Improve existing imagery: reuse local brand assets first; add relevant, properly licensed images only where useful; optimise size; provide descriptive alt text; reserve image dimensions; respect reduced motion and low bandwidth. Do not scatter random stock images on every page.
4. Improve tests and release checks so failures are caught before deployment.
5. Update stale documentation to match the current architecture and primary/backup hosting roles.
6. Keep crisis support, privacy controls, account access, journal safety and Arron deletion behaviour intact.

## Required workflow
1. Inspect the entire repository, current branch and existing changes before editing.
2. Create a branch named grok/safe-polish-YYYYMMDD.
3. Identify each proposed issue with file path, evidence, severity and minimal fix.
4. Make changes in small groups; avoid broad rewrites and unrelated formatting.
5. Run existing checks and add focused tests where practical. Run npm ci, npm run build and python3 scripts/audit-site.py if the environment supports them.
6. Search the diff for secrets, accidental personal data, broken local links, missing image assets and unsupported claims.
7. Summarise tests actually run and list anything not testable without Netlify/Vercel credentials or a test account.
8. Open a draft pull request. Do not merge or deploy.

## Design direction
Keep the dark cosmic Pleading Sanity identity, calm supportive tone and existing brand assets. Prefer clear hierarchy, readable body text, purposeful imagery, subtle depth, responsive cards, strong focus rings and accessible contrast. Avoid excessive neon glow, distracting animation, autoplay audio/video, huge hero images, layout shifts and decorative images that slow down crisis or support pages. Use the existing CSS design system where possible.

## Safety rules for code changes
- Do not delete or rename routes, data, database tables, migration files, auth providers or service-worker caches without a demonstrated need and migration plan.
- Do not modify production API semantics to make a test pass.
- Do not disable security headers or tests.
- Do not claim a static scan is an end-to-end security audit.
- Do not enable Firebase or optional providers without confirming architecture, environment variables and access rules.
- Do not create fake endpoints, placeholder secrets, fake health checks or pretend tests.
- If a change is risky, unclear or requires dashboard access, report the exact manual verification step instead of guessing.

## Final report format
- Summary of changes
- Files changed
- Issues fixed, with evidence
- Tests run and exact results
- Images/assets added or optimised, with source/licence
- Remaining risks and manual dashboard steps
- Pull request URL
- Explicit statement: not merged, not deployed, no DNS or production secrets changed
