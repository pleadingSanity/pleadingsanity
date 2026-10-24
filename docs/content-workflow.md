# Content System — Weekly Editorial Workflow
**Status:** DRAFT workflow · Not automated · Review required before any public use

## Weekly cycle
1. **Monday — Collect:** Pull 2–3 seeds from `docs/creative-content-pack.md` or new prompts. Label source (house story / AI family / founder-approved).
2. **Tuesday — Draft:** Expand into short posts, challenge prompts, or educational notes. Keep language plain. No fabricated testimonials.
3. **Wednesday — Review:** Check against house rules: safety numbers visible where relevant, no medical claims, no private data, Evolution Not Erasure. Owner or designated reviewer signs off.
4. **Thursday — Polish:** Add accessibility notes, alt text if visual, and clear “Created with the AI family” label if AI-assisted.
5. **Friday — Queue:** Place approved pieces in a review folder or content calendar. No auto-post.
6. **Weekend — Rest:** No pressure. Silence is allowed.

## Rules
- Never auto-publish to the feed or message members.
- Never present AI lines as real member stories.
- Founder personal stories require explicit approval.
- Crisis content always points to Samaritans 116 123 and SHOUT 85258 first.
- Kids content stays in the kids area.

## Rap Studio note
Existing `/rap.html` already supports Create / Buff / Battle. Improvements (fair judging criteria, clear Human / AI / Together labels, moderation notes) can be added as UI copy without changing the working flow. No new competition with prizes until terms are written and approved.

## Social / bio spec (design only)
Optional, consent-based:
- User supplies text or authorised public links only.
- Preview before any save.
- Editable bio types: Realistic, Reflective, Inspirational, Professional.
- Delete anytime. Export available.
- No private scraping. No invented memories.
- Separate from journal and mental-health notes.

**Implementation:** Claude/GPT to build the form and storage once design is agreed. Not live.

## £0 brand-search plan — 24 October 2026

Goal: make **Pleading Sanity — free mental health sanctuary** unambiguous. A third-party score is not a Google metric. No ranking, traffic or indexing deadline is promised. Search results retrieved on 24 October already included the sanctuary homepage and multiple feature pages; the FameHero campaign could not be independently opened. The screenshots establish what its report says, not the actual Google ranking for every visitor.

### First week
- Keep the homepage title `Pleading Sanity — Free Mental Health Sanctuary`. Use that identity naturally in visible copy, the About page and social bios. Other pages get specific titles, such as `Arron — Free AI Companion | Pleading Sanity`, rather than repeating the whole homepage title everywhere.
- Use the existing Organization and WebSite schema. Keep founder personal profiles under the founder; brand links under the organization. No clinic, charity registration, therapy qualification, review count or award invented.
- In free Google Search Console, verify the canonical `.co.uk` property, submit `https://pleadingsanity.co.uk/sitemap.xml`, and inspect home, About, Arron and Games. Request indexing once after release. The owner must complete any account/ownership verification. Do not add random verification tokens to code or assume Search Console access exists.
- Retain `.uk` as the independent backup. Check its existing cross-domain canonical signals to `.co.uk`; do not redirect, delete or rebuild the backup merely for SEO. Search Console can show Google's selected canonical.
- Update existing brand bios to describe the free sanctuary and link to `.co.uk`. This plan does not authorize posting or changing social accounts automatically. Ask relevant community organisations or people who already know the work to link to the useful sanctuary page, without buying links or mass-messaging.

### Content we can write ourselves
Publish one useful piece at a comfortable pace in existing Wisdom/Stories, with a clear author, honest date, relevant internal links and plain source attribution. Use lived experience for personal pieces; cite reliable sources for factual health claims. Do not invent member testimony or imply clinical treatment.

1. **What is Pleading Sanity? A free mental health sanctuary** — what is free, who it is for, what it can and cannot do.
2. **Why Shane Cooper built Pleading Sanity** — a founder-approved account, without adding private or unverified details.
3. **Meet Arron, the Pleading Sanity AI companion** — useful examples, memory controls and why an AI companion is not a therapist.
4. **Your first five minutes at Pleading Sanity** — a simple tour of talk, journal, games and support.
5. **A journal prompt for a heavy day — from Pleading Sanity** — one optional exercise; link to the existing private journal.
6. **Calm games without the pressure to win** — explain three real games and give readers permission to stop.
7. **No ads and no data selling: our Pleading Sanity promise** — explain the actual privacy policy, costs and optional merch honestly.
8. **Rise From Madness: what Evolution, Not Erasure means** — explain the movement in the founder's own words.

Use the brand where natural; do not cram it into every sentence or write repeated articles targeting legal terms. Do not create thin doorway pages or an automated volume of generic AI posts. Publish the first explainer before expanding the list.

### Description and image rules
Home description: `Pleading Sanity is a free mental health sanctuary with Arron AI, private journaling and calm games. Built from lived experience. No ads or data selling.`
Each page gets a different accurate summary. Google may choose different title/snippet text; a description is a suggestion. Do not stuff courtroom/insanity-defence keywords into metadata to deny them.

Alt text describes the actual image and its purpose, not every service: `Pleading Sanity crying brain logo` for a standalone logo; `Ollie the Owl holding glowing cards` only if that is what the image shows. If an image only decorates a card whose adjacent text already names the destination, keep `alt=""`. Do not replace decorative alt with SEO keywords or add unverified health benefits.

### Free measurement, not a score chase
In Search Console, compare branded queries (`Pleading Sanity`, `pleadingsanity`, `Pleading Sanity sanctuary`) over 28-day periods: impressions, clicks, CTR and landing pages. Inspect coverage and Google's chosen canonical. Allow time for recrawling; it can take days to weeks and ranking improvement is not guaranteed. If the brand already ranks first for an exact query, focus on useful snippets and clicks, not fabricated claims of a ranking recovery.

Primary references:
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
