# Pleading Sanity: ecosystem map and architecture

This is the engineering view of the house: what exists, how the pieces connect, and how the next systems should be built. The public version is `/roadmap.html`. Nothing here is "live" unless the Now column says so.

Classes: **A** works · **B** exists, incomplete · **C** exists, needs redesign or integration · **D** missing · **E** needs backend, credentials, a third party or legal review.

## 1. Map

| Area | Where | Class | Notes |
|---|---|---|---|
| Home | `index.html` | A | |
| Arron | `arron.html`, `arron-app.html`, `netlify/functions/arron.mts` | A / E | Memory, Forget Me, AI chain. Needs the AI Gateway. |
| Journal Vault | `journal-vault.html` (device), `journal.mts` (account) | A | Two journals: on-device and account. They aren't joined. |
| Mind Mode, Mood Journey | `mind-mode.html`, `mood-journey.html` | A | |
| Healing Hz | `frequencies.html` | A | Worded as "may help you relax", not a treatment. |
| Silence & Breath | `meditation.html` | A / B | Breath has no page of its own; Mind Mode covers it. |
| AI Studio, Image Creations, Video Blueprint, Write, Rap | `ai-studio.html`, `creations.html`, `blueprint.html`, `write.html`, `rap.html` | A / E | Rap Studio isn't linked from the main nav. |
| Creative Battles / Sanity Arena | Battle tabs in AI Studio and Rap only | D | Design in §6. |
| Games (13) and Solitaire | `games.html`, game pages | A | Card art is under `/assets/theme/cards/`. |
| Keep Kids Sane | `kids.html` | A (games) / E (separate space) | Design in §6. |
| Sanity Feed | `feed.html`, `posts.mts` | A | Now carries Human / Together / AI and the five truth tags. |
| Sanity Hub | `sanityhub.html` | C | Mostly static overview. |
| Human Stories | `ai-stories.html` is Arron conversations, not human stories | C / D | Design in §6. |
| Sanity Wall | `quote-wall.html` | B | Static quotes. |
| Guardians | `member_roles` role (pin, hide, act on reports) | A (role) / D (page, audit view) | Design in §6. |
| AI Family | `ai-family.html`, `ai-ecosystem.html`, `/api/ai-status` | A | Live "configured" list, not a claim of connection. |
| New Gen Bible | `new-gen-bible.html` | A | Uses known, thought, belief and unknown. |
| Truth Lab | Tags in `netlify/lib/social.ts`, `js/social.js`; `truth-tag.html` game | B | Five tags now on posts. The game still teaches the older three. A Truth Lab page is Next. |
| Philosophy, The Unknown | A section of the Bible | D | Fold into the Truth Lab page rather than new pages. |
| Sanity Passport | `passport.html`, `passport.mts`, `netlify/lib/passport.ts` | A (new) | §3. |
| Profile, My Sanctuary, My Room | `profile.html`, `sanctuary.html`, `my-room.html` | A / C | They overlap. |
| Achievements | Badges in games, profile | B | No single page. Contribution identities in §6. |
| Movement: story, manifesto, mission, legacy | `about.html`, `movement.html` | A / C | Duplicated between the two. |
| Roadmap, developers and partners | `roadmap.html` | A (new) | |
| Community dashboard | `community-dashboard.html` | C | Invented numbers removed (§5). Votes are not open. |
| Circle | `circle.html` | B | Possy and neggy are on-device only. |
| Shop | `shop.html` | A / E | External shop. |
| Sane Finance | `finance.html` | A / E | Planning tools. Live data needs a licensed feed; broking needs FCA authorisation. |

Navigation is copied by hand into about 50 pages (`<nav class="ps-nav">`). `js/site.js` only adds behaviour. There's no Think or Movement group yet. A single injected nav is the right next step, but it has to be done carefully because many pages hard-code `aria-current`.

## 2. Provenance (Human / Together / AI)

`netlify/lib/provenance.ts` is the single shape:

```
origin          human | ai | collaborative   (shown as Human / AI / Together)
aiProvider      set only by our own functions
aiModel         set only by our own functions
humanReviewed   a person read it before it went out
aiMemoryAllowed the creator lets Arron learn from it (default false)
```

