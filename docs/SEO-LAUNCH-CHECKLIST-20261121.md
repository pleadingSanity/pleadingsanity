# SEO / Growth Launch Checklist (2026-11-21)

Supports the Power For Our People UK community push and organic visibility of
`pleadingsanity.co.uk`. Honest baseline: tags widen a post's reach; they do not
manufacture followers. Growth comes from owned profiles, indexable good content,
genuine engagement, and the channels below.

## 1. Owner-gated — Shane action required (agent has no dashboard access)

1. **Google Business Profile.** Verify via phone `07711 147666` (instant option)
   or email `creator@pleadingsanity.co.uk`. Category: community / mental-health
   support; cover Leicester; add contact button and opening hours.
2. **Google Search Console.** Add `https://www.pleadingsanity.co.uk/`, verify
   DNS/HTML file, submit `sitemap.xml`, review Coverage and Enhancements monthly.
3. **Defensive domain.** Decide on registering `pleadsanity.co.uk` (typo defence).
4. **Social profiles.** Keep the existing Facebook presence; complete profiles on
   Instagram, TikTok and YouTube Shorts with consistent name, bio line, and a
   link back to the site.

## 2. Site-side ready work (additive PRs; no merge without Shane's exact phrase)

- Social tags: `ps-studio.html` OG/Twitter added in #376; next, audit home,
  community, music-creator and shop pages for missing OG/Twitter cards.
- Sitemap discipline: keep only indexable public pages. `poker.html` stays
  excluded (Netlify `X-Robots-Tag: noindex`); private/app/noindex pages never
  added.
- Internal links: descriptive footer/nav cross-links between Community, Music,
  Arron, Shop and About; avoid generic "click here" anchors.
- Image pipeline (Phase 2): WebP/AVIF with `srcset`; review largest assets first
  (`assets/images/r2-2026/hero-cosmic.jpeg` ~1.28 MB; `images/radio/cover-bass.jpg`
  ~981 KB); strip EXIF from public-facing personal photos.
- Performance: defer non-critical JavaScript; check render-blocking CSS before
  Phase 2 image work.
- Future `/power-for-our-people.html`: use the tag kit in PR #379; switch from
  `noindex` to `index, follow` only at launch; add to `sitemap.xml` afterwards.

## 3. Content cadence

- 3–5 posts per week: one short video (Reels/TikTok/Shorts), one community
  question, one music clip, one sanctuary update.
- Reply to comments in the first hour when possible; the algorithm and the
  community both reward early engagement.
- Hashtags: rotate the grouped kit from PR #379 (15–25 per post); mix broad and
  niche tags; avoid tag-stuffing and platform-banned terms.

## 4. Measurement

- Baseline (audit in PR #375): 89 root HTML pages; sitemap 65 valid entries;
  title and description present across pages; home carries Organization and
  WebSite JSON-LD.
- Track monthly: Search Console clicks/impressions; per-platform follower count;
  site referral traffic. Report trends, not vanity promises.

## 5. Copy guardrails

- Keep public copy peaceful and factual; separate what is known, believed,
  suspected, and still being learned (editorial log in PR #379).
- Include crisis footer lines where natural: Samaritans 116 123 (UK, 24/7);
  Shout text 85258; site Crisis section.
- Sanctuary stays free, ad-free and separate from commercial customer data.
