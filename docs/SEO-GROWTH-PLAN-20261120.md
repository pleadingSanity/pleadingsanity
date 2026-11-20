# SEO growth plan — Pleading Sanity, 2026-11-20

Goal: rank for the branded name first (`Pleading Sanity`, `P.S Studio Plastic
Shane`), then helpful local and mental-health-adjacent queries, without
spammy automation, without paywalling help, and without sacrificing the calm,
original character of the site.

## 1. Measured baseline

- 89 root HTML pages; every page already has a `<title>` and meta description.
- Sitemap: 65 validated entries. Server-side `X-Robots-Tag: noindex` rules in
  `netlify.toml` keep games such as `poker.html` and private app routes out;
  the audit rejects sitemap entries that conflict with those rules, and this
  branch preserves that contract rather than adding them.
- Structured data on home: `Organization` plus `WebSite` JSON-LD with publisher
  reference and UK language tag; full OG and Twitter card tags present.
- OG gap at baseline: `ps-studio.html` (public) lacked OG/Twitter tags; this PR
  adds them. Two private noindex creator pages (`creator-prints.html`,
  `creator-studio-music.html`) remain intentionally out of the sitemap and do
  not need public social tags.
- Noindex inventory (must stay out of sitemap): `admin.html`, `login.html`,
  `signup.html`, `reset-password.html`, `settings.html`, `member.html`,
  `owner.html`, `profile.html`, `404.html`, and app/composer pages such as
  `post.html`, `write.html`, `onboarding.html`, `my-room.html`,
  `my-digital-story.html`, `offline.html`, `builder.html`,
  `cosmic-reflections.html`, `creator.html`, `sanctuary.html`.
- Broken reference fixed in this PR: `ps-studio.html` linked `/support.html`;
  corrected to the live `/support-us.html`.

## 2. On-site changes in this branch (`feat/seo-visibility-20261120`)

1. Add OG and Twitter card metadata to the public P.S Studio page; image uses
   the existing brand webp asset.
2. Repoint the studio navigation support link to the live `/support-us.html`.
3. Validate the sitemap against the noindex/redirect contract; no excluded
   game or app page was added.
4. Add this growth plan document.

No existing titles, descriptions, URLs or content were deleted.

## 3. Remaining on-site roadmap (approved phases, additive only)

### Phase 2 images and performance (largest ranking factor after content)
- Convert heavy JPG/PNG art to WebP/AVIF with `srcset`; lazy-load below-fold;
  keep explicit width/height to remove layout shift (see master blueprint Phase 2).
- Compress the largest rasters listed in the audit; target Lighthouse 95+.
- Add descriptive alt text to every meaningful image; decorative art gets `alt=""`.

### Content and internal linking
- One clear descriptive title and unique description per public page; avoid
  near-duplicate templates across the five planet groups.
- Breadcrumb lists or a sitemap-style hub on the main navigation planet pages;
  every public page reachable within three clicks from home.
- Original editorial queue from retained draft branches (Power For Our People,
  Daily Guardian); publish one original lived-experience piece per week after
  owner review, with accurate dates and author attribution.
- Add FAQ-style `FAQPage` JSON-LD only where real Q&A content exists (crisis
  page, Arron overview, studio ordering questions); no invented questions.

### Trust and accuracy (EEAT)
- Keep crisis numbers exact and consistently linked: 999, 116123, 85258, 111.
- Maintain `privacy.html`, `about.html`, `support-us.html` and contact route.
- Use honest status language ("preview", "coming soon") rather than inflated
  claims; accuracy supports trust signals more than hype.
- Keep lastmod dates truthful in the sitemap; update only when a page changes.

## 4. Off-site checklist requiring owner dashboard access (code cannot do these)

### Google Search Console
- [ ] Verify the `pleadingsanity.co.uk` property (DNS TXT record or uploaded
      HTML file; DNS changes need the domain dashboard).
- [ ] Submit `https://pleadingsanity.co.uk/sitemap.xml`.
- [ ] Use URL inspection to request indexing for: home, `arron.html`,
      `crisis.html`, `journal-vault.html`, `insane-radio.html`, `shop.html`,
      `prints.html`, `ps-studio.html`, `creator.html`, `about.html`.
- [ ] Review Coverage, Enhancements and Core Web Vitals monthly; fix listed
      mobile-usability or mobile-page-speed issues in Phase 2.

### Google Business Profile (local Leicester trust signal)
- [ ] Complete profile with consistent name, locality and category
      (community/nonprofit support profile; avoid medical-claim wording).
- [ ] Finish verification: phone `07711 147666` (instant where offered) or
      email `creator@pleadingsanity.co.uk`.
- [ ] Add service list, hours, original photos (artwork and workshop), and a
      weekly post linking a real page; respond to questions publicly where safe.

### Bing and other surfaces
- [ ] Bing Webmaster Tools: import the GSC property or verify separately;
      submit the same sitemap.
- [ ] Keep profile URLs consistent across YouTube, TikTok, Instagram and any
      directory listed in the `sameAs` schema; broken profiles weaken trust.

### Responsible external growth
- List with genuine UK mental-health community/directory resources and local
  Leicester groups where the site fits; no paid-link exchanges or scraped
  directories.
- Encourage natural shares from the community feed and radio embeds; avoid
  automated comment or forum spam.
- Any AI-generated music or video must use the platform synthetic-content
  disclosure and link back to real, stable pages.

## 5. Measurement and review

Baseline queries to record before changes: branded `Pleading Sanity`,
`Pleading Sanity Leicester`, `P.S Studio Plastic Shane`, `free Arron AI
sanctuary`; then monthly GSC report on impressions, clicks, average position,
and indexed-page count. Prioritise branded and long-tail helpful queries first;
do not chase high-volume medical terms the site cannot responsibly serve.

## 6. Guardrails

- No cloaking, hidden text, keyword stuffing, doorway pages or mass generated
  thin pages.
- Crisis and help pages never carry tracking-heavy scripts or commercial popups.
- Revenue pages stay clearly separate from support pages; no paywall on Arron,
  journal, feed, games or crisis help.
- Every change remains branch-based with tests green; production main changes
  only on the owner's explicit merge phrase.
