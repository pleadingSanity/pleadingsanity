// Pleading Sanity — one Firebase connection for the whole house.
// Firebase is only the backend. The website stays on Netlify.
//
// Load it on a page with:
//   <script type="module" src="/js/firebase.js"></script>
// or use it from your own module:
//   import { db, auth, firestore, firebaseReady } from "/js/firebase.js";
//
// Until appId below is filled in, this file does nothing
// (no network calls, no console errors), so it is safe to link today.
// Setup guide: /docs/FIREBASE-SETUP.md

const FIREBASE_VERSION = "10.14.1";
const CDN = "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION;

// The web apiKey and appId are public identifiers, not secrets. They are safe
// in GitHub. Security comes from the Firestore and Storage rules.
export const firebaseConfig = {
  apiKey: "AIzaSyCXJEEpk2RFmtNiI1dD4j0TzjT26nEnJho",
  authDomain: "pleading-sanity-36bfa.firebaseapp.com",
  projectId: "pleading-sanity-36bfa",
  storageBucket: "pleading-sanity-36bfa.firebasestorage.app",
  appId: "PASTE_APP_ID_HERE",
};

export const firebaseReady =
  !String(firebaseConfig.apiKey).startsWith("PASTE_") &&
  !String(firebaseConfig.appId).startsWith("PASTE_");

let app = null;
let auth = null;
let db = null;
let storage = null;
// The SDK modules themselves, so pages call the same version this file loaded:
//   firestore.getDoc(firestore.doc(db, "profiles", uid))
let authSdk = null;
let firestore = null;
let storageSdk = null;

if (firebaseReady) {
  try {
    const [appSdk, a, f, s] = await Promise.all([
      import(CDN + "/firebase-app.js"),
      import(CDN + "/firebase-auth.js"),
      import(CDN + "/firebase-firestore.js"),
      import(CDN + "/firebase-storage.js"),
    ]);
    // Reuse the app if another script already started it (no duplicate-app error).
    app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
    auth = a.getAuth(app);
    db = f.getFirestore(app);
    storage = s.getStorage(app);
    authSdk = a;
    firestore = f;
    storageSdk = s;
  } catch (err) {
    // A blocked CDN or offline visit must never break the page.
    console.warn("[firebase] not connected:", err && err.message ? err.message : err);
  }
}

// Handy for a quick check in the browser console: PSFirebase.ready
if (typeof window !== "undefined") {
  window.PSFirebase = { ready: Boolean(app), app, auth, db, storage, authSdk, firestore, storageSdk };
}

export { app, auth, db, storage, authSdk, firestore, storageSdk };
