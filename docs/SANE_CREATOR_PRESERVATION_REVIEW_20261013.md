# Sane Creator integration and preservation review — 13 October 2026

Canonical repository: pleadingSanity/pleadingsanity
Founder: Shane Cooper · @mentally.inshane
Principle: Evolution, Not Erasure.

## Source material examined
- Existing main branch: creator.html, ai-studio.html, AGENTS.md.
- Supplied prototype: pleading_sanity_production_platform.html (standalone cosmic HTML experience).
- Supplied Sanctuary Notes manager: ai_studio_code.js.
- Supplied Gemini-to-Claude handoff: claude_handoff_prompt.md.
- Related AI Studio React repository: pleadingSanity/pleadingSanity-pleadingsanity.

## Confirmed and important distinctions
- creator.html and ai-studio.html ALREADY exist on main; do not overwrite or duplicate them.
- The prototype contains cosmic styling, a Hub, media studio, games, breathing, rap, journal, chat and a site-bot. These are candidates for component-level extraction, NOT evidence of live integration.
- Prototype site-bot and media publishing include simulated success text. Never promise that content was published without an actual authorized API response.
- The standalone notes manager uses localStorage and imports Firebase variables it does not use. Its Google Keep deep link does not guarantee note creation, and interpolated note HTML requires XSS hardening.
- The handoff explicitly says keep production auth boundary intact and Firebase in the secondary React/Vite application until a separately approved migration.
- The handoff asks for server-side Gemini fallback and consent-first analytics. Verify existing production implementation before editing or installing dependencies.

## Safe integration order
1. Inventory and compare every existing main route and React app module; mark Working, Needs Polish, Broken, Incomplete, or Missing based on tests.
2. Fix private image access and any critical authorization/privacy issue first.
3. Consolidate NAVIGATION (not URLs) into Sanctuary, Connect, Create, Games, Learn, Shop, Support; keep old routes and redirects.
4. Bring over only missing creator capabilities into existing creator.html, ai-studio.html, live.html and relevant scripts. Preserve original crying-brain logo and current theme assets; use the prototype as visual reference only.
5. Improve Sane Creator AI content generation with consent, provenance, human approval before posting, rate limits and clear cost controls. Distinguish simulated generation from working services.
6. Preserve original games, add per-game smoke tests and regression checks rather than swapping engines without proof.
7. Stage, test in real mobile and desktop browsers, inspect CI and preview; merge only reviewed, passing, reversible changes. Verify production and independent backup after deploy.

## Release gate
No production deployment from this documentation change. No Firebase migration, payment changes, user-data publication, main branch push or untested merges. Existing site remains the source of truth.

## Agents
Share this file with GPT, Claude, Gemini, Grok and Copilot through GitHub. Do not claim they have read it until confirmed.
