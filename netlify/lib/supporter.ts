// ==============================================================
// Supporter / Full Depth — optional one-off 99p unlock (approved by Shane,
// 15 Nov 2026; see system_blueprint.json moneyModel).
//
// Pure logic, no I/O of its own: PayPal fetch, the one-time order store and
// the Identity role update are injected, so tests never touch PayPal,
// Blobs or Identity.
//
// The sanctuary stays free forever. Being a supporter NEVER unlocks crisis
// help, safety pages, Arron basic chat or any core page. It only adds the
// "supporter" Identity role (a badge) and, later, clearly optional extras.
//
// The existing £50 deposit check in paypal-verify.ts is left exactly as it
// is; this file reuses its order-id rule and store/deps shapes only.
// ==============================================================

import type { Deps } from "./paypal-verify.js";

// Same PayPal order-id rule as paypal-verify.ts (a test keeps the two in step).
export const ORDER_ID = /^[A-Z0-9]{10,32}$/;

export const SUPPORTER_ROLE = "supporter";
export const SUPPORTER_PRICE = { value: "0.99", currency: "GBP" } as const;
// custom_id the page puts on the PayPal order, so one person's payment can't
// be claimed by another account.
export const customIdFor = (userId: string) => `ps-supporter:${userId}`;

// Extras a supporter MAY get later. Nothing essential is ever listed here.
// TODO(hooks): longer Arron memory, extra Aura Hz sessions and downloads, extra
// brand-palette themes. Wire each behind `isSupporter(roles)` only once built.
export const OPTIONAL_EXTRAS = ["supporter-badge"] as const;
export const isSupporter = (roles: readonly string[] = []) => roles.includes(SUPPORTER_ROLE);

export type RoleAdmin = {
  getRoles(userId: string): Promise<string[]>;
  setRoles(userId: string, roles: string[]): Promise<void>;
};

export type SupporterDeps = Deps & { roles: RoleAdmin };

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

export const paypalConfigured = (env: Deps["env"]) =>
  Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET && env.PAYPAL_MERCHANT_ID);

// Adds the supporter role, keeping every role the member already has.
export async function grantSupporter(userId: string, roles: RoleAdmin) {
  const current = await roles.getRoles(userId);
  if (isSupporter(current)) return false;
  await roles.setRoles(userId, [...current, SUPPORTER_ROLE]);
  return true;
}

// Checks a captured PayPal order with PayPal itself, then grants the role.
export async function verifySupporter(raw: unknown, userId: string | null | undefined, deps: SupporterDeps): Promise<Result> {
  const { env } = deps;
  if (!paypalConfigured(env)) return out(503, { ok: false, configured: false });
  if (!userId) return out(401, { error: "Please sign in first." });

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out(400, { error: "Invalid request" });
  const orderID = (raw as Record<string, unknown>).orderID;
  if (typeof orderID !== "string" || !ORDER_ID.test(orderID)) return out(400, { error: "Invalid order id" });

  const key = `supporter:${orderID}`;
  const granted = async (repeat: boolean) => {
    await grantSupporter(userId, deps.roles);
    return out(200, { ok: true, verified: true, supporter: true, ...(repeat ? { repeat: true } : {}) });
  };

  try {
    const prior = await deps.store.get(key);
    if (prior !== null) {
      // Same order, same member: safe repeat (e.g. the role write failed last time).
      if (prior === userId) return await granted(true);
      return out(409, { ok: false, verified: false, error: "Order already used" });
    }

    const tokenRes = await deps.fetch(`${apiBase(env)}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
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
    const captured = captures.reduce(
      (sum, c) => sum + (c.status === "COMPLETED" && c.amount?.currency_code === SUPPORTER_PRICE.currency ? pence(c.amount?.value) : NaN),
      0,
    );

    const verified =
      order.status === "COMPLETED" &&
      units.length === 1 &&
      unit?.amount?.value === SUPPORTER_PRICE.value &&
      unit?.amount?.currency_code === SUPPORTER_PRICE.currency &&
      unit?.payee?.merchant_id === env.PAYPAL_MERCHANT_ID &&
      unit?.custom_id === customIdFor(userId) &&
      captures.length > 0 &&
      captured === pence(SUPPORTER_PRICE.value);

    if (!verified) return out(200, { ok: true, verified: false, status: order.status ?? null });

    if (!(await deps.store.setIfNew(key, userId))) {
      if ((await deps.store.get(key)) === userId) return await granted(true);
      return out(409, { ok: false, verified: false, error: "Order already used" });
    }
    return await granted(false);
  } catch {
    return out(500, { ok: false, error: "Verification failed" });
  }
}
