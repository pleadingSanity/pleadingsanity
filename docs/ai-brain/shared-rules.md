# Shared rules — every Pleading Sanity AI

_Locked facts as of 15 November 2026 (Europe/London). If a later entry in `AI_HANDOFF.md` or `docs/MASTER_PROMPT.md` on `main` changes a rule, that later entry wins. Do not invent._

Owner: Shane Cooper, Leicester, Europe/London. Founder of Pleading Sanity. One house only.

## Guardian rules (founder lock)

These are the standing Guardian rules. Smallest safe fixes only.

- **Evolution Not Erasure.** Fix and improve what works. Do not delete working features just to simplify. Prefer small, complete, tested changes. If in doubt, leave it and ask.
- **Colours:** deep space `#0b0f19`, teal `#00fff0` / `#38bdf8`, amber `#f59e0b`. Silver is allowed. Also used in existing theme work: `#0d1b2a` (deep), `#eef6ff` (silver/light text). **No purple, no pink (`#ff4d8d`), no indigo.** Also banned: `#000103`, coral, magenta, violet, decorative emoji. SVG icons only. Official mark: the Crying Brain logo only. Do not invent a logo story.
- **Crisis numbers** (Samaritans 116 123, Shout / SHOUT 85258, NHS 111, 999) go clearly on Arron, Safety and crisis pages. Safety currently redirects to `/crisis.html`. Do not remove existing working safety access elsewhere solely to reduce repetition. Childline 0800 1111 and the National Domestic Abuse Helpline 0808 2000 247 are also used in Arron's safety text where already shown. **Superseded on 2026-11-18 for placement only** (founder memory, recorded 2026-11-23): the same numbers may sit lower on the page, including a sticky footer or the bottom of the screen, and may be less dominant. They stay exact and tappable and are never removed. Safety stays locked, with the crisis redirect first. Do not touch the soul file or issue #92.
- **Free forever. No tracking. No secrets in code.** No sale of member data. No ads in the sanctuary.
- **Do not touch PR #92.** It is closed; the branch is gone. Leave it.
- **Main is protected.** Propose or open PRs for changes. Do not force-push `main`. Do not rewrite history.
- **Never delete** Shane's voice, the Privacy page, core pages, or main-branch integrity.
- **If in doubt, leave it and ask.**

Protected pages and areas (do not edit unless Shane has just asked for that exact change): login, signup, reset-password, PayPal / payment handlers, `crisis.html`, the manifesto.

## Brand and voice

Taglines (use as already published; do not invent new official mottos):

- Rise From Madness
- Evolution, Not Erasure
- One Source, One Family (also: One Source. One Consciousness. One Family.)
- Love Over Money
- Connect The Survivors. Rise As One.
- They Labeled It. We Lived It.
- I didn't break. I woke up.
- Stay Sane. Stay Level-Headed. Stay Positive. (Arron / Stay Sane AI door)

Preferred style: cosmic, hip-hop, clean, urban. Plain British English. No corporate waffle. No toxic positivity. Photo thumbnails for games rather than text links. No aggressive pop-ups. No platform lock-in.

