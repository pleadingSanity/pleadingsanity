// Pleading Sanity Firebase sidecar. Existing Netlify Identity remains authoritative.
// Public web identifiers are served by /api/firebase-public-config (Netlify env).
// Never put service-account credentials or private tokens in this module.
// Import: import { db, auth, firestore, firebaseReady } from "/js/firebase.js";
const VERSION = "10.14.1";
const CDN = "https://www.gstatic.com/firebasejs/" + VERSION;
export let firebaseConfig = null;
export let firebaseReady = false;
export let app = null, auth = null, db = null, storage = null;
export let authSdk = null, firestore = null, storageSdk = null;
export let analytics = null, appCheck = null;
export const firebaseStatus = { state: "not-configured", error: null };
function publishStatus() {
  if (typeof window !== "undefined") {
    window.PSFirebase = { ready: Boolean(app), app, auth, db, storage, authSdk, firestore, storageSdk, analytics, appCheck, status: firebaseStatus.state };
  }
}
publishStatus();
try {
  // No credentials set? Return harmlessly; the rest of the website works as before.
  const response = await fetch("/api/firebase-public-config", { cache: "no-store", credentials: "omit" });
  if (response.ok) {
    const payload = await response.json();
    const config = payload?.config;
    if (payload.configured && config?.apiKey && config?.appId && config?.projectId === "pleading-sanity-36bfa") {
      firebaseConfig = config;
      const [core, a, f, s] = await Promise.all([
        import(CDN + "/firebase-app.js"),
        import(CDN + "/firebase-auth.js"),
        import(CDN + "/firebase-firestore.js"),
        import(CDN + "/firebase-storage.js")
      ]);
      const existing = core.getApps().find((candidate) => candidate.name === "[DEFAULT]");
      if (existing && (existing.options.projectId !== config.projectId || existing.options.appId !== config.appId)) {
        throw new Error("Existing Firebase default app has different configuration; refusing to replace it.");
      }
      app = existing || core.initializeApp(config);
      auth = a.getAuth(app);
      db = f.getFirestore(app);
      storage = config.storageBucket ? s.getStorage(app) : null;
      authSdk = a;
      firestore = f;
      storageSdk = s;
      firebaseReady = true;
      firebaseStatus.state = "ready";
    }
  }
} catch (error) {
  firebaseStatus.state = "unavailable";
  firebaseStatus.error = error instanceof Error ? error.message : String(error);
  console.warn("[PS Firebase] Optional integration unavailable:", firebaseStatus.error);
}
publishStatus();
// Analytics and App Check remain off until explicit consent, provider registration,
// and production rules are independently verified. Do not enable them by default.
