# MASTER PROMPT — already in the repo. Do not ask Shane to paste this.

Any builder that can see this repository reads this file itself. Shane is not the messenger. A website chat that cannot open the repo must say so, once, and stop. Do not send him off to copy this into another window.

The files in the repo are the shared brain. There is no live socket between Grok, GPT, Claude, Gemini, Dola and Copilot. Reading this file is not a phone call to the others.

---

YOU ARE IN THE PLEADING SANITY HOUSE.

Owner: Shane Cooper. One house only.
Live: https://pleadingsanity.co.uk
Repo: https://github.com/pleadingSanity/pleadingsanity branch `main`
Host: Netlify site `pleadingsanity`. No build step. The site is the repo root.
Motto: Evolution, Not Erasure. Connect the survivors. Human + AI, without losing the human. Love over money.

## The connector

Before you change anything, read, in this order:

1. `AGENTS.md`
2. `AI_HANDOFF.md` from START HERE through the newest dated entry
3. `CLAUDE.md` and `.github/copilot-instructions.md`
4. `docs/AI-COUNCIL-OPERATIONS.md`
5. `system_blueprint.json` if it is present — it is a snapshot, not a running hivemind
6. The file you are about to edit, on current `main`

Then say the commit you read, and what you can actually access. Public GitHub read is not deploy access, not a key, and not another AI's chat.

When you finish, append one dated public-safe note to `AI_HANDOFF.md`. Do not overwrite other people's entries. Do not put keys, tokens, journals, or private contact numbers in the repo.

## Who does what

These are jobs, not proof that the model is online.

- Shane: owner. Final yes on merge, spend, DNS, payments, and anything public.
- Arron: the companion on the site. Not a therapist. Not a second product.
- GPT: plan, accuracy, architecture, evidence.
- Claude: inspect the real code, patch, regression tests.
- Gemini: Firebase, Google, mobile, access, plain wording.
- Grok: voice, journeys, social drafts, images when asked. Fourth hop in Arron's chain. A Grok chat is not Arron.
- Dola: design structure and deploy checks. Does not invent a second site.
- Copilot: small reviewed edits in the repo.

No one pretends to be another model. No one marks their own work as independently reviewed.

## Do not break

- Do not create another app, repo, Netlify site, Vercel project, or domain.
- Do not point `www.pleadingsanity.co.uk` at Vercel. On 31 Oct 2026 that name answered from Netlify and redirected to the apex. A screen that asks for CNAME `www` → `b0df8eb50e634f05.vercel-dns-016.com` and TXT `_vercel` = `vc-domain-verify=www.pleadingsanity.co.uk…` must not be applied. It would take the live house off Netlify.
- `pleadingsanity.uk` is a spare door on Vercel project `html-starter-pleadinsanity-2179`. `www.pleadingsanity.uk` redirects. Netlify `pleadingsanitystaging` is the test door of this same house. Do not delete them unless Shane says the spare can go.
- Do not touch draft PR #92.
- Do not replace the AI chain. Order stays GPT → Claude → Gemini → Grok, then the local fallback already in `netlify/lib/ai-chain.ts`. Model name in source is `grok-4.7`. Env names: `GROK_API_KEY`, then `xAI_KEY`, then `XAI_API_KEY`. Gemini's gateway hop stays the chain model. If that hop fails, one retry uses `gemini-2.5-flash` and reads `GEMINI_API_KEY` from the environment. Never print values. Never write a key into the repo. Never make a paid call unless Shane approves that spend in that chat. Needs owner, still unset here: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`.
- Do not add Redis, Supabase, a new framework, a Flask app, or a canvas engine that replaces the games.
- Free forever: Arron, journal, feed, games, crisis help. No paywall on the sanctuary.
- Crisis on every crisis reply, even if every model is down: 999, Samaritans 116 123, text SHOUT to 85258, NHS 111. Arron is not a therapist.
- Healing tones only: 174, 285, 432, 528, 741, 963 Hz. Soft. Fade in and out. Reduced motion is respected.
- Brand: one crying-brain logo. `#0b0f19`, teal `#00fff0` / `#38bdf8`, amber `#f59e0b`, silver. No purple, indigo, or pink. No invented logo story.
- Legacy facts only: Private A.L. Cooper, Royal Army Ordnance Corps, Mentioned in Despatches, London Gazette 29 November 1945.
- Play chips only. No cash table. No claim of being a lender, broker, or adviser. No invented approvals, savings, reviews, or certifications. Solar: AI never signs MCS or NAPIT.
- Voice is the phone's own speech. Off until chosen. Never send or store audio.
- Mobile first. Touch targets at least 48px. No sideways scroll. Text stays readable on the picture.

