# Pleading Sanity — Ownership and Basic Terms

## Ownership and source of truth
Pleading Sanity is independently owned by Shane Cooper. The canonical source is the GitHub repository [pleadingSanity/pleadingsanity](https://github.com/pleadingSanity/pleadingsanity).

## Hosting and domain roles
- **Primary production host:** Netlify.
- **Primary public domain:** https://pleadingsanity.co.uk
- **Backup host/domain:** Vercel at https://pleadingsanity.uk. Treat this as disaster recovery, not production, unless the owner deliberately changes the plan.
- **Registrar:** Namecheap, according to the current owner-provided setup.
- **DNS:** Verify actual nameservers and records in Namecheap and Netlify before making changes. Registrar, DNS provider and web host are different roles.
- **Deploy source:** the repository main branch, subject to configured Netlify settings and successful checks.

Never change nameservers, domain records, production environment variables, deploy hooks, database state or authentication settings based on this document alone. Confirm the live dashboard state and preserve a working rollback first.

## Continuity
- Talk, journal, games, feed and Arron are intended to remain free; do not introduce a paywall without an explicit product decision.
- Safety lines (Samaritans 116 123 and SHOUT 85258) are independent of this website.
- Keep registrar, DNS, Netlify, Vercel, GitHub and recovery-email access securely documented outside the public repository.
- The GitHub repository is the durable source; a hosting deployment or installed PWA cache is not a substitute for a verified backup.

## Basic terms
- The community is peer support, not a medical service.
- Arron is an AI companion, not a therapist or emergency service.
- Crisis links are on [/crisis.html](https://pleadingsanity.co.uk/crisis.html).
- Any creator revenue share remains a proposal until final terms, eligibility, attribution, tax and payment systems are implemented.

## Privacy and safety
Public privacy wording must match actual deployed code, storage, logs, third-party AI providers and retention behaviour. Do not promise data is device-only, encrypted, never logged or immediately deleted unless verified end to end. See [privacy.html](../privacy.html) and [SECURITY.md](SECURITY.md).

_Evolution, Not Erasure._
