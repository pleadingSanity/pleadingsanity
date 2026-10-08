# Pleading Sanity — Firebase Backend Setup

Website: https://pleadingsanity.co.uk (stays on Netlify, always)
Firebase project: `pleading-sanity-36bfa`
Firebase is **only** the backend. Nothing moves. Nothing gets rewritten.

What is already in the repo:

| File | What it is |
|---|---|
| `js/firebase.js` | The one Firebase connection (app, auth, firestore, storage). Safe to link today — it does nothing until you paste your keys. |
| `firebase/firestore.rules` | Database rules, paste-ready. |
| `firebase/storage.rules` | File-upload rules, paste-ready. |
| `docs/FIREBASE-SETUP.md` | This guide. |

> 💛 **Honest note first.** The site already has a working free backend on Netlify
> (Netlify Identity for logins, Netlify Database for posts, journals and the feed).
> Firebase is set up here *alongside* it and nothing is switched off. Before moving a
> live feature over, decide which one is the home for that data — running the same
> feature on two databases means two places to look after.

---

## 1️⃣ The config file — `js/firebase.js`

Already written. The only thing you change is two lines:

```js
apiKey: "PASTE_API_KEY_HERE",
appId: "PASTE_APP_ID_HERE",
```

Everything else (`projectId`, `authDomain`, `storageBucket`) is filled in.

How it behaves:
- Loads Firebase straight from Google's CDN — no npm, no build.
- Never starts twice (it reuses the app if one already exists).
- If the keys are still placeholders, or the visitor is offline, it quietly does nothing — no broken page, no red console.
- Exposes `window.PSFirebase` so you can check it from the browser console.

Using it in a page:

```html
<script type="module">
  import { db, auth, firestore, authSdk, firebaseReady } from "/js/firebase.js";
  if (firebaseReady && db) {
    const snap = await firestore.getDocs(firestore.collection(db, "posts"));
    console.log("posts:", snap.size);
  }
</script>
```

---

## 2️⃣ Firestore blueprint — every collection

Types: `string`, `number`, `boolean`, `timestamp` (use `serverTimestamp()`), `array`, `map`.
`uid` always means the Firebase Auth user id.

### `users/{uid}` — private account info (only the owner can see it)
| Field | Type | What it's for |
|---|---|---|
| `uid` | string | Same as the document id. Must match the signed-in user. |
| `email` | string | Sign-in email. |
| `provider` | string | `"password"` or `"google.com"`. |
| `createdAt` | timestamp | When they joined. Can't be changed later. |
| `lastSeenAt` | timestamp | Last visit. |
| `settings` | map | e.g. `{ reducedMotion: true, theme: "sky" }`. |
| `consentAt` | timestamp | When they agreed to the privacy page. |

### `profiles/{uid}` — public display info (everyone can read)
| Field | Type | What it's for |
|---|---|---|
| `displayName` | string (≤ 60) | Name shown on posts. **Required.** |
| `handle` | string | Lower-case `@name`. |
| `bio` | string | Short "about me". |
| `photoURL` | string | Link to picture in `profiles/{uid}/` storage. |
| `isCreator` | boolean | **Only you set this, in the Console.** Lets them schedule lives. Starts `false`. |
| `verified` | boolean | **Only you set this, in the Console.** Starts `false`. |
| `followerCount` | number | Display only. |
| `followingCount` | number | Display only. |
| `createdAt` | timestamp | Can't be changed later. |
| `updatedAt` | timestamp | Last edit. |

### `follows/{followerId}_{followingId}` — who follows who
The document id **must** be `followerId + "_" + followingId` — that stops double-follows for free.

