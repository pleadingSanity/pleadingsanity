// Pure verification logic for the £50 Insane Solar deposit. Provider fetch and
// the consumption store are injected so tests never touch PayPal or storage.

export const EXPECTED = { value: "50.00", currency: "GBP" };
export const ORDER_ID = /^[A-Z0-9]{10,32}$/;
export const ENQUIRY_REF = /^[A-Za-z0-9_-]{16,64}$/;

export type OrderStore = {
  get(key: string): Promise<string | null>;
  // Must only write when the key is absent; returns false when it already existed.
  setIfNew(key: string, value: string): Promise<boolean>;
};

export type Deps = {
  fetch: typeof fetch;
  store: OrderStore;
  env: Record<string, string | undefined>;
};

type Result = { status: number; body: Record<string, unknown> };
const out = (status: number, body: Record<string, unknown>): Result => ({ status, body });

const apiBase = (env: Deps["env"]) =>
  (env.PAYPAL_ENV || "").toLowerCase() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

type Capture = { status?: string; amount?: { value?: string; currency_code?: string } };
type Order = {
  status?: string;
  purchase_units?: {
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payee?: { merchant_id?: string };
    payments?: { captures?: Capture[] };
  }[];
};

const pence = (v?: string) => (v && /^\d+\.\d{2}$/.test(v) ? Number(v.replace(".", "")) : NaN);

export async function verifyDeposit(input: { orderID: unknown; enquiryRef: unknown }, deps: Deps): Promise<Result> {
  const { env } = deps;
  const id = env.PAYPAL_CLIENT_ID;
  const secret = env.PAYPAL_CLIENT_SECRET;
  const merchant = env.PAYPAL_MERCHANT_ID;
  if (!id || !secret || !merchant) return out(503, { ok: false, configured: false });

  const { orderID, enquiryRef } = input;
  if (typeof orderID !== "string" || !ORDER_ID.test(orderID)) return out(400, { error: "Invalid order id" });
  if (typeof enquiryRef !== "string" || !ENQUIRY_REF.test(enquiryRef)) return out(400, { error: "Invalid enquiry reference" });

  try {
    const prior = await deps.store.get(`order:${orderID}`);
    if (prior !== null) {
      // Same order for the same enquiry is a safe repeat; anything else is a replay.
      if (prior === enquiryRef) return out(200, { ok: true, verified: true, status: "COMPLETED", repeat: true });
      return out(409, { ok: false, verified: false, error: "Order already used" });
    }

    const tokenRes = await deps.fetch(`${apiBase(env)}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const token = tokenRes.ok ? ((await tokenRes.json()) as { access_token?: string }).access_token : undefined;
    if (!token) return out(502, { ok: false, error: "Payment provider unavailable" });

    const res = await deps.fetch(`${apiBase(env)}/v2/checkout/orders/${encodeURIComponent(orderID)}`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.status === 404) return out(404, { ok: false, verified: false, error: "Order not found" });
    if (!res.ok) return out(502, { ok: false, error: "Payment provider unavailable" });

    const order = (await res.json()) as Order;
    const units = order.purchase_units ?? [];
    const unit = units[0];
    const captures = unit?.payments?.captures ?? [];
    const captured = captures.reduce((sum, c) => sum + (c.status === "COMPLETED" && c.amount?.currency_code === EXPECTED.currency ? pence(c.amount?.value) : NaN), 0);

    const verified =
      order.status === "COMPLETED" &&
      units.length === 1 &&
      unit?.amount?.value === EXPECTED.value &&
      unit?.amount?.currency_code === EXPECTED.currency &&
      unit?.payee?.merchant_id === merchant &&
      unit?.custom_id === enquiryRef &&
      captures.length > 0 &&
      captured === pence(EXPECTED.value);

    if (!verified) return out(200, { ok: true, verified: false, status: order.status ?? null });

    if (!(await deps.store.setIfNew(`order:${orderID}`, enquiryRef))) {
      const winner = await deps.store.get(`order:${orderID}`);
      if (winner === enquiryRef) return out(200, { ok: true, verified: true, status: "COMPLETED", repeat: true });
      return out(409, { ok: false, verified: false, error: "Order already used" });
    }
    return out(200, { ok: true, verified: true, status: "COMPLETED" });
  } catch {
    return out(500, { ok: false, error: "Verification failed" });
  }
}
