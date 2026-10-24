// Optional Firebase sidecar. Existing Netlify Identity and local saves stay in charge.
import { validateFirebaseConfig } from "./firebase-config.js";
const VERSION = "10.14.1";
const CDN = "https://www.gstatic.com/firebasejs/" + VERSION;
const TIMEOUT_MS = 5000;
export let firebaseConfig = null;
export let firebaseReady = false;
export let app = null, auth = null, db = null, storage = null;
export let authSdk = null, firestore = null, storageSdk = null;
export let analytics = null, appCheck = null;
export const firebaseStatus = { state: "not-configured", error: null };
function publishStatus() {
  if (typeof window !== "undefined") {
    window.PSFirebase = { ready: firebaseReady, app, auth, db, storage, authSdk, firestore, storageSdk, analytics, appCheck, status: firebaseStatus.state };
  }
}
publishStatus();
let timer;
try {
  const controller = new AbortController();
  timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const response = await fetch("/api/firebase-public-config", {
    cache: "no-store", credentials: "omit", signal: controller.signal,
  });
  if (!response.ok) throw new Error("Config unavailable");
  const payload = await response.json();
  clearTimeout(timer);
  if (payload?.configured === true) {
    firebaseConfig = validateFirebaseConfig(payload.config);
    if (!firebaseConfig) {
      firebaseStatus.state = "invalid-config";
    } else {
      const [core, a, f, s] = await Promise.race([
        Promise.all([
          import(CDN + "/firebase-app.js"),
          import(CDN + "/firebase-auth.js"),
          import(CDN + "/firebase-firestore.js"),
          import(CDN + "/firebase-storage.js"),
        ]),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("SDK unavailable")), TIMEOUT_MS); }),
      ]);
      const existing = core.getApps().find((candidate) => candidate.name === "[DEFAULT]");
      if (existing && (existing.options.projectId !== firebaseConfig.projectId || existing.options.appId !== firebaseConfig.appId)) {
        throw new Error("Different Firebase app already exists");
      }
      const nextApp = existing || core.initializeApp(firebaseConfig);
      const nextAuth = a.getAuth(nextApp);
      const nextDb = f.getFirestore(nextApp);
      const nextStorage = firebaseConfig.storageBucket ? s.getStorage(nextApp) : null;
      // Publish only after every requested service initializes successfully.
      app = nextApp; auth = nextAuth; db = nextDb; storage = nextStorage;
      authSdk = a; firestore = f; storageSdk = s;
      firebaseReady = true;
      firebaseStatus.state = "ready";
    }
  }
} catch {
  firebaseStatus.state = "unavailable";
  firebaseStatus.error = "Optional Firebase setup unavailable";
} finally {
  clearTimeout(timer);
  publishStatus();
}
if (!firebaseReady) console.info("[PS Firebase] Optional sync is off; existing local features remain available.");
// No sign-in, database reads/writes, local-storage access, Analytics or App Check here.
// SDK initialization is not proof of network connectivity or valid server-side rules.
