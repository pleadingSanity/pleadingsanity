# Pleading Sanity — Continuous Evolution Roadmap

**Owner:** Shane Cooper. **Status:** proposal, not proof of implementation. **Production:** https://pleadingsanity.co.uk. **Repository:** pleadingSanity/pleadingsanity.

## North star
A free, welcoming sanctuary with clear ways to talk, play, listen, write, connect, seek help, and support the movement. Keep **Rise From Madness**, **Evolution, Not Erasure**, **Connect The Survivors**. Strengthen what exists rather than rebuilding or duplicating it.

## Non-negotiable release gates
1. Read `AGENTS.md`, `AI_HANDOFF.md`, `docs/MASTER_PROMPT.md` and affected source before editing. Never overwrite the soul/knowledge files or touch protected PR #92.
2. One reversible branch per coherent change; no automatic merging, spending, database migrations, DNS, provider changes or unreviewed production deploys.
3. Preserve free mental-health essentials; visible crisis links (Samaritans 116 123, Shout 85258, NHS 111, emergency 999), Arron companion-not-therapist boundary, consent and private journal protections.
4. Protect official crying-brain branding, radio artists/music rotation, original games, apparel factory specs, and existing Netlify/Firebase/GitHub infrastructure.
5. Require evidence: tests, accessibility checks, mobile 320/390px, broken links, security/privacy checks, relevant end-to-end smoke test, deployment SHA and rollback.
6. Never claim connected AI agents, background work, medical outcomes, revenue, accessibility compliance, uptime or deployed features without direct verification.

## Delivery tracks (ordered by user impact and risk)

### P0 — Safety, trust and reliability
- Audit Arron API authorization, provider timeouts/fallbacks, rate limits, user-memory deletion and crisis escalation without sending sensitive production prompts. No second Arron or change to GPT → Claude → Gemini → Grok order.
- Audit journal access boundaries, Firebase rules, authentication, creator uploads, payments and secrets exposure. Any finding needs a reproducible test and minimal patch.
- Make build/deploy SHA verification and service-worker cache version checks routine. Avoid duplicate Netlify builds and broken offline crisis routes.
- Track real CI failures and fix root causes; distinguish static code checks from production/browser checks.

### P1 — Discovery and accessibility
- Consistent search and navigation across the home, app, games, radio, journal, shop and creator areas. Search only public routes; never index personal data.
- Mobile-first responsive testing, visible focus states, semantic labels, contrast and reduced-motion/audio preferences. Do not autoplay music.
- Clear visitor journeys: “Talk”, “Play”, “Listen”, “Write”, “Connect”, “Get Help”. Keep urgent support reachable without sign-in.
- Add descriptive, original page summaries and structured metadata only when accurate; avoid keyword stuffing or invented testimonials.

### P2 — Make existing experiences excellent
- **Insane Radio:** clearly featured, reliable play/pause, artist attribution and rights, understandable empty/loading states, no unexpected audio.
- **Games:** test every real game, keyboard/touch controls, save/reset and mobile layouts. No fabricated scoreboards or gambling claims.
- **Arron and Journal:** calm UX, understandable privacy settings, offline/error recovery, accessible controls and user-owned data.
- **Creator/Live:** validate actual supported live/share flows and moderation before marketing as fully live; never promise unimplemented monetization.
- **Kids:** accessible, age-appropriate experiences and privacy-by-default; review content and safety before publishing.
- **Clothing:** premium quiet-luxury descriptions faithful to locked PS-H01, PS-J01, PS-M01, PS-L01 and PS-B01 factory measurements and imagery; label previews honestly. No unapproved manufacturing changes.
- **Insane Solar / AI Office:** verify all calculators, savings and VAT/SEG/G98/G99 claims against dated primary sources; never imply certification or paperwork completion without proof.

### P3 — Responsible growth
- Improve discoverability, sitemap/canonical/structured data, share previews, editorial stories and founder voice; validate public claims and avoid personal-health SEO exploitation.
- Establish opt-in creator contribution and genuine community moderation; no data sale, hidden tracking or paywall on sanctuary essentials.
- Measure outcomes using privacy-respecting, user-approved methods only; no new analytics vendor by default.

## Proposed quality scorecard (not yet measured)
| Area | Evidence to collect | Release blocker |
| --- | --- | --- |
| Navigation | All indexed links exist; search test suite passes | Broken primary destinations |
| Safety | Crisis routes reachable; Arron boundaries and auth tested | Missing crisis access or private-data leak |
| Accessibility | 320/390px, keyboard, contrast, reduced motion | Blocked navigation or inaccessible urgent help |
| Radio & Games | Real-device smoke tests, no surprise autoplay | Broken core play controls |
| Production | GitHub SHA equals Netlify published SHA; offline smoke | Wrong/stale deployment or unsafe rollback |
| Content | Correct product specs, rights, dates, pricing and claims | Fabricated or conflicting claims |

## Operating cadence
- On each change: automated tests + audit + PR evidence. On merge: deployment and smoke verification.
- Weekly: review actionable failures, broken links, user-reported friction and a small improvement backlog.
- Monthly: owner-approved audit of safety, privacy, accessibility, content freshness, SEO and operational costs.
- Never equate a scheduled audit with permission to change production; humans approve risky changes.

## Immediate engineering actions
1. Run `npm test`, `npm run test:discovery`, and `npm run audit:site` in CI/local checkout; investigate failures rather than deleting tests.
2. Validate all indexed search routes and homepage featured radio card on real mobile devices.
3. Record confirmed defects as small PRs with before/after evidence; ship highest-impact fixes first.
