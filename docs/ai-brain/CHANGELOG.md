# AI brain backup — changelog

## 2026-11-23 (Europe/London) — weekly refresh

Diffed `docs/ai-brain/` (created in `a782944`, 15 November 2026) against `main` `ae56375` (22 November 2026). Nothing was deleted. Older lines that are no longer current are marked "superseded on <date>" and left in place.

Unchanged, so not recopied: `docs/MASTER_PROMPT.md`, `docs/MASTER_GPT_PROMPT.md`, `arron-knowledge.json`, `AGENTS.md`, `CLAUDE.md`, `.github/AI-OPERATING-CHARTER.md`, `.github/copilot-instructions.md`, `netlify/lib/arron-knowledge.ts`, `netlify/lib/ai-chain.ts`, `netlify/lib/studio.ts`. No new persona file. `docs/AI-CREDITS-FUND.md` is absent; the fund rule below is founder memory only.

### shared-rules.md

- Crisis placement: superseded on 2026-11-18 for position only (founder memory). Numbers may sit in a sticky footer or at the bottom. They stay exact and tappable and are never removed. Safety stays locked, crisis redirect first. Soul file and issue #92 stay untouched.
- 99p status: superseded on 2026-11-15 (late). Built in `02433a5`; badge-only Identity role `supporter`. Morning "not built" line kept as history. Blueprint `moneyModel.status` updated in that commit.
- AI credits fund (founder memory, 23 November): half of the 10% platform cut on print sales, ledger, monthly move, per-provider top-up with a monthly cap. Not a live ledger.
- Merge rule: superseded on 2026-11-20. Site and asset work is a Dola draft pull request. No merge to `main` without Shane's exact approval phrase. Confirmed in `docs/MASTER-UPGRADE-BLUEPRINT.md` (`d6e8ac5`), `docs/PHASE1A-ORBITAL-NOTES.md` (`30687da`) and `docs/SEO-LAUNCH-CHECKLIST-20261121.md` (`bd4913d`). Coordination via issue #232 and `AI_HANDOFF.md`.
- One house: no Shopify migration; no extra Netlify, Vercel or grok.me site. Legallyinsane scaffold (`488ce7a`, `d6e8ac5`) recorded as parked, not a second house. Repo sweep (`488ce7a`) recorded as "do not delete archived repos from this archive".
- Insane Solar: roof-blokes-only, no sales layer (founder memory). Deposit client id from env (`ced20fd`). Sanity Law stays a separate brand.
- Imagery: premium, not stock; never overwrite source art (`d7e51d8`, `85e156f`).
- Related brands: Aura Hz (sound wellness, sessions, adaptive cognitive hardware); The Techi Verse (in development, no route on this commit).
- Music: Shaney C name superseded on 2026-11-16 by Pleading Socially. Style superseded on 2026-11-18 (124–128 BPM Clubland / UK garage) and broadened on 2026-11-19 (UK grime, deep house, tech house, dance, hip-hop bounce). Own voice, cleaned and tuned. Local RVC/Applio and RouteNote free plan. Playlists "Pleading Socially – Shane's Voice" and "P.S AI Playlist". "Breaking Free" at 126 BPM, in progress. Founder memory. Studio files on `ae56375` still say Shaney C; this refresh does not rename them.
- Prints: Flashforge AD5X (founder memory: arrived 16 November; repo confirms the printer in `aeb915c`, `3cef91d`, `bd4913d`). £2 decorative 14+ keyrings (Halloween, snowman, original hero). Toys stay draft. No trademarked characters. No printer network secrets in git. Rules from `b075b7d` and the 3D-print docs.
- Working practices: creations keys isolated from Arron (`e3eccac`); private mailboxes redacted in the handoff (`aeb915c`); `binary-src` materialize path (`fecb2b2`); test gates; blueprint ethics; SEO honesty (`6f34ce5`, `bd4913d`); orbital Phase 1A only (`30687da`).
- Taglines, healing tones, chain order and the free-sanctuary rule were already here and were not duplicated.

### Per file

- `README.md` — pointer to the new living docs and to this refresh. Drive mirror not updated from this session.
- `arron.md` — 99p must not gate basic chat; crisis placement; soul file and #92; creations-key isolation; blueprint Phase 3 is not live. Persona files unchanged.
- `grok-bot.md` — artist-name and style lines marked superseded; 20 November lane (no site/asset merge); image-prompt lock; Pleading Socially pointer. Chain file unchanged.
- `dola.md` — draft-PR-only for site and asset work; no second house; home palette and orbital Phase 1A; printer secrets.
- `gpt.md` — stale "not built" header versus blueprint; credits fund is not live accounting; phrase gate; do not treat the lab spec or a slicer screenshot as done.
- `claude.md` — blueprint durable rules and secret-scan list; phrase gate; print and catalogue test gates; SDK-bump recheck; music pages missing literal `999` recorded as a gap.
- `gemini.md` — honest SEO wording, sitemap discipline, Calmer View, no purple casts. No new persona. Context docs were not in the diff.
- `copilot.md` — 2–3 November merge grant marked superseded on 2026-11-20; printer template; no live toy without compliance; image derivatives. Instruction files unchanged.
- `new-bot.md` and `new-bot-1.md` — profiles still empty. Both now point at the 20 November phrase gate and the shared-rules update.
- `AI_HANDOFF.md` — one dated pointer at the end. The morning 15 November "99p not built" header was not rewritten.

No secrets, tokens, private mailboxes, journals, phone numbers beyond the public crisis lines, or third-party personal data were copied in.

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
