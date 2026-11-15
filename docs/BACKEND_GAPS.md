# Backend gaps — code audit, 31 Oct 2026

This is a read of the repository. No live database, Supabase project, or Netlify Identity admin was queried. "Present" means the table or check exists in code. "Missing" means the feature has no matching table or the write path does not prove ownership.

## Tables that exist (Netlify Database, `db/schema.ts`)

| Need | Tables in code | Notes |
| --- | --- | --- |
| Profiles | `users`, `profiles`, `member_roles` | `users` is created on the first authenticated API call. Profiles are written from `profile.mts` after `currentUser()`. |
| Arron memory | `arron_memories`, `arron_messages` | Source of truth for chat. Optional second copy is Supabase `arron_chat_memory`, not a Netlify table. |
| Journal | `journal_entries` | Private rows are scoped by `userId` after sign-in. |
| Community | `posts`, `comments`, `likes`, `friends`, `reports`, `blocks`, `saves`, `creations` | Feed, friends, reports and blocks. |
| AI Social / studio | `studio_items`, `studio_votes`, `studio_usage`, `ai_stories`, `ai_story_hearts`, `site_content` | Stories and the studio wall. Scheduled family posts insert `studio_items` with no user row. |
| Solar enquiries | none | The solar assistant answers in the request. It does not store an enquiry. The public solar form is a Netlify form, not a database table. |
| Donations | none | `verify-paypal.mts` is on `main` (PR #151, merged). It checks a completed PayPal order. There is still no donations table. |

Other tables in the same schema: `activity_log`, `game_progress`, `site_settings`, `rate_limits`, `site_proposals`, `sanctuary_notes`, `test_lab_items`, `test_lab_feedback`.

## Write functions and authorisation

Checked every function that inserts, updates or deletes.

| Function | Who can write |
| --- | --- |
| `journal.mts`, `notes.mts`, `profile.mts`, `posts.mts`, `community.mts`, `creations.mts`, `admin.mts`, `owner.mts`, `blueprint.mts`, `write.mts`, `images.mts` (non-GET), `progress.mts`, `scores.mts` | `currentUser()` required. Journal, notes and profile updates also match `userId`. Owner routes check `isOwner`. Admin hide checks a guardian or admin role. |
| `stories.mts` POST create | Signed-in member. Heart toggle accepts a device key for a guest. |
| `studio.mts` | Create requires a signed-in member. Votes can use a device key. |
| `test-lab.mts` | Read is public. Add, edit and resolve require `currentUser()` and `isOwner` or a creator role. |
| `music.mts` | Upload and delete require a signed-in member with a creator role or `isOwner`. |
| `arron.mts` | Guests may chat. A memory id from the client is reused. Cloud save runs for a signed-in member or when the client sends `saveToCloud`. |
| `arron-memory.mts` | **Fixed in this pass.** The URL is an owner-only door. Chat still writes through the library inside `arron.mts`. |
| `ai-family-daily.mts`, `arron-grow.mts`, `studio-weekly.mts` | Scheduled. They insert or update house content with no member. Netlify invokes them on the schedule. They are not member write APIs. |
| `studio-podcast-background.mts` | Continues a row only when the request carries the token stored on that row (`style` starts with `pending:`). |
| `poker-room.mts` | No account. Play-chip rooms in Blobs. Anyone with the room code can post a seat and stacks. |
| `solar-assistant.mts`, `finance-adviser.mts`, `finance-providers.mts`, `rap.mts` | No database write. Rate limited. |

## Supabase `arron_chat_memory`

Before this pass the SQL in `netlify/lib/supabase-memory.ts` left RLS as a comment, and the client used only `SUPABASE_ANON_KEY`. This branch now:

- prefers `SUPABASE_SERVICE_KEY`, then `SUPABASE_ANON_KEY`
- ships `supabase/migrations/20261031000000_arron_chat_memory.sql`, which enables and forces RLS and revokes anon and authenticated
- keeps `/api/arron/memory/supabase` behind `currentUser()` and `isOwner`

The SQL file is not applied by a Netlify deploy. Shane still has to run it in the Supabase SQL editor. This audit did not confirm that the live project has the table or that RLS is on. The same file is already on `main` via merged PR #151. This branch keeps that copy.

## Sign-in session

`js/vendor/netlify-identity.js` stores `nf_jwt` and `nf_refresh` with `path=/`, `secure`, `samesite=lax`, and no `Max-Age` or `Expires`. They are browser-session cookies: they last until the browser session ends. The access token itself defaults to 3600 seconds when the identity response omits `expires_in`. `js/auth.js` calls `getUser()` before each API request, and that client refreshes the access token when it is close to expiry, using `nf_refresh`.

The browser copy of `nf_jwt` is not `httpOnly`. A script running on the page can read it. Moving it to an httpOnly cookie is a larger identity change and is not done here.

## Larger gaps left open

1. **Solar enquiries have nowhere to live.** A follow-up table (name, contact, system size, consent, created time) needs a migration and an owner-only read API. The assistant should keep answering without storing a person unless they ask to be contacted.
2. **Donations have no ledger.** PR #151 added `verify-paypal.mts` on `main`. A donations table is still a separate piece of work.
3. **Guest Arron memory.** A client-supplied memory id can be attached to a later signed-in user inside `arron.mts`. Binding a memory to the first user who claims it, and refusing a second user, needs a careful migration so existing chats are not wiped.
4. **Poker rooms trust the room code.** Stacks can be rewritten by anyone who knows the code. Fine for play chips. A seat secret would be the fix if rooms are abused.
5. **Scheduled writers have no shared secret of their own.** They rely on Netlify not exposing the schedule URL. Confirm in the Netlify UI that the functions are schedule-only.
6. **RLS is not proven live.** Run the SQL file, set `SUPABASE_SERVICE_KEY` in Netlify, and then try a read with the anon key. It should fail.