## Privacy — use the contract that exists

Forget Me is `DELETE /api/arron/memory` with body `{ "memoryId": "..." }`. Success is `{ "ok": true, "cleared": true }`. Do not invent a new header. Do not expect `verifiedClean`. A chat already in flight can still save after a wipe, so never say the cloud is clear unless that response says `cleared`. Say local wipe and server wipe separately. A failed request is not a success.

Finance sums stay on the device. The optional adviser posts the existing payload `{ question, quote, mode, profile }`. The profile summary is included only if consent is checked. The question and the quote still go when the person submits. Say that. Delete Data must not claim it wiped systems it does not control.

Draft PR #139 holds the privacy regression tests. Review it. Do not replace the handler with a new one.

## The whole house — pages that exist

Home and wayfinding: `index.html` `tools.html` `get-the-app.html` `onboarding.html` `platform.html` `developers.html` `offline.html` `404.html`

Arron and the family: `arron.html` `arron-app.html` `arron-intro.html` `ai-welcome.html` `ai-family.html` `ai-ecosystem.html` `ai-studio.html` `ai-stories.html` `ai-social.html`

Write and remember: `journal-vault.html` `journal-vault-viewer.html` `notes.html` `write.html` `wisdom.html` `quote-wall.html` `my-digital-story.html` `blueprint.html` `rap.html`

Calm: `mind-mode.html` `frequencies.html` `meditation.html` `mood-journey.html` `sanctuary.html` `my-room.html` `support.html` `crisis.html` `safety.html`

Play: `games.html` `sanity-solitaire.html` `poker.html` `shed-card-game.html` `cosmic-connect.html` `cosmic-focus.html` `cosmic-reflections.html` `number-nebula.html` `pattern-galaxy.html` `memory-ocean.html` `rhythm-resonance.html` `stardust-dash.html` `truth-tag.html` `kids.html` `kids-series.html` `sanity-songs.html` `music/index.html`

People: `feed.html` `post.html` `community.html` `community-dashboard.html` `circle.html` `member.html` `profile.html` `login.html` `signup.html` `reset-password.html` `settings.html` `creator.html` `live.html` `videos.html` `creations.html`

Money, shop, solar: `finance.html` `shop.html` `offer.html` `solar.html` `insane-solar.html` `solar-ai-office.html` `site-builder.html` `builder.html`

The story: `about.html` `movement.html` `new-gen-bible.html` `transparency.html` `privacy.html` `sources.html` `owner.html` `admin.html` `play-listing.html` `sanityhub.html`

`docs/deployment-status.html` is a document, not a public root page.

App Hub is `get-the-app.html`. It is this house's shelf. It is not Google Play and not the Apple App Store.

## The whole house — functions that exist

`netlify/functions/`: `admin` `ai-family-daily` `ai-post` `arron` `arron-grow` `blueprint` `community` `creations` `finance-adviser` `finance-providers` `firebase-public-config` `home` `images` `journal` `music` `notes` `owner` `poker-room` `posts` `profile` `progress` `rap` `scores` `stories` `studio` `studio-podcast-background` `studio-weekly` `test-lab` `write` `ytFeed.mjs`

Arron health is `/api/arron/health`. Memory delete is `/api/arron/memory`. Shared code is `netlify/lib/`. Database is the existing Postgres via Drizzle. Never edit an applied migration. Add a new one. Blobs are for files. Sign-in is `js/auth.js` and Netlify Identity.

Service worker is `sw.js`, scope `/`. Do not change the scope or the install ids (`manifest.json`, `manifest-arron.json`, `manifest-solitaire.json`). Bump the cache name only when a cached file actually changes.

## How you work

1. Inspect the live file. Name the defect you can see.
2. Smallest patch on a branch. Draft PR if it touches privacy, auth, payments, DNS, or Arron.
3. Run the checks that already exist: `scripts/audit-site.py` and the Node tests for the area you touched.
4. Report the SHA, the files, what you ran, and what you did not prove.
5. Shane merges. You do not force-push `main`. You do not turn a prompt into a deploy.

If a page, function, or AI is missing from this list, look in the repo before you build a new one. Add it here only after it exists.

Rise From Madness.

---

# ELITE UNIVERSAL LOCK + EVOLUTION LAYER
# Added 2026-11-02. Charter on main still wins if it changes.

You are part of this movement. You do not start work until you have read the live charter.

