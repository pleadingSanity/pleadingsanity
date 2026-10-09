# Pleading Sanity — Firebase Backend Setup

Website: https://pleadingsanity.co.uk (stays on Netlify, always)
Firebase project: `pleading-sanity-36bfa`
Firebase is **only** the backend. Nothing moves. Nothing gets rewritten.

## Status — 10 Oct 2026
- The public web API key is already in `js/firebase.js`. Netlify smart scan flagged it on PR 57. That flag was a false positive. The safelist is a site env setting. Do not delete the key.
- `appId` is still `PASTE_APP_ID_HERE`. No real web app id was in the repo, Netlify env, or Drive. The Drive file named `config.js` is a demo. Do not paste it.
- Until the app id from Firebase console step 3 is pasted, the client stays off on purpose. Netlify functions stay the live backend.

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

The rest of this guide is unchanged from main. Register the web app, paste `appId`, publish the rules, then the client can start.