- Stored on `posts` and `site_content` (migration `20261008162857_add_provenance_passport`). Older rows default to human and reviewed, which is accurate for member posts. Earlier Arron "put it live" posts can't be identified after the fact and also read as human.
- Members declare their own origin in the composer. Using Arron's "Use this" suggestion switches it to Together, and Write with Arron sends Together when a draft was used.
- A browser can't claim a provider or model. Only `fromServer()` sets those.
- `guardTruthTag()`: unreviewed AI or Together text can't be tagged Known. It's filed as Thought.
- Arron's owner "put it live" and "publish this" now publish as AI (`humanReviewed: false` when no one read it first), tagged Thought, and credited "Arron (AI) for …".
- `arron-grow.mts` only learns from posts with `ai_memory_allowed = true`.
- Rendering: `originBadge()` in `js/social.js`. Human shows no badge; Together and AI always do.

To extend provenance to another table (creations, studio items, AI stories), add the same four columns, set them through `fromMember` or `fromServer`, and return `provenanceOut(row)`.

## 3. Sanity Passport

- Table `passports`: `fields` JSON `{ key: { text, visibility: private|members|public, ai } }`, plus `ai_memory_allowed` and `personalise` master switches.
- Every field starts private and hidden from Arron. Arron reads a field only if it is ticked **and** the master switch is on. It reaches him as `<passport>` data, marked as data and never as instructions, and never in a local-only chat.
- Members-only and public text passes `moderate()` like a post.
- `GET /api/passport/:username` applies page visibility, friends-only profiles and blocks.
- "Suggest things for me" matches keywords in the browser. Nothing is sent for it.
- Export: `GET /api/me/export`. Delete: `DELETE /api/passport`, and it cascades with the account.

## 4. Truth Lab taxonomy