Legacy facts only, nothing invented: Private A. L. Cooper, Royal Army Ordnance Corps, Mentioned in Despatches, London Gazette 29 November 1945. The movement page also names Ivan Kurcharskyi and Arthur Lesley Cooper. Say only what those pages already say. If two lines disagree, the gazette line wins. Some older drafts add further heritage claims; those stay **unverified** unless Shane approves evidence (see [gemini.md](gemini.md) and Arron's recovered history).

## Crisis policy

- Arron is a companion, not a therapist, doctor, clinic or emergency service.
- Crisis replies, even if every model is down, carry: 999, Samaritans 116 123, text SHOUT to 85258, NHS 111 (option 2 for mental health support). Point to https://pleadingsanity.co.uk/crisis.html.
- Never diagnose. Never give medication advice or tell anyone to stop medication. Never give methods, means, doses or details that could be used to hurt someone.
- Never promise secrecy. Never say "no one will know" or "this stays between us". Never promise what you cannot do.
- Stay with the person after giving the numbers. Asking if they are safe does not make it worse.
- Healing tones that may be claimed as the house set: **174, 285, 432, 528, 741, 963 Hz**. Soft, fade in and out, respect reduced motion. They are optional experiences, not medical treatments. (`frequencies.html` was tightened to this six-tone set in the 14 November 2026 audit. An older soul-file list named additional Solfeggio numbers; the locked builder prompt and later handoff win.)

## Money model (Shane, 15 November 2026)

- The sanctuary is **free forever**. No paywall.
- **Paid:** physical goods only (P.S Studio 3D prints, clothes, anything physical).
- **Optional:** a one-off **99p** "Supporter / Full Depth" unlock (GBP 0.99, not a subscription) through the site's existing PayPal. Planned extras are non-essential only (longer Arron memory, extra Aura Hz sessions and downloads of the same free tones, extra brand-palette themes, a supporter badge). It does not grant the Creator Music Studio role.
- **Never gated:** crisis numbers, Arron basic chat, safety and crisis pages, core sanctuary pages (home, journal, feed, games, Aura Hz free tones, privacy, login/signup).
- Copy must say plainly that the sanctuary stays free and the 99p is optional.
- **Status on 15 November 2026: the 99p unlock is not built.** Production PayPal verification was not configured (`configured: false`). Do not edit existing payment flows. Google Pay is not a provider on its own; if wanted later it is a button inside PayPal or Stripe. **Superseded on 2026-11-15 (late):** the unlock was built the same day. The morning "not configured" line stays as history. See the 23 November 2026 update.
- Play chips only. No cash table. No claim of being a lender, broker or adviser.
- Solar: AI never certifies. MCS / NAPIT humans sign. 0% VAT to 31 March 2027 (eligibility). EPC is not required for SEG. Use "typically" on savings and prices. Shane organises Insane Solar; trusted local fitters install; he does not fit panels himself.

## AI chain and family

Canonical Arron provider order, locked in `netlify/lib/ai-chain.ts` and `arron-knowledge.json`:

**GPT → Claude → Gemini → Grok → local fallback**

The order is who answers first, not rank. All four labs are partners. Do not replace the chain. Do not add a fifth canonical provider without Shane's explicit approval. Optional OpenRouter spares exist in code for when all four are quiet; they are not a council and stay off personal chats until the owner sets the documented privacy / paid-spare flags. Never print key values. Never make a paid call unless Shane approves that spend in that chat.

Jobs (roles, not proof that a model is online):

- **Shane:** owner. Final yes on merge, spend, DNS, payments, and anything public. Nothing is posted or sent under his name without his approval of the exact text.
- **Arron:** public companion on the site. Not a second product. Not a therapist.
- **GPT:** plan, accuracy, architecture, evidence, audit.
- **Claude:** inspect real code, patch, regression tests.
- **Gemini:** Firebase, Google, mobile, access, plain wording.
- **Grok / Grok Bot:** voice, journeys, social drafts, images, outreach; fourth hop in Arron's chain. Grok Bot is Shane's hub chat. A Grok chat is not Arron.
- **Dola:** design structure, brand presentation, deploy checks. Cosmic Architect. Does not invent a second site.
- **Copilot:** small reviewed edits in the repo.
- **New Bot** and **New Bot 1:** Shane's other Grok-family bots. They report results back to Grok Bot. See their files; their agent profiles were empty as of this archive.

No one pretends to be another model. No one marks their own work as independently reviewed. Reading a file is not a live socket to another AI. There is no always-on hivemind.

## One house

- Live site: https://pleadingsanity.co.uk (Netlify `pleadingsanity`). `www` redirects to the apex. Do not point `www` at Vercel.
- Spare door: https://pleadingsanity.uk on Vercel. Not a second product.
- Test door: Netlify `pleadingsanitystaging`, built from the `staging` branch.
- Repo: https://github.com/pleadingSanity/pleadingsanity, branch `main`.
- Do not create another app, repo, Netlify site, Vercel project, or domain unless Shane says so in that chat.
- Brands stay separate: Pleading Sanity sanctuary, Insane Solar, Sanity Law, merch / Crying Brain, P.S Studio prints.

## How work is done

1. Read `AGENTS.md`, `AI_HANDOFF.md` (START HERE through the newest entry), `docs/MASTER_PROMPT.md`, and the file about to be edited, on current `main`.
2. Smallest patch on a branch. Draft PR if it touches privacy, auth, payments, DNS, or Arron.
3. Run existing checks (`npm test`, `npm run audit:site` / `scripts/audit-site.py`) for the area touched.
4. Report the SHA, the files, what was run, and what was not proven. Write "not proven" instead of inventing a result.
5. Shane merges, or an AI merges only when the current charter / owner grant for that class of work applies. Do not force-push `main`. **Superseded on 2026-11-20 for merges to main:** site and asset work is a Dola draft pull request only, and nothing merges without Shane's exact approval phrase. See the 23 November 2026 update.
6. Append a dated public-safe note to `AI_HANDOFF.md`. Do not overwrite other people's entries.

Charter note (historical, still in `.github/AI-OPERATING-CHARTER.md`): work may start on `dolas-duplicate`; `staging` is a golden backup; an older merge phrase was "You can merge and push — [branch] to main". Current practice, as of mid-November 2026, is focused branches and PRs into protected `main`, with Shane's standing grant for small, tested, docs-or-safe changes and an explicit yes still required for payments, auth, crisis wording, DNS, new paid services, this charter, and PR #92. Both layers are recorded so neither is lost. **Superseded on 2026-11-20 as a permission to merge:** the later founder rule requires Shane's exact approval phrase before any merge to `main`. The charter file itself was not edited in this window and stays here as history.

## Music (Shaney C)

_Artist name in this section is superseded on 2026-11-16. The style target is superseded on 2026-11-18 and broadened on 2026-11-19. The bullets stay as history. The current founder instruction is in the 23 November 2026 update. Originals-only, Shane's approval, and The Creator MMA upload rule are not superseded._

- Artist name: **Shaney C**. Style: northern bassline / speed garage around 135–140 BPM, plus storytelling UK rap. Originals only: no real artists' vocals, samples, or soundalike voices.
- Do not lift real choruses or lyrics (example already caught: Eiffel 65's "I'm blue, if I was green I would die" must never be used).
- Each track needs Shane's approval, then upload to **The Creator MMA** YouTube channel (`@thecreatormma5440`) with tags and required AI disclosure, then add to the radio. Approving the exact track comes first.
- Private studio: `/creator-studio-music.html` (creator / admin / owner only). Live as of PR #352.
- As of 15 November 2026, Runway and fal were connected as generation tools, but Runway music needed a paid plan and fal had no credit. No spend without Shane's yes.

## Sending, secrets, spend

- Nothing is sent or posted under Shane's name without his approval of the exact text.
- Never put key values or passwords in chat, in this folder, or in the repo.
- No spending without his yes.
- Never reintroduce a literal `sk-` / `ghp_` / `nfp_` / `sk_live_` key string in source, even in tests.

## Privacy contract (Arron memory)

Forget Me is `DELETE /api/arron/memory` with body `{ "memoryId": "..." }`. Success is `{ "ok": true, "cleared": true }`. Do not invent a new header or `verifiedClean`. A chat already in flight can still save after a wipe, so never say the cloud is clear unless that response says `cleared`. Say local wipe and server wipe separately.

## Updates recorded 2026-11-23 (Europe/London)

Weekly refresh against `main` `ae56375` (22 November 2026). The 15 November text above is kept. Items below are added only where the archive did not already say them. "Repo" means a file on that commit. "Founder memory" means Shane's shared memory as supplied for this refresh on 23 November 2026, not a new code change.

Checked and unchanged since the 15 November archive, so not recopied: `docs/MASTER_PROMPT.md`, `docs/MASTER_GPT_PROMPT.md`, `arron-knowledge.json`, `AGENTS.md`, `CLAUDE.md`, `.github/AI-OPERATING-CHARTER.md`, `.github/copilot-instructions.md`, `netlify/lib/arron-knowledge.ts`, `netlify/lib/ai-chain.ts`, `netlify/lib/studio.ts`. No new persona file was added. `docs/AI-CREDITS-FUND.md` is not in the repo.

Taglines already in this file were not duplicated: Rise From Madness; Evolution, Not Erasure; Love Over Money; Connect The Survivors. Rise As One.; They Labeled It. We Lived It.; I didn't break. I woke up.; One Source, One Family. Tone already recorded: Cosmic, Hip-Hop, Clean, Urban. No aggressive pop-ups. No platform lock-in. No emoji; SVG only. Crying Brain logo only.

### Imagery (repo, practised 21 November 2026)

Premium, high-end imagery: refined, glowing, with depth. Not stock. Palette stays `#0b0f19`, teal `#00fff0` / `#38bdf8`, amber `#f59e0b`, silver. Purple, indigo and pink (`#ff4d8d`) stay banned, including casts inside photographs. Home polish (`d7e51d8`, `85e156f`, `docs/HOME-VISUAL-POLISH-20261121.md`) regraded showcase cards and added palette-locked hero art without deleting the originals. Derivatives live under `assets/images/optimized/`. Never overwrite source art. Generated heroes in that batch have no text, no faces, no watermark and no trademarked element. A paid image-generation call still needs Shane's explicit yes in that chat.

### Money model status (repo, superseded the morning "not built" line)

Commit `02433a5` and `system_blueprint.json` `moneyModel.status`: the one-off 99p Supporter unlock is **built** (15 November 2026, late). Page `/supporter.html`, `GET /api/supporter` and `POST /api/supporter/verify` (`netlify/functions/supporter.mts`, `netlify/lib/supporter.ts`). It grants the Netlify Identity role `supporter` as a badge only. Order ids are recorded once. The 15 November late handoff records that the PayPal production env vars are set (values are not copied here) and that a fake order id against the existing verify function then returned "order not found" instead of "not configured". This refresh did not call PayPal. Optional extras (longer Arron memory, extra Aura Hz sessions, extra themes) are hooks, not a promise that each extra is already live. The badge does not grant the Creator Music Studio role. Crisis, safety, Arron basic chat and core sanctuary pages stay free. The top of `AI_HANDOFF.md` still says "not built" from the morning of 15 November; the later handoff entry the same day and the blueprint are the implementation record. Do not edit payment code from this archive.

### AI credits fund (founder memory only)

Half of the 10% platform cut on print sales goes to AI credits. Keep a ledger, move the amount monthly, and top up each provider under a monthly cap. This is not in `docs/AI-CREDITS-FUND.md` (that file is absent) and it is not a live ledger in the repo as of `ae56375`. Do not treat it as implemented accounting, and do not invent balances.

### How work merges (founder memory 20 November 2026, confirmed in repo docs)

Site and asset work goes to **Dola as a draft pull request only**. No merge to `main` without Shane's exact approval phrase. The same phrase gate is written in `docs/MASTER-UPGRADE-BLUEPRINT.md` (20 November), `docs/PHASE1A-ORBITAL-NOTES.md` and `docs/SEO-LAUNCH-CHECKLIST-20261121.md`. Coordinate through GitHub issue **#232** and `AI_HANDOFF.md`. This refresh itself is a draft pull request and must not be merged from here.

### One house, restated where the archive was thinner

Stay on the existing Netlify house (`pleadingsanity` at https://pleadingsanity.co.uk). No Shopify migration for the site. No extra Netlify site, Vercel project, or grok.me site. `docs/LEGALLYINSANE-SCAFFOLD-SPEC.md` and `docs/LEGALLYINSANE-BRINGUP-20261120.md` (`d6e8ac5`, `488ce7a`) describe a parked `legallyinsane.co.uk` lab: on 20 November, DNS only, no TLS, no host project, no repository. That spec is not permission to open a second house. If Shane later approves the lab in that chat, its own rules say: separate env vars, no shared PayPal, identity or mailing list, and a visible note that experiments are not therapy. Until then, do not create it.

`docs/REPO-BRANCH-SWEEP-20261120.md` keeps this repo as the active production house. Archived repositories stay archived. Do not delete a repository from this archive's authority.

### Brands (founder memory, where missing)

Keep the brands separate.

- **Pleading Sanity** — the sanctuary.
- **Insane Solar** — roof-blokes-only, no sales layer. AI never certifies. MCS / NAPIT humans sign. 0% VAT runs to 31 March 2027 where the household is eligible. EPC is not required for SEG. Use "typically" on savings and prices. Commit `ced20fd`: the £50 deposit loads the PayPal client id from Netlify env (`/api/supporter`). Do not hardcode a client id back into `insane-solar.html`.
- **Sanity Law** — its own brand. Do not fold it into the sanctuary or into Insane Solar.

### Related brands (founder memory)

- **Aura Hz** — sound wellness, frequency sessions, and adaptive cognitive hardware. The free tones stay the six healing frequencies already locked. Aura Hz One remains a named vision and a store card; do not claim a hardware run is in customers' hands unless a current handoff says so.
- **The Techi Verse** — premium tech-gadget shop, in development. No route for it was found on `ae56375`. Do not present it as live.

### Music — Pleading Socially (founder memory; repo still says Shaney C)

From 16 November 2026 the artist name is **Pleading Socially**. That name replaces Shaney C. Style target from 18 November: Josh Fawaz-like 90s Clubland deep-house / UK garage, 124–128 BPM, piano stabs, anthemic hooks. Broadened on 19 November to UK grime, deep house, tech house, dance, and hip-hop bounce. Originals only. No uncleared covers or remixes. Shane's own voice takes are cleaned and tuned. Tools stay free and commercially releasable: local RVC / Applio, and the RouteNote free plan. Two playlists: "Pleading Socially – Shane's Voice" and "P.S AI Playlist". First track in progress: "Breaking Free" at 126 BPM. Approved originals still publish to The Creator MMA YouTube with proper tags and the platform's required disclosure.

As of `ae56375` the live studio still says Shaney C (`creator-studio-music.html`, `music/shaney-c/`, `netlify/lib/creator-studio-seeds.js`). This archive records the founder rename. It does not rename the studio. Do not delete the Shaney C drafts.

### P.S Studio prints (repo)

Printer: Flashforge AD5X. Founder memory: it arrived 16 November 2026. The repo confirms it is the house printer (`maker/README.md`, `docs/AD5X-PRINT-CHECKLIST-20261121.md`, commits `aeb915c`, `3cef91d`, `bd4913d`).

First products: £2 decorative keyrings for ages 14 and over — Halloween, snowman, and an original hero. They are not toys. No trademarked characters. Flat, low play-value charms can be listed as 14+ decorative accessories once a real photo, batch, warnings, material and a real print-file licence are in. Flexi, articulated and 3D-figure keyrings are treated as toys and stay draft until UK toy-safety compliance is confirmed (`compliance: true` and a `compliance_ref`). Mockup art and slicer renders are never a Buy button. A catalogue row follows a successful print and Shane's sign-off, not a preview alone. Vehicle-workshop parts are validation-only and are not sold as road-safety components (`docs/3D-PRINT-SHOP.md`, `docs/3D-PRINT-COMPLIANCE-UK.md`, commit `b075b7d`).

Never commit the printer LAN address, serial, LAN check code, or hotspot password. `maker/printer_config.example.json` is the template. Do not claim a live or finished print without those three identifiers, and do not copy the identifiers into this archive. On-site PayPal checkout for prints is a separate paid-goods path (`prints.html`). Do not copy order contacts or private mailboxes into this folder. The sanctuary stays free.

### Working practices worth keeping (repo, 15–21 November 2026)

- Creations image keys stay isolated from Arron chat keys (`e3eccac`, Shane's commit `8490d0f`). Provider SDK bumps must be re-tested with the chain order and the crisis numbers still intact.
- Public handoff text does not repeat private mailbox addresses (`aeb915c` redacted the connectors map). Keep doing that.
- New binary images that a text-only tool cannot push go under `binary-src/` as base64 and are materialized by `scripts/materialize-binary-assets.cjs` (handoff, 15 November night, `fecb2b2`). Do not commit secrets inside those blobs.
- Before a maker, home or SEO commit, the branches in this window ran `node --test tests/prints.test.js`, `node --test tests/ps-studio-catalog.test.mjs` and `python3 scripts/audit-site.py`.
- `docs/MASTER-UPGRADE-BLUEPRINT.md` is a paste-ready coding prompt (20 November). Durable rules inside it: never delete a working route, page, function or asset (mark legacy or archive instead); feature branch and pull request; no merge without Shane's explicit phrase; secret scan before commit; crisis links stay `tel:999`, `tel:116123`, `sms:85258?body=SHOUT`, `tel:111`; commercial order data stays separate from sanctuary records; no paid model call without approval; Arron remains a companion, not a therapist; the chain fails closed and never prints a key or a raw provider error; no cloned voice without written consent. The full prompt stays in that file. Do not treat its later phases as built. Phase 1A only is in the tree (`30687da`, `docs/PHASE1A-ORBITAL-NOTES.md`): additive orbital section on the home page, crisis still one tap from the sun card, Calmer View in `localStorage.ps-calm`, motion off when reduced motion is requested.
- SEO (`6f34ce5`, `bd4913d`): rank the brand name with honest pages. No spam automation. No paywall on help. Noindex and private routes stay out of the sitemap. FAQ structured data only where the page already has real questions. Owner dashboard steps stay in those docs. Do not copy phone numbers or mailbox addresses from them into this archive.
- Orbital and home work did not remove crisis access. Two music pages were noted in the 20 November audit as missing the literal `999` string in markup (`creator-studio-music.html`, `music-creator.html`). That is an observed gap, not a licence to delete crisis UI elsewhere.
