# Pleading Sanity — optional Firebase setup

Website: https://pleadingsanity.co.uk · Netlify site: `pleadingsanity`.
Expected Firebase project ID: `pleading-sanity-36bfa`. Check the **Project ID** in
Firebase Console → Project settings → General. A similar display name is not proof
of project identity. Do not substitute `pleadingsanity` or `pleading-sanity`.

## Current scope — 24 October 2026, PR #104

The sidecar exposes the existing `firebaseConfig`, `firebaseReady`, `app`, `auth`,
`db`, `storage`, `authSdk`, `firestore` and `storageSdk` exports. Existing Netlify
Identity, Netlify Database, journals and game saves continue using their existing
code. No page currently imports this optional module; setting config alone does
not connect sign-in or data across the sanctuary. No migration is included.

- `netlify/functions/firebase-public-config.mts` returns only allowlisted public
  web identifiers. Missing, malformed, placeholder or mismatched config returns
  `{ "configured": false }`. There are no Firebase requests from this function.
- `js/firebase.js` fetches that config from the same origin, then dynamically loads
  the existing SDK version 10.14.1 only when config passes validation. Blocked CDN,
  offline or partial initialization leaves `firebaseReady` false. Network/SDK
  waits are bounded. Existing local saves are neither read nor rewritten.
- `window.PSFirebase.ready` means SDK services initialized locally. It does **not**
  prove that Firestore is enabled, rules are deployed or remote data is accessible.
- Analytics and App Check stay off. A measurement ID alone does not enable either.
- Existing `firebase/firestore.rules` and `firebase/storage.rules` are blueprints,
  not evidence of the rules or services currently deployed in Firebase Console.

## Copy the Web app config into Netlify

In the correct Firebase project, choose Project settings → General → Your apps →
Web app → SDK setup and configuration → Config. If no Web app exists, register a
Web app in this existing project; Firebase Hosting is unnecessary. Copy values
from that one config object; do not invent them or mix projects.

Netlify → `pleadingsanity` → Site configuration → Environment variables. Give
these variables **Functions** scope. Use Deploy Previews first; Production can be
set when the preview and intended feature integration have been reviewed.

| Netlify variable | Firebase config field | Required? |
|---|---|---|
| `FIREBASE_PROJECT_ID` | `projectId`: `pleading-sanity-36bfa` | Yes |
| `FIREBASE_WEB_AUTH_DOMAIN` | `authDomain`: `pleading-sanity-36bfa.firebaseapp.com` | Yes |
| `FIREBASE_WEB_API_KEY` | `apiKey` | Yes |
| `FIREBASE_WEB_APP_ID` | `appId`, in `1:…:web:…` format | Yes |
| `FIREBASE_WEB_STORAGE_BUCKET` | `storageBucket` | Optional; leave blank for £0 plan |
| `FIREBASE_WEB_MESSAGING_SENDER_ID` | `messagingSenderId`, matching the app's project number | Optional |
| `FIREBASE_WEB_MEASUREMENT_ID` | `measurementId` | Optional; Analytics remains off |

These seven identifiers are public when the endpoint returns them. Never put
service-account JSON, private keys, Admin credentials, access tokens or user data
in any of them. Other server secrets remain private. `.env.example` documents the
names; it does not inject environment values into a static browser page.
`window.__ENV` is not provided by this site. Legacy `FIREBASE_API_KEY` and
`FIREBASE_MESSAGING_SENDER_ID` are not read by this endpoint.

Changing environment variables requires a new deploy of the appropriate context.
Use the existing PR preview workflow. A production redeploy alone does not wire
Firebase into pages, authenticate a user or authorize Firestore access.

## £0 policy and billing warning

Keep the intended project on Spark. Actual service use must fit its quotas;
capacity has not been measured here. Do not add payment methods or upgrade to
Blaze without Shane's explicit spending approval. Cloud Storage for Firebase now
requires Blaze, so leave its variable blank; retain existing local/Netlify media
paths. Initializing an SDK is not enabling a server service.

The 20 October billing email named project ID `pleadingsanity`. The code expects
`pleading-sanity-36bfa`; this discrepancy does not establish that either project is
abandoned. Inspect exact project IDs, plan, services, dependencies and billing
status in Console before changing, pausing or deleting anything. A pending owner
invitation is not evidence of usable access. No billing change is part of this PR.

## Verify without touching live users

1. Locally run `node --experimental-vm-modules --test scripts/test-firebase.mjs`
   (Node 24). It uses synthetic identifiers and SDK stubs, never real Firebase
   accounts. It covers methods, malformed requests/config, offline/CDN failures,
   partial initialization, export compatibility and unchanged local save values.
2. Run `python3 scripts/audit-site.py` and `git diff --check`.
3. Open the existing Netlify PR preview at `/api/firebase-public-config`. With
   missing config it must return JSON `configured:false`, status 200 and
   `Cache-Control: no-store`. A POST must return JSON 405 with `Allow: GET`; query
   parameters must return JSON 400. Inspect response contents for public fields only.
4. With the complete **correct** config in Deploy Preview/Functions scope, redeploy
   that preview. Import `/js/firebase.js` from a test page or browser console, then
   inspect `PSFirebase.status` and the module's exports. A CSP may block Google's
   SDK or Firebase endpoints: inspect the specific consuming page's policy before
   authorizing narrow allowances. Do not loosen Arron, journal or finance CSPs.
5. Do not test by signing in as a live user or writing to production documents.
   Feature integration needs a separate approved test account/data plan, rules
   review and explicit UI wiring. Netlify Identity remains the current login.
6. In Firebase Console separately inspect Authentication providers/authorized
   domains, Firestore status and deployed rules. Their state cannot be inferred
   from `ready:true`. Keep Storage, Analytics and App Check unchanged until their
   intended use and setup are verified. App Check needs provider registration and
   testing before enforcement.

The API workflow always runs free contract tests. The old Mayhem template failed
before scanning because its launcher was missing and authentication returned 401.
An external Mayhem scan is now a manual opt-in requiring a valid approved token;
it targets only a local synthetic config fixture and produces no claim of a full
API audit. No external scan or subscription is enabled by default.

Rollback: revert PR #104. No users, documents, rules or saved games need restoring
because this patch does not change them.