Five tags: `known`, `experience`, `thought`, `belief`, `unknown`. Legacy `evidence` displays as Known and legacy `philosophy` as "Thought or belief". Both are still accepted, so old rows and old clients keep working. AI drafts may suggest only experience (when retelling the member's own notes), thought, belief or unknown, never known.

## 5. Defects fixed in this pass

- **Stored XSS on Night Table rooms:** a room seat name was rendered as HTML. Names and notes are now cleaned on the server and escaped on render.
- **AI credential leak:** the direct-OpenAI fallback reused the Gateway's injected `OPENAI_API_KEY` against api.openai.com. It's now only used when `OPENAI_BASE_URL` isn't set.
- **`/api/rap`:** no auth, no limit, and member text in the system prompt. It's now same-origin and rate limited, and the text is wrapped as untrusted.
- **`/api/ai-post`:** unlimited calls. Now rate limited, with the draft wrapped as untrusted.
- **Owner-only Arron actions** (deploy, roles, approve all) fired on questions or "not yet". They now need a plain instruction.
- **Pending member posts** went raw into the owner's system prompt. They're now wrapped as untrusted.
- **Studio AI output** went onto the public wall unmoderated. It's now moderated.
- **`/api/images`** served friends-only and private post images, and unshared creation images, to anyone with the URL. It now follows the owning post's or creation's visibility.
- **Error logging:** whole error objects were logged, and drizzle errors include query parameters (private text). Only the error name is logged now.
- **Account deletion** missed `site_content`, `activity_log`, votes, hearts, usage counters and the banner blob. These are now removed. Reports about the account are kept as a safety record, and the settings page says so.
- **No data export existed.** `GET /api/me/export` and a "Download my data" button were added.
- **Invented figures on `community-dashboard.html`:** "OPERATIONAL 24/7 crisis response", 247 responders with a ~47s response time, a £124,500 monthly budget, a £2.3M fund, 94.7% "crisis resolution", vote percentages, and named council members who don't exist. All replaced with honest states.
- **`circle.html`** called a non-existent `/api/reactions` (404s). Removed; the page now says reactions stay on the phone.
- **Privacy wording:** the Arron name "stays on this device" (it's sent with every message); "Forget Me erases everything"; OpenRouter backups weren't disclosed; game progress was "device only" (it syncs); the AI Studio claimed four AIs on the podcast (it uses three) and implied Grok was always on; settings said "no backups".
- **Source files** (`/netlify/*`, `/db/*`, `.env` templates) were downloadable from the live site. They now return 404 (the code stays public on GitHub).

## 6. Designs for Next and Then (not built)

**Human Stories:** a post `kind: "story"` with optional structured sections (what happened, what I went through, what kept me going, what I learned, where I am now, what I want others to know), origin `human` only, a privacy checklist before posting (no addresses, phone numbers, schools, workplaces, or other people's private details), a content warning, edit and delete, the existing report flow, and visibility defaulting to members. No hearts leaderboard.

**Guardians:** the role exists. Add a `/guardians.html` that explains what they do (welcome, protect, report, signpost, connect) and what they aren't (therapists, doctors, police, judges, surveillance). Every Guardian action (`post.pin`, `post.hide`, report resolution) already goes to `activity_log`. Add an Owner view of it and a monthly public count. A member's activity is never shown to Guardians.

**Sanity Arena:** tables `arena_contests` (category, brief, criteria JSON, stage open|judging|closed, opens/closes) and `arena_entries` (contest, author, post or creation reference, provenance, status). Scoring is per published criterion from named judges, with a small community component. Results are stored as `arena_results` with the scores visible. Human × AI entries carry their provenance.

**Contribution identities:** derived from actions (stories shared, Guardian work, helpful replies), shown as words, never as a number ranked against other people. Never derived from mood, crisis flags or illness.

**Keep Kids Sane:** a separate space, not the adult network. Age bands; no public profiles, discovery or direct messages; prompts limited to safe ones; parental controls. It needs a safeguarding lead and legal review (UK Age Appropriate Design Code, Online Safety Act) before any account or data collection for children. Today's kids games collect nothing and should stay that way until then.

## 7. Environment variables

Never put any of these in browser code, HTML or the repo.

**Required now**

| Variable | What and why | Where from | Cost | Human action |
|---|---|---|---|---|
| (none to set) Netlify AI Gateway | GPT, Claude and Gemini for Arron, Studio, Write and moderation. Netlify injects `OPENAI_*`, `ANTHROPIC_*`, `GEMINI_*` and `NETLIFY_AI_GATEWAY_*` | Netlify, automatic on credit plans | Netlify AI credits | Keep credits topped up. Don't set your own `OPENAI_API_KEY` unless you mean to bypass the Gateway. |
| `NETLIFY_OWNER_EMAILS` | Who is the Owner (with a confirmed email) | Netlify env | Free | Keep it set to Shane's address. |
| Netlify Database and Identity | Accounts, posts, Passport | Netlify | Plan | None. |

**Optional**

| Variable | What and why | Where from | Cost | Human action |
|---|---|---|---|---|
| `GROK_API_KEY` (or `xAI_KEY`) | Grok as the fourth lab | console.x.ai | Paid per use by xAI | Optional. The house rule is no paid API, so check this is still wanted. |
| `OPENROUTER_API_KEY` | Free backup models when all labs fail | openrouter.ai | Free models only, unless `PS_IN_PROFIT` is set | Optional. It's disclosed on the privacy page. |
| `PS_IN_PROFIT` | Allows paid OpenRouter backups | You | Paid | Leave unset. |
| `YOUTUBE_API_KEY` | Live video feed | Google Cloud | Free quota | Optional. Curated videos show without it. |
| `NETLIFY_BUILD_HOOK` | Owner's "deploy" command in Arron | Netlify build hooks | Free | Optional. |

**Future**

| Variable | What and why | Where from | Cost | Human action |
|---|---|---|---|---|
| `FINANCE_PROVIDER_FEED_URL` | A licensed lender or product feed | A licensed data provider | Usually paid | Needs a contract and FCA review first. |
| `FCA_REGISTER_EMAIL`, `FCA_REGISTER_KEY` | FCA Register lookups | register.fca.org.uk developer portal | Free | Register and add both. |

## 8. Legal and regulatory review needed

- Any lead passing, broking or commission in Finance needs FCA authorisation or appointed-representative status.
- A children's space needs a safeguarding policy, the Age Appropriate Design Code and the Online Safety Act duties reviewed by a professional.
- The Online Safety Act user-to-user duties (risk assessment, reporting, complaints) apply to the feed today. A written risk assessment is advisable.
- The privacy page should be reviewed against UK GDPR by someone qualified: processors (Netlify, OpenAI, Anthropic, Google, xAI, OpenRouter), retention, and the backup limits.
- Health wording should keep to "may help": no treatment claims for frequencies or games.
