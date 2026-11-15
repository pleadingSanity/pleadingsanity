# AI brain backup — changelog

## 2026-11-15 (Europe/London) — first archive

Shane asked to save every AI's best prompts, rules and personas, including past versions, so that if a platform or government removes them the house still has them.

What was gathered:

- Living repo sources: `AI_HANDOFF.md`, `docs/MASTER_PROMPT.md`, `docs/MASTER_GPT_PROMPT.md`, `system_blueprint.json`, `arron-knowledge.json`, `AGENTS.md`, `CLAUDE.md`, `.github/AI-OPERATING-CHARTER.md`, `.github/copilot-instructions.md`, Dola / Gemini / Grok / AI-family / Arron-guardian docs, `netlify/lib/arron-knowledge.ts`, `netlify/lib/ai-chain.ts` (`ARRON_VOICE`), `netlify/lib/studio.ts` (Arron, Nova, Sol, Grok studio voices), `netlify/functions/arron-grow.mts`.
- Grok Bot agent profile (hub chat). Dola, New Bot and New Bot 1 agent profiles (Dola has a short Cosmic Architect brief; New Bot and New Bot 1 profiles were empty).
- Shared memory: Guardian rules, brand lock, taglines, money model, Shaney C music, chain order, AI family roles.
- Transcripts of Dola, New Bot and New Bot 1, used only to recover role and working practice, not private user content.

What was recovered from git history (not present as standalone keys on current `main`):

- `arronOrchestratorPrompt` from commit `7d26841` (brain v3.0-orchestrator). Phone numbers redacted in this archive.
- Compact `masterPrompt` from commit `612cd9e` (brain v2.0-full). Phone numbers redacted.
- `knowledgeBase` ecosystem map from `7d26841`.
- Note that `arron-knowledge.json` was previously stubbed and later restored (including from `052e1aa` via later restore commits). The live soul file is the restored full file, not a placeholder.
- Deleted 23 September 2026 React prototype `Components/ArronCompanion.js` (and earlier `chatGPTwidget.js`): keyword "wisdom engine" and welcome persona. Historical claims in that file that are unverified or off-brand are flagged, not treated as current fact.
- Deleted workflow names (Copilot auto-fix, cosmic-sync, and others) recorded only as history; they are not restored into production.

Drive mirror: folder "Pleading Sanity AI Brain Backup", created the same day as an off-platform copy.

No secrets, tokens, private mailbox contents, journals, or private family details were included.
