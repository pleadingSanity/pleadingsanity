# `legallyinsane.co.uk` bring-up sheet — 2026-11-20

## Verified status (this environment, Cloudflare DoH + HTTP probe)

| Check | Result |
|---|---|
| `legallyinsane.co.uk` A record | Status 0; `207.207.210.107`, `207.207.210.229` |
| Nameservers | `curitiba.ns.porkbun.com`, `fortaleza.ns.porkbun.com`, `maceio.ns.porkbun.com`, `salvador.ns.porkbun.com` |
| HTTP port 80 | `200 OK`, parking "Coming Soon" page, legacy UA tag `UA-59154711-35`, AWS ALB cookies |
| HTTPS 443 | TLS handshake failure — no certificate installed yet |
| MX / TXT / AAAA | none |
| `illegallyinsane.co.uk` | NXDOMAIN (Status 3), no A or NS records; different spelling, not this site |

Read this as: the domain resolves and points at a parking/proxy page, but it
has no real site, no TLS and no backend. Nothing here can be configured from
this sandbox (no Porkbun or hosting dashboard token).

## Bring-up order (once Shane supplies access or does the dashboard steps)

1. DNS target decision
   - Recommended: same Cloudflare zone as `pleadingsanity.co.uk` (records and
     TLS consistent with the main site); keep Porkbun registration but switch
     nameservers to Cloudflare, or leave Porkbun NS and add records there.
   - Add `@` A/AAAA or CNAME to the deploy target; `www` CNAME to the same;
     proxy on for TLS/CDN; SSL mode Full (strict) after the cert issues.
2. Hosting
   - Fastest: a separate Netlify site (or Vercel project) connected to its own
     repo; never reuse the sanctuary production project's environment or data.
   - Static build: no build command required; copy `_headers` security pattern
     but write separate CSP and crisis/privacy copy for this brand.
3. Code separation
   - Own repo/branch; `/ai-core/` shared logic mirrored per Phase 3 of the
     master blueprint; env vars separate; orders and contact lists separate.
   - No printer credentials, internal ownership figures, or private material.
4. TLS and launch checks
   - `curl -I https://legallyinsane.co.uk` returns 200/301 with a valid cert.
   - 404 page, redirects `www` -> apex, no mixed content, parking tag removed.
   - Test sandbox features (AI prompts, tools, renders) here; production
     sanctuary unaffected by breakage.
5. Content direction (Shane's brief)
   - AI test/sandbox plus second studio presence: every code and prompt the AIs
     need, kept current, with no history loss. Prefer versioned prompt modules
     and a changelog over deleting old prompts; archive superseded modules.

## Access Shane must provide (prefer dashboard steps; rotate any token pasted)
- Porkbun domain edit access or API key/secret for DNS records;
- hosting provider (Netlify/Vercel) project permission;
- approval for any paid provider keys used on this second site.

## Note on the alternate spelling
`illegallyinsane.co.uk` has no records. Defensive registration can be considered
later, but it must not replace work on the live spelling `legallyinsane.co.uk`.