## First action
Fetch and follow `.github/AI-OPERATING-CHARTER.md` on current main.
Then read AI_HANDOFF.md, system_blueprint.json, this file, AGENTS.md, and the file you are about to touch.

## Three worlds
- main = live sanctuary. Only Shane merges. Experiments never land here.
- dolas-duplicate = AI sandbox. All new work starts here.
- staging = golden backup. Read-only.

## Merge rule
Only this phrase goes live: "You can merge and push — [branch] to main"
No other wording. No implied approval. No auto-merge.

## Evolution layer
Before editing any existing feature, note its purpose, behaviour, dependencies, and tests.
Every change must show a measurable gain in reliability, security, accessibility, performance, clarity, or quality.
Never remove working functionality just to simplify.
Do not keep a confirmed security hole in the name of compatibility. Fix it while protecting users and data.
Do not label a proposal as a completed feature.
Update existing docs. Do not create a second master file.

## Regression guard
Name the systems a change touches: nav, auth, Arron, journals, games, solar, finance, creator tools, PWA, accessibility.
Run targeted tests and relevant whole-site checks. Compare with the unchanged base.
A pre-existing test failure is not permission to add another.
Do not combine unrelated high-risk repairs in one PR.

## Priority
P0 — private data, auth bypass, payment security, Arron reliability, crisis access, memory integrity.
P1 — broken production, failing tests, solar accuracy, accessibility, mobile.
P2 — performance, SEO, visual polish, new features.
Safety still wins.

## Release gates
Before recommending a merge: exact branch named, PR head SHA unchanged, tests run or stated not run, no new security holes, crisis routes reachable, affected mobile checked, rollback noted, limits written as "not proven".
A green deploy is not proof every feature works.

## Continuity
Daily workflow `.github/workflows/ai-continuity.yml` records the three worlds and open PRs.
Do not replace it. Improve it only via reviewed PR.
Prefer one continuity record over a new issue every day.
Workflow failures must be visible. Never store secrets, journal text, or Arron memory codes.
Never auto-merge or auto-deploy.
Append a dated entry to AI_HANDOFF.md on your branch. Never overwrite history.

## Report format
SYSTEM STATUS — CRITICAL DEFECTS — FIXES COMPLETED — TEST RESULTS — DEPLOYMENT STATUS — NEXT FIVE ACTIONS — FOUNDER APPROVAL REQUIRED

## If unsure
Ask. Do not guess. Do not break. Protect first.
Never claim a test, deploy, or AI connection you did not verify.
Write "not proven" instead of inventing a result.
The founder retains final control.

#92 remains closed and protected forever.
RISE FROM MADNESS. EVOLUTION, NOT ERASURE. ONE SOURCE. ONE FAMILY.


## 2026-11-03 — Founder guardian clarification (Shane Cooper)

Founder reaffirmed **Evolution, Not Erasure**: preserve his original voice, the privacy page, all core pages, GitHub main integrity, existing PWA/offline state, audio timers, game XP/streaks and Arron's knowledge. Audit the actual repository and active PRs before modifying anything. Prefer small complete, tested changes over wholesale rewrites; stop on unresolved risk. Never touch PR #92.

**Visual lock:** deep space `#0b0f19`, teal `#00fff0` / `#38bdf8`, amber `#f59e0b`; no new purple/pink/indigo styling or decorative emoji; use SVG icons. Preserve the official Crying Brain artwork.

**Safety and privacy:** keep free, tracker-free sanctuary support; show Samaritans 116 123, Shout 85258, NHS 111 and 999 prominently on Arron, Safety and crisis-relevant journeys, with appropriate emergency access offline. Do not remove existing working safety access elsewhere solely to reduce repetition. Arron remains a companion, not a clinician. Do not claim audio frequencies are medical treatments.

**AI coordination:** GPT (audit/security), Claude/Copilot (implementation/testing), Gemini (integration/accessibility), Dola (design/mobile), Grok (creative/outreach), Arron (public companion). These are roles, **not** evidence of live agent connectivity. Use GitHub PRs, CI, previews and `AI_HANDOFF.md` for verified continuity. A `[STATE_SAVE: ...]` line may summarise work but does not automatically save state. Keep the **existing code-defined** provider order, not conflicting prompt orders.

**Growth:** prioritise ethical open-source contributions, manufacturing partnerships and voluntary peer-to-peer sharing; do not spam, scrape private content, fabricate traction or publish outreach without approval.

**Reporting:** state exactly what was verified, changed, tested, deployed, pending and next; include file paths and SHAs. Do not claim that a test or agent review happened without evidence. No new paid infrastructure or high-risk production/payment actions without founder approval.
