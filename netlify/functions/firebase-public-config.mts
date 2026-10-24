// Public Firebase web configuration only. Never expose private environment values.
// This is an opt-in sidecar; Netlify Identity and existing data remain unchanged.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return new Response(null, { status: 405 });
  const required = ["FIREBASE_WEB_API_KEY", "FIREBASE_WEB_APP_ID", "FIREBASE_WEB_AUTH_DOMAIN", "FIREBASE_PROJECT_ID"];
  const values = required.map((key) => process.env[key]?.trim() || "");
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (values.some((value) => !value || value.startsWith("PASTE_"))) {
    return new Response(JSON.stringify({ configured: false }), { status: 200, headers });
  }
  const [apiKey, appId, authDomain, projectId] = values;
  if (projectId !== "pleading-sanity-36bfa") {
    return new Response(JSON.stringify({ configured: false }), { status: 200, headers });
  }
  return new Response(JSON.stringify({ configured: true, config: {
    apiKey, appId, authDomain, projectId,
    storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET?.trim() || undefined,
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID?.trim() || undefined,
    measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID?.trim() || undefined
  } }), { status: 200, headers });
}
export const config = { path: "/api/firebase-public-config" };
