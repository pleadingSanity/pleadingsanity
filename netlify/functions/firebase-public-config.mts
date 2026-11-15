import { validateFirebaseConfig } from "../../js/firebase-config.js";

// Public Firebase web config only; never enumerate or return the environment.
const ENV_FIELDS = {
  apiKey: "FIREBASE_WEB_API_KEY",
  appId: "FIREBASE_WEB_APP_ID",
  authDomain: "FIREBASE_WEB_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_WEB_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_WEB_MESSAGING_SENDER_ID",
  measurementId: "FIREBASE_WEB_MEASUREMENT_ID",
};
function json(body: object, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  } });
}
export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, { Allow: "GET" });
    // This endpoint accepts no payload, query options, or caller-supplied config.
    if (new URL(request.url).search || request.body !== null ||
        (request.headers.has("content-length") && request.headers.get("content-length") !== "0") ||
        request.headers.has("transfer-encoding")) return json({ error: "No query or request body is accepted" }, 400);
    const values: Record<string, string | undefined> = {};
    for (const [field, key] of Object.entries(ENV_FIELDS)) values[field] = process.env[key];
    const publicConfig = validateFirebaseConfig(values);
    return json(publicConfig ? { configured: true, config: publicConfig } : { configured: false });
  } catch {
    // No raw exception/config values in logs or responses, even on runtime failure.
    return json({ configured: false, error: "Configuration temporarily unavailable" }, 503);
  }
}
export const config = { path: "/api/firebase-public-config" };
