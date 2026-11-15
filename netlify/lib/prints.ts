// ==============================================================
// P.S Prints — 3D prints sold on the site with PayPal (additive).
// Money model (Shane, 15 Nov 2026): the sanctuary is free forever; physical
// goods are paid. This file is pure logic with no I/O of its own: PayPal
// fetch and the order store are injected so tests never touch PayPal or Blobs.
//
// Hard rule: an item in category "toy" can NEVER be live unless
// compliance === true AND compliance_ref names its technical file
// (Toys (Safety) Regulations 2011: EN 71 evidence, risk assessment,
// declaration of conformity, UKCA/CE marking, traceability label).
//
// Existing payment code (paypal-verify.ts, verify-paypal.mts, supporter.ts,
// insane-solar.html) is reused for shapes only and is not changed.
// ==============================================================

import type { Deps } from "./paypal-verify.js";

export const ORDER_ID = /^[A-Z0-9]{10,32}$/;
export const ORDER_REF = /^[A-Za-z0-9_-]{12,40}$/;
export const ITEM_ID = /^[a-z0-9][a-z0-9-]{1,59}$/;
export const PHOTO = /^(\/images\/3d-prints\/[a-z0-9._-]+\.(webp|jpe?g|png|svg)|\/api\/prints\/photo\/[a-z0-9._-]+\.(webp|jpe?g|png))$/i;

export const CATEGORIES = ["toy", "desk", "keyring", "organiser", "merch", "home"] as const;
export const COLOURS = ["black", "white", "black-white"] as const;
export const STATUSES = ["draft", "live", "retired"] as const;
export const AGE_RATINGS = ["adult", "14+", "8+", "3+", "0+"] as const;
export const MAX_QTY = 5;
export const CURRENCY = "GBP";

export type PrintItem = {
  id: string;
  name: string;
  description: string;
  material: string;
  colour: (typeof COLOURS)[number];
  price_gbp: number;
  photo: string | null;
  photo_alt: string;
  mockup: boolean;
  age_rating: (typeof AGE_RATINGS)[number];
  category: (typeof CATEGORIES)[number];
  status: (typeof STATUSES)[number];
  compliance: boolean;
  compliance_ref: string;
  stock: number;
  made_to_order: boolean;
  weight_g?: number | null;
  print_hours?: number | null;
  updated_at?: string;
};

type Result = { status: number; body: Record<string, unknown> };
const out = (status: number, body: Record<string, unknown>): Result => ({ status, body });

const clean = (value: unknown, max: number) =>
  String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const EMOJI = /\p{Extended_Pictographic}/u;
const pick = <T extends readonly string[]>(list: T, value: unknown): T[number] | null =>
  (list as readonly string[]).includes(String(value)) ? (String(value) as T[number]) : null;

export const isToy = (item: Pick<PrintItem, "category">) => item.category === "toy";

// Every reason an item may not be sold. Empty list = may go live.
export function liveBlockers(item: Partial<PrintItem>): string[] {
  const reasons: string[] = [];
  if (!(typeof item.price_gbp === "number" && Number.isFinite(item.price_gbp) && item.price_gbp > 0)) reasons.push("price");
  if (!item.photo || !PHOTO.test(item.photo)) reasons.push("photo");
  if (item.mockup !== false) reasons.push("real photo (mockups cannot be sold)");
  if (!(item.made_to_order === true || (Number.isInteger(item.stock) && (item.stock as number) > 0))) reasons.push("stock or made to order");
  if (item.category === "toy") {
    if (item.compliance !== true) reasons.push("toy compliance (technical file, EN 71 evidence, UKCA/CE label)");
    if (!clean(item.compliance_ref, 120)) reasons.push("toy technical file reference");
    if (item.age_rating === "adult") reasons.push("toy age rating");
  }
  return reasons;
}

export const canGoLive = (item: Partial<PrintItem>) => liveBlockers(item).length === 0;
// What the shop and checkout trust: marked live AND passes every rule.
export const isSellable = (item: Partial<PrintItem> | null | undefined) => Boolean(item && item.status === "live" && canGoLive(item));