| Field | Type | What it's for |
|---|---|---|
| `followerId` | string | The person doing the following (must be you). |
| `followingId` | string | The person being followed (can't be yourself). |
| `createdAt` | timestamp | When. |

Unfollow = delete the document. Follows can't be edited.

### `lives/{liveId}` — scheduled creator sessions
| Field | Type | What it's for |
|---|---|---|
| `creatorId` | string | Creator's uid. Can't be changed. |
| `title` | string (≤ 120) | Session name. **Required.** |
| `description` | string | What it's about. |
| `startsAt` | timestamp | Scheduled start. |
| `durationMins` | number | Planned length. |
| `status` | string | `"scheduled"`, `"live"`, `"ended"`, `"cancelled"`. |
| `streamUrl` | string | Link to where the live actually plays. |
| `coverURL` | string | Picture in `lives/{creatorId}/` storage. |
| `tags` | array of string | e.g. `["calm","music"]`. |
| `createdAt` | timestamp | When it was made. |

Only people with `isCreator: true` on their profile can create one.

### `posts/{postId}` — community feed
| Field | Type | What it's for |
|---|---|---|
| `authorId` | string | Writer's uid. Can't be changed. |
| `authorName` | string | Copy of their display name (saves a read per post). |
| `text` | string (≤ 2000) | The post. **Required.** |
| `imageURL` | string | Optional picture. |
| `mood` | string | Optional, e.g. `"hopeful"`. |
| `likeCount` | number | Display only. |
| `createdAt` | timestamp | Can't be changed. |
| `updatedAt` | timestamp | Last edit. |

To take a harmful post down: delete it in the Console.

### `creator_applications/{autoId}` — people wanting creator status
| Field | Type | What it's for |
|---|---|---|
| `name` | string (≤ 80) | **Required.** |
| `email` | string (≤ 120) | **Required.** How you reply. |
| `about` | string (≤ 2000) | **Required.** What they want to create. |
| `links` | array of string | Optional portfolio links. |
| `uid` | string | Optional — if signed in, must be their own uid. |
| `status` | string | Must be `"pending"` when sent. You change it in the Console. |
| `createdAt` | timestamp | When sent. |

Nobody can read these from the website — only you, in the Console.

---

## 3️⃣ Security rules

- **Firestore:** copy everything in `firebase/firestore.rules`.
- **Storage:** copy everything in `firebase/storage.rules`.

What they enforce, in plain English:
- Anyone can read profiles, lives, posts and follows.
- You can only write, edit or delete your own things.
- Nobody can make themselves a creator or verified — only you can, in the Console.
- Anyone can send a creator application; nobody can read them except you.
- Storage: profile pictures (≤ 5 MB) and live covers (≤ 10 MB) are images only and owner-only; `content/` is upload-by-you-only.
- Anything not listed is closed. No open write anywhere.

---

## 4️⃣ Step-by-step setup — one action per step

1. Go to https://console.firebase.google.com and open **pleading-sanity-36bfa**.
2. Click the **⚙️ gear → Project settings**. Under **Your apps**, click the **`</>` (Web)** icon. Nickname: `pleadingsanity-web`. **Don't** tick "Firebase Hosting". Click **Register app**.
3. Copy the `apiKey` and `appId` it shows you. Paste them into `js/firebase.js` in place of the two `PASTE_…` lines.
4. Left menu → **Build → Authentication → Get started**.
5. **Sign-in method** tab → **Email/Password** → Enable → Save.
6. **Sign-in method** tab → **Google** → Enable → pick your support email → Save.
7. **Settings** tab → **Authorized domains** → **Add domain**: `pleadingsanity.co.uk`. Add again: `pleadingsanity.uk`. Add again: `pleadingsanity.netlify.app`.
8. Left menu → **Build → Firestore Database → Create database**.
9. Location: **`europe-west2` (London)** — closest to your people. ⚠️ This can never be changed later.
10. Choose **Start in production mode** → Create.
11. Open the **Rules** tab. Delete what's there. Paste all of `firebase/firestore.rules`. Click **Publish**.
12. **Storage — 🔜 COMING SOON (read the money note below first).** When you're ready: **Build → Storage → Get started**, then **Rules** tab → paste all of `firebase/storage.rules` → **Publish**.
13. Collections: you **don't have to** create any by hand — Firestore makes them on the first write. If you want to see them in the Console now, click **Start collection** and make `profiles` with one test document (any id, field `displayName` = `"Test"`), then delete it after. Do the same for `posts` if you like.
14. Let the browser talk to Firebase. The site has a strict security header (CSP) in `netlify.toml` that blocks outside scripts. On **only the pages that use Firebase**, add these to their `Content-Security-Policy` line:
    - `script-src` add: `https://www.gstatic.com`
    - `connect-src` add: `https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com`
    - `frame-src` change `'none'` to: `https://pleading-sanity-36bfa.firebaseapp.com` (needed for Google sign-in)
    - `img-src` add: `https://firebasestorage.googleapis.com https://lh3.googleusercontent.com`

    Without this step the file stays quiet and harmless — it just won't connect.
15. Add one line to the `<head>` of the page you want it on (e.g. `index.html`):
    ```html
    <script type="module" src="/js/firebase.js"></script>
    ```
16. Test: open the page, press **F12 → Console**, type `PSFirebase.ready` and press Enter. `true` = connected. `false` = keys still placeholders, or step 14 missing on that page.
17. Push to GitHub `main`. Netlify deploys by itself — nothing to click.

---

## 5️⃣ Free & safe — best practices

### 💷 What's free (Spark plan, no card needed)
| Thing | Free amount | Watch for |
|---|---|---|
| Firestore reads | 50,000 / day | The feed — each post shown is 1 read. Load 20 at a time, not everything. |
| Firestore writes | 20,000 / day | Don't write on every keystroke or scroll. |
| Firestore deletes | 20,000 / day | |
| Firestore stored data | 1 GiB | Text is tiny. Keep pictures out of Firestore. |
| Network out | 10 GiB / month | |
| Auth — Email & Google | Free | |

On Spark, if you hit a limit, that feature pauses until midnight (Pacific time). **You are never charged on Spark.**

### ⚠️ Things that cost money — said clearly
- **Storage (file uploads):** Google now requires the **Blaze (pay-as-you-go) plan with a card on file** to switch Storage on for new projects. There's still a free allowance (around 5 GB stored), but only if the bucket is in a US region (e.g. `us-central1`), and going over it is charged. That's why Storage is marked 🔜 **COMING SOON**. If you do turn it on: set a **budget alert** (Google Cloud Console → Billing → Budgets) at £1 first. Free alternative already on your Netlify plan: **Netlify Blobs**, which the site can use for pictures.
- **Phone / SMS sign-in:** charged per text. Don't enable.
- **Cloud Functions:** need Blaze. Not needed — the site already has free Netlify Functions.
- **Firebase Hosting:** not needed. Netlify is the home.

### 🚫 Don't enable unless you actually need it
Phone auth · Cloud Functions · Realtime Database (you have Firestore) · Firebase Hosting · Extensions · Analytics (the site is privacy-first, no tracking) · A/B Testing · Remote Config · Firebase ML.

### 🔑 Keys — what's safe, what never goes on GitHub
- ✅ **Safe in code:** `apiKey`, `appId`, `projectId`, `authDomain`, `storageBucket`, `messagingSenderId`. These are public labels, not passwords. The rules are what protect the data.
- ✅ **Free extra lock:** Google Cloud Console → APIs & Services → Credentials → your **Browser key** → Application restrictions → **Websites** → add `https://pleadingsanity.co.uk/*`, `https://pleadingsanity.uk/*`, `https://*.netlify.app/*`.
- ❌ **Never on GitHub:** any **service account JSON** file (has `"private_key"` in it), Admin SDK credentials, your Google password. If one ever leaks: Google Cloud Console → IAM → Service accounts → delete that key straight away.

### ✅ Pre-launch checklist
- [ ] `apiKey` and `appId` pasted in `js/firebase.js`
- [ ] Email/Password and Google sign-in turned on
- [ ] `pleadingsanity.co.uk`, `pleadingsanity.uk`, `pleadingsanity.netlify.app` in Authorized domains
- [ ] Firestore created in `europe-west2`, production mode
- [ ] Firestore rules pasted and **Published**
- [ ] CSP updated on the pages that use Firebase (step 14)
- [ ] `PSFirebase.ready` says `true`
- [ ] Test: signed out, try to write a post → it's refused (that's good)
- [ ] Test: signed in, write your own post → works; edit someone else's → refused
- [ ] Billing still says **Spark** (unless you chose Blaze for Storage, with a budget alert)

### 🛟 If something stops working
| What you see | What it means | Fix |
|---|---|---|
| `PSFirebase.ready` is `false` | Keys are placeholders, or CSP is blocking | Steps 3 and 14. |
| `Refused to load script … gstatic` | CSP blocking | Step 14 on that page. |
| `auth/unauthorized-domain` | Domain not listed | Step 7. |
| `Missing or insufficient permissions` | The rules said no — usually working as designed | Check you're signed in and writing your own document with the right field (`authorId`, `creatorId`, `followerId`). |
| `quota exceeded` / `resource-exhausted` | Hit a free daily limit | Waits until midnight Pacific. Load fewer items per page. |
| Rules change not working | Not published | Rules tab → **Publish**. Takes up to a minute. |
| Google sign-in popup closes instantly | `frame-src` missing | Step 14. |

Free first. Always. 💛
