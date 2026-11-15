// Public web identifiers only. Shared by the optional client and config endpoint.
export const FIREBASE_PROJECT_ID = "pleading-sanity-36bfa";
const FIELDS = ["apiKey", "appId", "authDomain", "projectId", "storageBucket", "messagingSenderId", "measurementId"];

export function validateFirebaseConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config = {};
  for (const field of FIELDS) {
    const item = value[field];
    if (item == null || item === "") continue;
    if (typeof item !== "string" || item.length > 200) return null;
    const clean = item.trim();
    if (!clean || /\s|PASTE_|YOUR_|placeholder|example|dummy/i.test(clean)) return null;
    config[field] = clean;
  }
  if (config.projectId !== FIREBASE_PROJECT_ID ||
      config.authDomain !== `${FIREBASE_PROJECT_ID}.firebaseapp.com` ||
      !/^AIza[\w-]{35}$/.test(config.apiKey || "")) return null;
  const appId = /^1:([1-9]\d*):web:([a-f0-9]{8,64})$/i.exec(config.appId || "");
  if (!appId || /^0+$/.test(appId[2])) return null;
  if (config.messagingSenderId && config.messagingSenderId !== appId[1]) return null;
  if (config.storageBucket && ![`${FIREBASE_PROJECT_ID}.firebasestorage.app`, `${FIREBASE_PROJECT_ID}.appspot.com`].includes(config.storageBucket)) return null;
  if (config.measurementId && !/^G-[A-Z0-9]+$/.test(config.measurementId)) return null;
  return config;
}