// Validates one catalogue entry (from the file or the creator page).
export function cleanItem(raw: unknown): { item?: PrintItem; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { errors: ["Invalid item"] };
  const r = raw as Record<string, unknown>;
  const id = clean(r.id, 60).toLowerCase();
  if (!ITEM_ID.test(id)) errors.push("id: lower-case letters, numbers and dashes");
  const name = clean(r.name, 80);
  if (name.length < 2) errors.push("name");
  const description = clean(r.description, 600);
  if (description.length < 10) errors.push("description");
  const colour = pick(COLOURS, r.colour);
  if (!colour) errors.push("colour: black, white or black-white");
  const category = pick(CATEGORIES, r.category);
  if (!category) errors.push("category");
  const status = pick(STATUSES, r.status ?? "draft");
  if (!status) errors.push("status: draft, live or retired");
  const age_rating = pick(AGE_RATINGS, r.age_rating);
  if (!age_rating) errors.push("age rating");
  const price = Number(r.price_gbp);
  const price_gbp = Number.isFinite(price) ? Math.round(price * 100) / 100 : NaN;
  if (!(price_gbp > 0 && price_gbp <= 500)) errors.push("price between 0.01 and 500");
  const photo = r.photo == null || r.photo === "" ? null : clean(r.photo, 200);
  if (photo !== null && !PHOTO.test(photo)) errors.push("photo path");
  for (const [key, text] of [["name", name], ["description", description]] as const) if (EMOJI.test(text)) errors.push(`${key}: no emoji`);
  const stock = Number.isInteger(Number(r.stock)) ? Math.max(0, Math.min(999, Number(r.stock))) : 0;
  const num = (v: unknown) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

  if (errors.length) return { errors };
  const item: PrintItem = {
    id,
    name,
    description,
    material: clean(r.material, 40) || "PLA",
    colour: colour!,
    price_gbp,
    photo,
    photo_alt: clean(r.photo_alt, 160) || name,
    mockup: r.mockup !== false && r.mockup !== "false",
    age_rating: age_rating!,
    category: category!,
    status: status!,
    compliance: r.compliance === true || r.compliance === "true",
    compliance_ref: clean(r.compliance_ref, 120),
    stock,
    made_to_order: r.made_to_order === true || r.made_to_order === "true",
    weight_g: num(r.weight_g),
    print_hours: num(r.print_hours),
    ...(typeof r.updated_at === "string" ? { updated_at: clean(r.updated_at, 40) } : {}),
  };
  if (item.status === "live") {
    const blockers = liveBlockers(item);
    if (blockers.length) return { errors: blockers.map((b) => `cannot go live without ${b}`) };
  }
  return { item, errors: [] };
}

// File items first; creator-page items with the same id replace them.
// Invalid entries are dropped, never sold.
export function mergeCatalogue(fileItems: unknown, storeItems: unknown): PrintItem[] {
  const map = new Map<string, PrintItem>();
  for (const list of [fileItems, storeItems]) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const { item } = cleanItem(raw);
      if (item) map.set(item.id, item);
    }
  }
  return [...map.values()];
}

// Only safe fields go to the browser.
export const publicItem = (i: PrintItem) => ({
  id: i.id,
  name: i.name,
  description: i.description,
  material: i.material,
  colour: i.colour,
  price_gbp: i.price_gbp,
  photo: i.photo,
  photo_alt: i.photo_alt,
  age_rating: i.age_rating,
  category: i.category,
  made_to_order: i.made_to_order,
  in_stock: i.made_to_order || i.stock > 0,
});

const toPence = (gbp: number) => Math.round(gbp * 100);
export const money = (pence: number) => (pence / 100).toFixed(2);
export function totalFor(item: Pick<PrintItem, "price_gbp">, qty: number, deliveryGbp: number) {
  return money(toPence(item.price_gbp) * qty + toPence(deliveryGbp));
}
export const customIdFor = (itemId: string, qty: number, ref: string) => `ps-print:${itemId}:${qty}:${ref}`;

export type Address = { name: string; line1: string; line2: string; city: string; postcode: string; email: string };
export const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export function cleanAddress(raw: unknown): { address?: Address; error?: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Please add a delivery address." };
  const r = raw as Record<string, unknown>;
  const address: Address = {
    name: clean(r.name, 80),
    line1: clean(r.line1, 100),
    line2: clean(r.line2, 100),
    city: clean(r.city, 60),
    postcode: clean(r.postcode, 10).toUpperCase(),
    email: clean(r.email, 254).toLowerCase(),
  };
  if (address.name.length < 2) return { error: "Please add the name for delivery." };
  if (address.line1.length < 3) return { error: "Please add the first line of the address." };
  if (address.city.length < 2) return { error: "Please add the town or city." };
  if (!POSTCODE.test(address.postcode)) return { error: "Please add a UK postcode." };
  if (!EMAIL.test(address.email)) return { error: "Please add an email so we can tell you when it ships." };
  return { address };
}

const apiBase = (env: Deps["env"]) =>
  (env.PAYPAL_ENV || "").toLowerCase() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
export const paypalConfigured = (env: Deps["env"]) =>
  Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET && env.PAYPAL_MERCHANT_ID);

