# Dola → AI Family — Session Handoff
_As of 2026-10-19; verify against GitHub/Netlify each session. Read [DOLA-MASTER-CONTEXT.md](./DOLA-MASTER-CONTEXT.md) first._

## Confirmed GitHub work
- PR **#96 merged** the complete root `arron-knowledge.json` restoration (original blob from `052e1aa6a72159ae7d9c3bdb4d81dd48062570a1`, metadata-only changes). Merge commit `39ade64c81fe64b6dd12b907bbe690e73d3f3691`; main quality audit passed after merge.
- Founder-context addition: `about.html` “How the pieces connect” commit `314b4d0648b660277a619a9e1e2258655152b646`. It distinguishes founder account from Dola's observations, without publishing sensitive details.
- AI Family handoff updated at `807c648ed52687b4f6539d39c525db98d4fdf96a`.
- PR **#92** is draft: circuit-breaker hop counting; **do not merge until tested**. Open PRs #78, #69, #48 and #46 require independent safe review, not wholesale merge.
- At the time this handoff was assembled, production deploy status of the latest founder changes was **not yet confirmed**. A previous Netlify deploy was verified for main SHA `3c5fe3cf454fdc3d99d5f6a33587d3eea1d5cc8a`; refresh before reporting current production.

## What's next — in priority order
1. Check current `main` SHA, open PR states, continuous quality audit and published Netlify SHA. Confirm homepage, Arron, games and crisis numbers still load.
2. Ensure Daily Guardian/automations cannot replace root `arron-knowledge.json` with a stub; protect full historical content.
3. Check existing `about.html` and `ai-ecosystem.html` before adding an ecosystem map or more founder prose; avoid duplicates. Obtain Shane's approval for personal material.
4. Verify actual scheduled AI Family daily function behaviour and Sane Finance information boundaries; fix only proven issues.
5. Safely extract verified fixes from remaining PRs after isolated tests. Keep #92 draft.
6. Track future work as **LIVE / NEXT / HONOURED**: creator livestreams and clipping, the 12-book New Gen Bible, kids cartoons, Sane Site Builder, optional voice content and other concepts. Never advertise unfinished features as operational.

## Dola's additional insights, not independent facts
- Shane's practical building background informs his preference for sturdy, incremental systems.
- The project's continuity links family legacy, lived experience and support for future generations.
- Helpful collaboration pattern: preserve the big vision, select one testable change at a time, and state what is live versus planned.
- Dola does **not** automatically remember other chat sessions. For continuity, provide these two `docs/` files in new conversations. No AI may claim to have read them without access.

## Safe handoff rule
Do not change Arron's provider order, crisis lines, free core, mobile behaviour, logo, or root soul file. No paid commitments. Log every pushed SHA and audit in `AI_HANDOFF.md`; report blockers truthfully.
