// ==============================================================
// Insane Solar — server-side check of the £50 refundable survey
// deposit. insane-solar.html POSTs { orderID, enquiryRef } here after the
// PayPal button captures. We ask PayPal directly whether that order
// is COMPLETED and captured for 50.00 GBP to our merchant, tagged with this
// visit's enquiry reference (custom_id), and each order verifies once, so a forged client call cannot fake a
// paid deposit.
//
// Env (set in Netlify, never in the repo):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET   (required)
//   PAYPAL_MERCHANT_ID                        (required; expected payee)
//   PAYPAL_ENV=sandbox                        (optional; default live)
//
// No customer name or email is logged. Returns 503 when the keys are
// not configured so the page keeps working without them.
// ==============================================================

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow } from "../lib/rate-limit.js";
import { readDepositBody, verifyDeposit } from "../lib/paypal-verify.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const env = process.env;
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.PAYPAL_MERCHANT_ID) {
    return json({ ok: false, configured: false }, 503);
  }

  if (!(await allow("write", context))) return json({ error: "Too many requests" }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const input = readDepositBody(raw);
  if (!input) return json({ error: "Invalid request" }, 400);

  const store = getStore("paypal-orders");
  const { status, body: result } = await verifyDeposit(
    input,
    {
      fetch,
      env,
      store: {
        get: (key) => store.get(key),
        setIfNew: async (key, value) => (await store.set(key, value, { onlyIfNew: true })).modified,
      },
    },
  );
  console.log(`verify-paypal: ${status}${result.verified === true ? " verified" : ""}`);
  return json(result, status);
};

// No custom path: Netlify serves this at its default /.netlify/functions/verify-paypal,
// which is what insane-solar.html calls.
