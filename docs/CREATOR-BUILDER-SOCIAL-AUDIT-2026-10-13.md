# Pleading Sanity — Creator, Builder and Social Content Audit

Verified source review: 2026-10-13. Baseline main at start of audit: `c8369d239620871106c61dc00431248449a1651f`; always recheck the current SHA.

## Real functionality found

- `/builder.html`: browser-local owner planning workspace with notes, checklists, export/import and a copyable multi-AI handoff. URL is public; do not place credentials, private member information or secrets there. Not an AI agent or authenticated admin app. Search indexing discouraged with noindex.
- `/site-builder.html`: public browser-side improvement-brief generator with niche selector, notes and generated prompt. It does **not** fetch, scan, rewrite, test or deploy a third-party website. Free, no active trial/paywall or payment service.
- `/creator.html`: creator status dashboard and verified owner stats when authenticated. Linked to `/live.html`, social profile/feed and existing creative pages. Current 90% offer is proposed; no verified payouts.
- `/live.html`: public YouTube/Twitch embed-preview URL, signed-in post submission to the community feed, device-local scheduled/replay lists and planning controls. Latest targeted fix clarified that chat is local-only, forbids unsafe replay URLs, protects stored text against HTML injection, and generates Twitch parent from the current domain. **No native broadcast, multistream, synchronized viewer chat or automatic video clipping** is implemented.
- `/ai-studio.html`: create/battle/podcast/wall UI with `js/ai-studio.js`; successful authenticated and AI-generation flows remain unverified.
- Artwork: the static GitHub tree contains 427 tracked files including around 110 raster/vector assets. Source references on homepage, Builder, Creator, Live, Games, Journal and Kids pages were reviewed; available showcase and space assets are real repo files. This is not a successful network image-load or visual-browser test.

## Social history collection status

- Public Instagram, TikTok, Facebook, LinkedIn and YouTube links by themselves do not authorise or expose complete historical posts, stories, comments, insights or private content. Full archive analysis cannot be honestly claimed from public search snippets.
- Metricool integration is connected in ChatGPT but its account **has no social networks connected** yet (connector reported brand blog ID 7408654 and setup URL `https://app.metricool.com/brands/connections?blogId=7408654`). The owner must connect suitable accounts to permit available analytics. Existing Metricool connector can retrieve analytics and scheduled posts, **not necessarily every historical published post or full media archive**.
- Request official account exports or authorised platform APIs for complete past-post recovery when needed. Never scrape private accounts, impersonate the founder or publish imported content without consent.
- Once source archives are available: deduplicate crossposts; map post date/platform/URL/actual text/media, topics, engagement where available, rights and source credibility; extract grounded recurring founder themes; separate personal stories from independently verified historical facts; prepare a reviewable content map for About, Resilience Wall, Kids, AI Family, Creator Hub and product pages. Do not expose sensitive third-party identities or private messages.

## Remaining production work and owner decisions

1. Owner: connect social networks to Metricool, or provide official account exports. Public-link-only analysis is incomplete; do not claim every post audited.
2. Claude: run actual browser/mobile tests for Sane Builder, public Site Builder, signed-in creator profile, feed-sharing, livestream preview on Netlify and independent Vercel fallback; add regression tests.
3. Claude/Gemini: prioritise image authorisation, content moderation, and authenticated creator flows. Any real social OAuth imports require consent, supported scopes, account linking, token protection, deletion and service review.
4. Creator earnings: legal/finance review and tested payout infrastructure before any 90% payments or revenue claims.
5. Video: native broadcasting, multistream and post-live one-minute clipping need video infrastructure and may incur costs; **default authorised additional spending £0**, so do not activate any paid services.
6. All agents: avoid duplicate pages, new repos, random images, broad social-link spam, unreviewed mass merges or automatic messaging to users. Preserve all approved crying-brain imagery.

## This audit's targeted verified source changes

- `live.html` commit `5e6cec9`: correct public/private state labels; HTTPS validation; DOM-safe locally stored event and chat text; domain-correct Twitch embed parameter; signed-in post submission and existing route kept intact.
- `builder.html` commit `4063062`: noindex meta only. A concurrent agent independently improved browser-local checklist, import/export, honesty and public Site Builder. Its code should receive a separate regression test before claiming full production readiness.

**Status:** Source audit and targeted fixes complete; authenticated end-to-end tests, all-post social content audit and cross-domain mirror parity unverified. No new paid service activated.
