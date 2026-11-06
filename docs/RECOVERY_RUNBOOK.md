# PLEADING SANITY — Recovery & Cost-Control Runbook
Updated: 2026-11-06. Founder: Shane Cooper. This is operational guidance, not a backup or proof of recovery testing.

## Authoritative systems
- Canonical code: https://github.com/pleadingSanity/pleadingsanity (main). Read AGENTS.md, AI_HANDOFF.md, docs/MASTER_PROMPT.md and system_blueprint.json before changes.
- Production Netlify project: pleadingsanity (site ID 31c56935-32d5-4932-8a63-2db881842090), https://app.netlify.com/projects/pleadingsanity, primary domain https://pleadingsanity.co.uk.
- Staging Netlify project: pleadingsanitystaging (site ID 6206ef0b-6c37-4397-90ff-aeeec33121cd). Keep staging isolated from production.
- Public DNS as checked 2026-11-06: authoritative NS dns1.p06.nsone.net through dns4.p06.nsone.net (Netlify DNS). Apex and www resolve. shop.pleadingsanity.co.uk had no A/AAAA/CNAME. No apex MX or TXT; SPF and DMARC missing. DNS state may change; recheck before editing.
- Existing shop route /shop.html. Do not assume shop subdomain is live.
- Brand contact pleadingsanity1@gmail.com; connected Gmail accounts also include delivery.shane@gmail.com, mma.shane1@gmail.com, pleadingsanitydev@gmail.com. Do not copy private mailbox contents into the repository.

## Non-negotiables
- Preserve free sanctuary, crisis pages, Arron boundaries, journal privacy, PWA, working links, and the approved apparel specifications. Evolution, Not Erasure.
- Never store API keys, passwords, recovery codes, private messages, or user data in Git.
- Never create paid resources, enable billable tiers, change billing, or deploy unreviewed AI edits without explicit founder approval.
- Keep existing Firebase project and AI provider sequence; do not replace infrastructure to solve minor faults.

## Outage procedure
1. Check DNS resolution for apex and www; verify Netlify site and latest published deploy, and inspect incident status and deploy logs.
2. Check GitHub main, recent commits, CI failures and whether a known-good production deploy is available.
3. If a recent deploy caused an outage, prepare a rollback to the last verified good deploy; get founder approval before switching production.
4. If DNS fails, verify authoritative nameservers and domain registration; repair only against a known-good DNS snapshot. Do not guess A/CNAME/MX records.
5. Validate homepage, support/crisis pages, Arron, sign-in, journal privacy, shop route, PWA and mobile after recovery. Record evidence and timestamps.
6. If provider is unavailable, export/restore from GitHub and a separately verified asset/config backup into a temporary environment; test before switching DNS. Git alone is not a complete database/secret backup.

## Cost incident procedure
1. Inspect Netlify, Firebase/Google Cloud, domain registrar and third-party billing alerts.
2. Identify project, service, invoices, limits and any actual usage. Disable unneeded optional workloads only after assessing impact.
3. Do not disable crisis/support routes or delete data as a cost response.
4. Ask founder before any payment, plan upgrade, new vendor, or non-reversible change.

## Backups still to verify
- Independent export of repository plus static assets.
- Encrypted, access-controlled backup of Firebase/Firestore/Storage as applicable, and a documented restoration test.
- Secure inventory of environment variable names and owners (never values in Git).
- Domain registrar access, expiry/renewal, and DNS zone export.
- Restore drill on staging; record actual RTO/RPO only after measurement.

## Email security
Current public DNS lacks SPF/DMARC and MX. First confirm whether any service sends as @pleadingsanity.co.uk before adding non-sender SPF/DMARC policies. No MX required until a domain mailbox or forwarding provider is chosen. Never invent provider MX/DKIM values.