type Capture = { status?: string; amount?: { value?: string; currency_code?: string } };
type PaypalAddress = { address_line_1?: string; address_line_2?: string; admin_area_2?: string; postal_code?: string; country_code?: string };
type Order = {
  status?: string;
  purchase_units?: {
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payee?: { merchant_id?: string };
    shipping?: { name?: { full_name?: string }; address?: PaypalAddress };
    payments?: { captures?: Capture[] };
  }[];
};
const pence = (v?: string) => (v && /^\d+\.\d{2}$/.test(v) ? Number(v.replace(".", "")) : NaN);

export type OrderRecord = {
  ref: string;
  itemId: string;
  itemName: string;
  qty: number;
  total: string;
  currency: string;
  address: Address;
  paypalShipping: { name: string; line1: string; line2: string; city: string; postcode: string } | null;
  status: "paid";
  createdAt: string;
};

export type PrintDeps = Deps & { catalogue: PrintItem[]; deliveryGbp: number; now?: () => Date };

// Checks a captured PayPal order with PayPal itself: the amount must match the
// catalogue price x qty + delivery, the payee must be Shane's merchant id, and
// the item must be sellable right now. Then records the order once.
export async function verifyPrintOrder(raw: unknown, deps: PrintDeps): Promise<Result> {
  const { env } = deps;
  if (!paypalConfigured(env)) return out(503, { ok: false, configured: false });
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out(400, { error: "Invalid request" });
  const r = raw as Record<string, unknown>;
  const { orderID, itemId, ref } = r;
  const qty = Number(r.qty ?? 1);
  if (typeof orderID !== "string" || !ORDER_ID.test(orderID)) return out(400, { error: "Invalid order id" });
  if (typeof ref !== "string" || !ORDER_REF.test(ref)) return out(400, { error: "Invalid order reference" });
  if (typeof itemId !== "string" || !ITEM_ID.test(itemId)) return out(400, { error: "Invalid item" });
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return out(400, { error: "Invalid quantity" });
  const { address, error } = cleanAddress(r.address);
  if (!address) return out(400, { error });

  const item = deps.catalogue.find((i) => i.id === itemId);
  if (!isSellable(item)) return out(409, { ok: false, verified: false, error: "This print is not for sale right now." });
  const expected = totalFor(item!, qty, deps.deliveryGbp);
  const key = `order:${orderID}`;
  const sameRef = (stored: string | null) => {
    try {
      return stored !== null && (JSON.parse(stored) as OrderRecord).ref === ref;
    } catch {
      return false;
    }
  };

  try {
    const prior = await deps.store.get(key);
    if (prior !== null) {
      if (sameRef(prior)) return out(200, { ok: true, verified: true, ref, repeat: true });
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
      (sum, c) => sum + (c.status === "COMPLETED" && c.amount?.currency_code === CURRENCY ? pence(c.amount?.value) : NaN),
      0,
    );
    const verified =
      order.status === "COMPLETED" &&
      units.length === 1 &&
      unit?.amount?.value === expected &&
      unit?.amount?.currency_code === CURRENCY &&
      unit?.payee?.merchant_id === env.PAYPAL_MERCHANT_ID &&
      unit?.custom_id === customIdFor(itemId, qty, ref) &&
      captures.length > 0 &&
      captured === pence(expected);
    if (!verified) return out(200, { ok: true, verified: false, status: order.status ?? null });

    const ship = unit?.shipping;
    const record: OrderRecord = {
      ref,
      itemId,
      itemName: item!.name,
      qty,
      total: expected,
      currency: CURRENCY,
      address,
      paypalShipping: ship?.address
        ? {
            name: clean(ship.name?.full_name, 80),
            line1: clean(ship.address.address_line_1, 100),
            line2: clean(ship.address.address_line_2, 100),
            city: clean(ship.address.admin_area_2, 60),
            postcode: clean(ship.address.postal_code, 10),
          }
        : null,
      status: "paid",
      createdAt: (deps.now ? deps.now() : new Date()).toISOString(),
    };
    if (!(await deps.store.setIfNew(key, JSON.stringify(record)))) {
      if (sameRef(await deps.store.get(key))) return out(200, { ok: true, verified: true, ref, repeat: true });
      return out(409, { ok: false, verified: false, error: "Order already used" });
    }
    return out(200, { ok: true, verified: true, ref, total: expected });
  } catch {
    return out(500, { ok: false, error: "Verification failed" });
  }
}

// Photo uploads from the creator page.
export const PHOTO_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export const MAX_PHOTO_BYTES = 3_000_000;
export function checkPhoto(type: string, bytes: number): string | null {
  if (!PHOTO_TYPES[type]) return "Photo must be WebP, JPEG or PNG.";
  if (!(bytes > 0) || bytes > MAX_PHOTO_BYTES) return "Photo must be under 3 MB.";
  return null;
}
