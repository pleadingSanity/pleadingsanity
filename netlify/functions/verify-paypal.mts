// ==============================================================
// Insane Solar — server-side check of the £50 refundable survey
// deposit. insane-solar.html POSTs { orderID } here after the
// PayPal button captures. We ask PayPal directly whether that order
// is COMPLETED for 50.00 GBP, so a forged client call cannot fake a
// paid deposit.
//
// Env (set in Netlify, never in the repo):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET   (required)
//   PAYPAL_ENV=sandbox                        (optional; default live)
//
// No customer name or email is logged. Returns 503 when the keys are
// not configured so the page keeps working without them.
// ==============================================================

import type { Context } from "@netlify/functions";
import { allow } from "../lib/rate-limit.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const ORDER_ID = /^[A-Z0-9]{10,32}$/;
const EXPECTED = { value: "50.00", currency: "GBP" };

function apiBase() {
  return (process.env.PAYPAL_ENV || "").toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

async function accessToken(id: string, secret: string): Promise<string | null> {
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) return json({ ok: false, configured: false }, 503);

  if (!(await allow("write", context))) return json({ error: "Too many requests" }, 429);

  let orderID: unknown;
  try {
    orderID = ((await req.json()) as Record<string, unknown>).orderID;
  } catch {
    orderID = undefined;
  }
  if (typeof orderID !== "string" || !ORDER_ID.test(orderID)) {
    return json({ error: "Invalid order id" }, 400);
  }

  try {
    const token = await accessToken(id, secret);
    if (!token) {
      console.error("verify-paypal: token request failed");
      return json({ ok: false, error: "Payment provider unavailable" }, 502);
    }
    const res = await fetch(`${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return json({ ok: false, verified: false, error: "Order not found" }, 404);
    if (!res.ok) return json({ ok: false, error: "Payment provider unavailable" }, 502);

    const order = (await res.json()) as {
      status?: string;
      purchase_units?: { amount?: { value?: string; currency_code?: string } }[];
    };
    const amount = order.purchase_units?.[0]?.amount;
    const verified =
      order.status === "COMPLETED" &&
      amount?.value === EXPECTED.value &&
      amount?.currency_code === EXPECTED.currency;

    console.log(`verify-paypal: order ${verified ? "verified" : "rejected"} (status ${order.status ?? "unknown"})`);
    return json({ ok: true, verified, status: order.status ?? null });
  } catch (error) {
    console.error("verify-paypal:", error instanceof Error ? error.name : "error");
    return json({ ok: false, error: "Verification failed" }, 500);
  }
};

// No custom path: Netlify serves this at its default /.netlify/functions/verify-paypal,
// which is what insane-solar.html calls.
