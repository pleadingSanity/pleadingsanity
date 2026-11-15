# Joined-up sanctuary audit — initial production review (2026-11-04)

## Scope and evidence
Read current production main files: `AI_HANDOFF.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `system_blueprint.json`, `netlify.toml`, `index.html`, `app.html`, `arron.html`, `journal-vault.html`, `games.html`, `creator.html`, `support.html`, `crisis.html`. This is a source review of eight representative pages, NOT an exhaustive audit of every HTML page or a live browser regression test.

## Confirmed findings
- Existing homepage, App Hub, Arron, Journal Vault, Games, Creator, Support and Crisis HTML pages are present.
- All eight inspected page sources include Samaritans 116 123 somewhere; this does NOT prove every crisis contact is visible or accessible in every UI state.
- The homepage links to many features and has 71 href attributes; App Hub 74; Games 133. These counts include repeated and non-navigation links, so they are indicators of information architecture complexity, not a defect count.
- Homepage currently loads `/js/ps-music.js` (optional embedded music) but NOT `/js/music-player.js`. The `data-ps-music` container has empty playlist/link attributes, so the optional player has nothing to show unless configured. Do not claim the homepage's five-song music player is visible based solely on PR #208.
- `arron.html` does not load `/js/music-player.js`; `journal-vault.html`, `support.html`, and `crisis.html` did load it. This PR removes those script tags only to protect quiet/sensitive user journeys.
- `games.html` and `creator.html` still load `/js/music-player.js`. Whether this is appropriate should be decided after visitor preference testing.
- `app.html` exists as the App Hub; do not invent an `app-hub.html` route.
- The AI Studio prototype `pleadingSanity/Ps` is a separate React/Vite project, not production. Its collaboration handover is `AI_COLLABORATION_HANDOFF.md`. Do not migrate its architecture into production.

## Integration roadmap — verified work versus proposals
1. **Now in this PR:** remove optional background music scripts from Journal Vault, Support and Crisis. No changes to form logic, auth, storage, crisis copy or navigation.
2. **Next audit:** inspect every linked route and local asset with a reproducible link checker; distinguish redirects from 404s.
3. **Mobile navigation:** test 360px, 390px, 768px and desktop, including focus management, contrast, touch targets and back navigation.
4. **Visitor journeys:** test homepage→Arron→support; homepage→Journal Vault→save/reopen/private mode; homepage→Games→launch; homepage→App Hub→PWA install; creator and solar flows. Do not touch sensitive live user data.
5. **Feature inventory:** label each page live, prototype, informational or planned; never claim working backend solely because an HTML link exists.
6. **Music:** confirm where the optional player is actually wired; test consent and no network request before deliberate Play, keyboard controls, mobile autoplay rules and media rights.
7. **SEO:** inspect real per-page canonical, title, description, Open Graph, robots, sitemap and structured data; avoid duplicating prototype query-section URLs.
8. **Privacy/safety:** review actual analytics/network behaviour, Firebase permissions, Arron companion boundaries, offline crisis access and emergency link visibility.
9. **Visual design:** unify official Crying Brain identity, cosmic theme, navigation labels, card rhythm and page hierarchy without rewriting working features.
10. **Release:** require automated tests plus representative browser regression, and verify deployed Netlify commit before saying live.

## Blockers and release guardrails
- Automated tests and live mobile browser tests were NOT executed in this review.
- Do not merge a broad speculative rewrite, copy the prototype wholesale, or touch protected PR #92.
- Before merging this PR, verify that no other scripts depend on the removed music player on the three sensitive pages.
- Current Netlify state can change; compare deploy SHA against production main at release time.
- Founder mission: Rise From Madness; Evolution, Not Erasure; Connect The Survivors. Free mental-health core and UK crisis support must remain intact.
