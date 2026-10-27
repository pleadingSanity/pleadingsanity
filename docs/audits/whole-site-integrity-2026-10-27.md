# Pleading Sanity — whole-site source integrity audit

27 October 2026. Read-only source baseline: `ac8f9e0784f045625674f55b4754cd5c81946788`. This is a static source audit, not live HTTP, accessibility, clinical or legal certification. Production pages were not edited.

## Coverage

80 HTML files: 79 root pages plus `docs/deployment-status.html`. 131 tracked JS/TS-family files counted, including the two new audit/test files; 119 production scripts and 100 inline JavaScript blocks inspected. 3,955 anchors, 194 script-src references, 215 images and 67 redirect rules checked. Test/tool scripts are counted but excluded from production tracker/clinical-claim scanning.

| Category | Result | Failures | Warnings |
| --- | --- | ---: | ---: |
| Navigation and links | FAIL | 7 | 0 |
| Crisis and companion boundaries | FAIL | 6 | 119 |
| Trackers and privacy | WARN | 0 | 13 |
| Listening claims | PASS | 0 | 0 |
| Activewear claims | FAIL | 3 | 2 |
| Mobile and accessibility | PASS | 0 | 0 |

16 failure records and 134 context/review warnings (150 total). Counts are records, not unique bugs or affected-page totals.

## Five priorities

1. **Arron offline boundaries:** six unsupported-assurance matches in the two clients remain on this main baseline. PR #127 proposes the correction; it is not part of this audit branch. Review and verify its exact preview before publication.
2. **Arron navigation:** `arron.html` contains shared menu markup without `site.js`. PR #126 addresses this; review its current preview rather than duplicating it.
3. **Approved clothing specification:** three contradictory records in `docs/ACTIVEWEAR_DESIGN_PACK.md` concern the beneath-brain P.S. and zero-bulk instruction. PR #128 proposes alignment. Public shop still links v1.0; upload the actual approved v1.1/addendum separately, without relabelling old bytes. Shop also omits several explicit v1.1 details; omission does not prove a contradictory product claim.
4. **Deployment-status page:** six missing static targets in `docs/deployment-status.html`: root-level canonical URL, relative favicon, manifest, two stylesheets and home link. Confirm whether this page should be published, then correct its actual URL/base paths. These are source-resolution findings, not measured live 404s.
5. **Consistent support/context:** 71 pages mentioning Arron/crisis/mental health lack at least one requested number in static visible HTML; 48 mention Arron without a static companion label. Shared navigation alone can trigger this rule. Check injected UI and standardise a compact accessible support route without treating every warning as proven absence in the rendered page.

## Privacy, sound and accessibility interpretation

No known GA/Pixel/ad-tracker signature was detected in scanned production source. The 13 privacy warnings flag cookie-related code or potentially overbroad local-only wording on backend-enabled pages. Some statements describe a specific local feature and may be correct. Authentication cookies are not automatically tracking cookies. External scripts, response cookies and runtime network behaviour were not inspected, so zero third-party cookies or tracking cannot be certified.

No unqualified curative/clinical listening claim matched the configured audio-page/source rules. Manual context review remains necessary. All 80 HTML files passed the configured viewport/title checks and all 215 image elements have an alt attribute (empty decorative alt accepted). This does not establish useful alt text, contrast, keyboard access or real-phone usability. No literal static redirect loop was found; conditional/platform redirects require runtime checks.

## Reproduce and exact output

```sh
node scripts/audit-whole-site.js
node scripts/audit-whole-site.js --json
node --test scripts/test-whole-site-audit.mjs
```

Use `--fail-on-findings` for a nonzero exit on source failures; default reporting exits normally. `--root PATH` supports isolated audit fixtures.

- Exact plain-text stdout: `whole-site-integrity-2026-10-27.txt`
- Machine-readable results: `whole-site-integrity-2026-10-27.json`
- Audit script SHA-256: `3a823cf5d00b03004e92048672955c850a0beea2f337df21fe39e12fd2449b06`
- Fixture validation: 3 passed, 0 failed. Fixtures cover valid equivalent markup/negative disclaimers, missing resources/redirect loops/trackers, and warning contexts/multiple matches on one source line.

Snapshots describe the unchanged source baseline plus the staged audit tooling. Reruns after merging other PRs will produce different source hashes and findings. Source links in PR #125/#126/#127/#128 remain separate; no existing PR was modified or merged.
