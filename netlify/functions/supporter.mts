// ==============================================================
// Supporter / Full Depth — optional one-off 99p (see netlify/lib/supporter.ts)
//   GET  /api/supporter         { configured, clientId, signedIn, supporter, userId }
//   POST /api/supporter/verify  { orderID }  -> checks the captured order with
//        PayPal, records it once (Blobs "supporter-orders") and adds the
//        "supporter" Netlify Identity role to the signed-in member.
//
// Env (Netlify only, never in the repo): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
// PAYPAL_MERCHANT_ID, optional PAYPAL_ENV=sandbox. The client ID is public by
// design (the PayPal JS SDK needs it in the browser); the secret never leaves here.
// No names, emails or order details are logged.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { admin, getUser } from "@netlify/identity";
import { allow } from "../lib/rate-limit.js";
import { isSupporter, paypalConfigured, verifySupporter, type RoleAdmin } from "../lib/supporter.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const roles: RoleAdmin = {
  getRoles: async (id) => (await admin.getUser(id)).roles ?? [],
  setRoles: async (id, list) => {
    await admin.updateUser(id, { app_metadata: { roles: list } });
  },
};

async function signedIn() {
  try {
    return await getUser();
  } catch {
    return null;
  }
}

export default async (req: Request, context: Context) => {
  const env = process.env;
  const path = new URL(req.url).pathname.replace(/\/+$/, "");

  if (req.method === "GET" && path === "/api/supporter") {
    const user = await signedIn();
    let supporter = false;
    if (user) {
      try {
        supporter = isSupporter(await roles.getRoles(user.id));
      } catch {
        supporter = isSupporter(user.roles ?? []);
      }
    }
    return json({
      configured: paypalConfigured(env),
      clientId: paypalConfigured(env) ? env.PAYPAL_CLIENT_ID : null,
      sandbox: (env.PAYPAL_ENV || "").toLowerCase() === "sandbox",
      signedIn: Boolean(user),
      userId: user?.id ?? null,
      supporter,
    });
  }

  if (req.method === "POST" && path === "/api/supporter/verify") {
    if (!paypalConfigured(env)) return json({ ok: false, configured: false }, 503);
    const user = await signedIn();
    if (!user) return json({ error: "Please sign in first." }, 401);
    if (!(await allow("write", context, user.id))) return json({ error: "Too many requests" }, 429);

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ error: "Invalid request" }, 400);
    }
    const store = getStore("supporter-orders");
    const { status, body } = await verifySupporter(raw, user.id, {
      fetch,
      env,
      roles,
      store: {
        get: (key) => store.get(key),
        setIfNew: async (key, value) => (await store.set(key, value, { onlyIfNew: true })).modified,
      },
    });
    console.log(`supporter: ${status}${body.verified === true ? " verified" : ""}`);
    return json(body, status);
  }

  return json({ error: "Not found" }, 404);
};

export const config: Config = { path: ["/api/supporter", "/api/supporter/verify"] };
