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

> 💛 **Honest note first.** The site already has a working free backend on Netlify (Netlify Identity for logins, Netlify Database for posts, journals and the feed). Firebase is set up here *alongside* it and nothing is switched off. Before moving a live feature over, decide which one is the home for that data — running the same feature on two databases means two places to look after.

---

## 1. The config file — `js/firebase.js`

Already written. The Firebase web API key is filled in. The only required placeholder remaining is `appId`: `PASTE_APP_ID_HERE`.

The project ID, auth domain and storage bucket are filled in. `messagingSenderId` is not required for Email/Password + Google sign-in and Firestore. Add it only if a feature such as Firebase Cloud Messaging needs it.

How it behaves:
- Loads Firebase from Google's CDN. No npm. No build.
- Never starts twice.
- If the keys are still placeholders, or the visitor is offline, it does nothing.
- Exposes `window.PSFirebase` for a console check.

---

## 2. Firestore blueprint

`uid` always means the Firebase Auth user id.

- `users/{uid}` private: uid, email, provider, createdAt, lastSeenAt, settings, consentAt. Owner only.
- `profiles/{uid}` public: displayName required, handle, bio, photoURL, isCreator false, verified false, counts, createdAt, updatedAt. Only you set creator or verified, in the Console.
- `follows/{followerId}_{followingId}`: document id must be follower plus underscore plus following. No self-follow. Unfollow deletes it.
- `lives/{liveId}`: creatorId, title required, description, startsAt, durationMins, status, streamUrl, coverURL, tags, createdAt. Only isCreator can create.
- `posts/{postId}`: authorId, authorName, text required max 2000, imageURL, mood, likeCount, createdAt, updatedAt.
- `creator_applications/{autoId}`: name, email, about required. status pending. Nobody can read these from the site.

---

## 3. Security rules

Paste `firebase/firestore.rules` and `firebase/storage.rules`. Anyone can read profiles, lives, posts and follows. People write only their own things. Creator and verified cannot be self-set. Storage images only, owner only. Anything not listed is closed.

---

## 4. Setup steps

1. Open https://console.firebase.google.com project pleading-sanity-36bfa.
2. Project settings, Your apps, web icon. Nickname pleadingsanity-web. Do not tick Firebase Hosting. Register app.
3. Copy appId into js/firebase.js. Do not replace the existing public web key.
4. Authentication, Email/Password on, Google on.
5. Authorized domains: pleadingsanity.co.uk, pleadingsanity.uk, pleadingsanity.netlify.app.
6. Firestore, location europe-west2, production mode. This location cannot be changed later.
7. Publish firestore.rules.
8. Storage stays off until you choose Blaze and a budget alert. Netlify Blobs already hold pictures.
9. On pages that use Firebase, CSP must allow gstatic.com, firestore.googleapis.com, identitytoolkit.googleapis.com, securetoken.googleapis.com, firebasestorage.googleapis.com, and frame pleading-sanity-36bfa.firebaseapp.com.
10. Test with PSFirebase.ready. true means connected. false means the app id is still a placeholder, or CSP is blocking.

---

## 5. Free and safe

Spark is free. Do not enable phone auth, Cloud Functions, Realtime Database, Firebase Hosting, Analytics, or ML. Never commit a service account JSON. Public web labels can stay in code. Rules protect the data.

Free first. Always.
