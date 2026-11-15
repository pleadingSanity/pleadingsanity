# AI Studio integration review — 2026-11-04

Canonical production remains this repository and the existing Netlify deployment. The AI Studio prototype is https://github.com/pleadingSanity/Ps, not a replacement deployment.

A collaboration contract has been committed to the prototype at `AI_COLLABORATION_HANDOFF.md` (commit `351ba9c`). It instructs Gemini to read this repository's `AI_HANDOFF.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md`, `system_blueprint.json`, current main, CI, PRs and deploy status before proposing focused production PRs.

Reviewed prototype candidates:
- `src/components/HomepageMusicPlayer.tsx`: browser-generated audio, starts OFF and defaults to 15%. Reuse patterns only; do not copy React into static production, and do not make medical claims about 432/528 Hz.
- `src/components/ConsentBanner.tsx`: potential consent UI ideas; verify actual analytics gating and withdrawal.
- `src/utils/seoAndShare.ts`: page-specific metadata ideas; production has real HTML routes, not prototype `?section=` URLs.
- `src/components/AuditPanel.tsx`: avoid copying hardcoded statuses as if they were live.
- `tests/verify-sanctuary-136.test.mjs`: primarily file/config assertions, not full browser coverage.

Current music PR #208:
- Delay hidden YouTube iframe creation until deliberate player interaction.
- Remove page-wide auto-unmute.
- Preserve existing homepage UI.
- Still requires browser validation, media rights review and a third-party privacy decision before merge.
- Existing source uses `autoplay=1` inside an iframe that is created only after explicit user interaction. Verify that it behaves correctly on mobile and does not start unexpectedly after pause.
- Check that track changes while paused do not unexpectedly resume playback, and that state and accessible labels stay accurate.

Release gate: do not merge until required CI and real-browser playback, mobile, accessibility and consent tests pass. Never deploy the prototype over production.
