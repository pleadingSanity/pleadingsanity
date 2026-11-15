// ==============================================================
// P.S Prints — 3D prints with PayPal checkout (see netlify/lib/prints.ts)
//   GET  /api/prints                    { configured, clientId, sandbox, currency, delivery, contact, maker, items: live only }
//   POST /api/prints/verify             { orderID, itemId, qty, delivery: post|collect, ref, address } -> checks
//                                       with PayPal, records the order once (Blobs "print-orders")
//   GET  /api/prints/photo/:file        photo uploaded from the creator page (public)
//   GET  /api/prints/reviews?item=id    approved reviews for one print (public)
//   POST /api/prints/reviews            { itemId, rating, name, text, ref, email } verified buyers only; queued
//   GET  /api/prints/admin              creator only: every item with what blocks it going live + settings
//   POST /api/prints/admin              creator only: multipart form, adds or updates an item (+ optional photo)
//   GET  /api/prints/admin/orders       creator only: paid orders with delivery details
//   POST /api/prints/admin/settings     creator only: { post_gbp, collect }
//   GET  /api/prints/admin/reviews      creator only: the moderation queue
//   POST /api/prints/admin/reviews      creator only: { key, action: approve|reject }
//
// Catalogue = data/prints.json + items saved on creator-prints.html (Blobs "prints-catalogue").
// Env (Netlify only): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MERCHANT_ID, optional PAYPAL_ENV=sandbox.
// No tracking. No addresses, emails, reviews or order details are logged.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow } from "../lib/rate-limit.js";
import { currentUser } from "../lib/social.js";
import { studioGate } from "../lib/creator-studio-core.js";
import catalogueFile from "../../data/prints.json";
import {
  CONTACT,
  CURRENCY,
  ORDER_REF,
  PHOTO_TYPES,
  REVIEW_KEY,
  canReview,
  checkPhoto,
  cleanDelivery,
  cleanItem,
  cleanReview,
  isSellable,
  liveBlockers,
  mergeCatalogue,
  paypalConfigured,
  publicItem,
  publicReview,
  verifyPrintOrder,
  type OrderRecord,
  type PrintItem,
  type Review,
} from "../lib/prints.js";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const catalogueStore = () => getStore("prints-catalogue");
const photoStore = () => getStore("prints-photos");
const orderStore = () => getStore("print-orders");
const reviewStore = () => getStore("print-reviews");
const file = catalogueFile as { items?: unknown[]; delivery?: unknown; maker?: unknown };
const fileDelivery = cleanDelivery(file.delivery);

async function storeItems(): Promise<unknown[]> {
  const raw = (await catalogueStore().get("items.json", { type: "json" }).catch(() => null)) as { items?: unknown[] } | null;
  return Array.isArray(raw?.items) ? raw.items : [];
}
const catalogue = async (): Promise<PrintItem[]> => mergeCatalogue(file.items ?? [], await storeItems());
const delivery = async () => cleanDelivery(await catalogueStore().get("settings.json", { type: "json" }).catch(() => null), fileDelivery);

async function signedIn() {
  try {
    return await currentUser();
  } catch {
    return null;
  }
}

export default async (req: Request, context: Context) => {
  const env = process.env as Record<string, string | undefined>;
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");

  if (req.method === "GET" && path === "/api/prints") {
    const configured = paypalConfigured(env);
    const items = (await catalogue()).filter(isSellable).map(publicItem);
    return json({ configured, clientId: configured ? env.PAYPAL_CLIENT_ID : null, sandbox: (env.PAYPAL_ENV || "").toLowerCase() === "sandbox", currency: CURRENCY, delivery: await delivery(), contact: CONTACT, maker: file.maker ?? null, items });
  }

  if (req.method === "POST" && path === "/api/prints/verify") {
    if (!paypalConfigured(env)) return json({ ok: false, configured: false }, 503);
    if (!(await allow("write", context))) return json({ error: "Too many requests. Please wait a minute and choose Check again." }, 429);
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ error: "Invalid request" }, 400);
    }
    const user = await signedIn();
    const store = orderStore();
    const { status, body } = await verifyPrintOrder(raw, {
      fetch,
      env,
      catalogue: await catalogue(),
      delivery: await delivery(),
      buyerId: user?.id ?? null,
      store: {
        get: (key) => store.get(key),
        setIfNew: async (key, value) => (await store.set(key, value, { onlyIfNew: true })).modified,
      },
    });
    if (body.verified === true && user && typeof body.ref === "string") {
      const itemId = String((raw as { itemId?: unknown })?.itemId || "");
      await store.set(`buyer:${user.id}:${itemId}`, body.ref).catch(() => {});
    }
    console.log(`prints verify: ${status}${body.verified === true ? " verified" : ""}`);
    return json(body, status);
  }

  const photo = path.match(/^\/api\/prints\/photo\/([a-z0-9._-]+\.(webp|jpg|png))$/i);
  if (req.method === "GET" && photo) {
    const entry = await photoStore().getWithMetadata(photo[1], { type: "arrayBuffer" }).catch(() => null);
    if (!entry) return new Response("Not found", { status: 404 });
    const type = String((entry.metadata as { contentType?: string })?.contentType || "image/webp");
    return new Response(entry.data as ArrayBuffer, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
  }

  if (path === "/api/prints/reviews") {
    const store = reviewStore();
    if (req.method === "GET") {
      const item = String(url.searchParams.get("item") || "");
      if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(item)) return json({ error: "Invalid item" }, 400);
      const { blobs } = await store.list({ prefix: `review:${item}:` });
      const reviews = [];
      for (const b of blobs.slice(-100)) {
        const r = (await store.get(b.key, { type: "json" }).catch(() => null)) as Review | null;
        if (r?.status === "approved") reviews.push(publicReview(r));
      }
      reviews.sort((a, b) => b.date.localeCompare(a.date));
      const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;
      return json({ reviews, count: reviews.length, average: avg });
    }
    if (req.method === "POST") {
      if (!(await allow("write", context))) return json({ error: "Too many requests. Please try again in a minute." }, 429);
      let raw: Record<string, unknown>;
      try {
        raw = (await req.json()) as Record<string, unknown>;
      } catch {
        return json({ error: "Invalid request" }, 400);
      }
      const { review, error } = cleanReview(raw);
      if (!review) return json({ error }, 400);
      const user = await signedIn();
      const orders = orderStore();
      let ref = typeof raw.ref === "string" ? raw.ref.trim() : "";
      if (!ref && user) ref = (await orders.get(`buyer:${user.id}:${review.itemId}`).catch(() => null)) || "";
      if (!ORDER_REF.test(ref)) return json({ error: "Reviews are for verified buyers. Enter the order reference from your confirmation." }, 403);
      const orderID = await orders.get(`ref:${ref}`).catch(() => null);
      const order = orderID ? ((await orders.get(`order:${orderID}`, { type: "json" }).catch(() => null)) as OrderRecord | null) : null;
      if (!canReview(order, review.itemId, { email: String(raw.email || ""), buyerId: user?.id ?? null })) {
        return json({ error: "We could not match that order to this print. Check the reference and the email you used at checkout." }, 403);
      }
      const key = `review:${review.itemId}:${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
      const claimed = (await store.set(`reviewed:${ref}:${review.itemId}`, key, { onlyIfNew: true })).modified;
      if (!claimed) return json({ error: "You have already reviewed this print. Thank you." }, 409);
      const record: Review = { ...review, status: "pending", createdAt: new Date().toISOString(), orderRef: ref };
      await store.setJSON(key, record);
      return json({ ok: true, pending: true });
    }
    return json({ error: "Not found" }, 404);
  }

  if (path.startsWith("/api/prints/admin")) {
    const gate = studioGate(await signedIn());
    if (!gate.ok) return json({ error: gate.error, privateStudio: true }, gate.status);

    if (req.method === "GET" && path === "/api/prints/admin") {
      const items = (await catalogue()).map((i) => ({ ...i, sellable: isSellable(i), blockers: liveBlockers(i) }));
      return json({ ok: true, delivery: await delivery(), paypal: paypalConfigured(env), items });
    }

    if (req.method === "GET" && path === "/api/prints/admin/orders") {
      const store = orderStore();
      const { blobs } = await store.list({ prefix: "order:" });
      const orders = [];
      for (const b of blobs.slice(-200)) {
        const rec = await store.get(b.key, { type: "json" }).catch(() => null);
        if (rec) orders.push({ paypalOrderId: b.key.slice(6), ...(rec as object) });
      }
      orders.sort((a, b) => String((b as { createdAt?: string }).createdAt).localeCompare(String((a as { createdAt?: string }).createdAt)));
      return json({ ok: true, orders });
    }

    if (req.method === "POST" && path === "/api/prints/admin/settings") {
      let raw: unknown;
      try {
        raw = await req.json();
      } catch {
        return json({ error: "Invalid request" }, 400);
      }
      const next = cleanDelivery(raw, await delivery());
      await catalogueStore().setJSON("settings.json", next);
      return json({ ok: true, delivery: next });
    }

    if (path === "/api/prints/admin/reviews") {
      const store = reviewStore();
      if (req.method === "GET") {
        const { blobs } = await store.list({ prefix: "review:" });
        const reviews = [];
        for (const b of blobs.slice(-300)) {
          const r = (await store.get(b.key, { type: "json" }).catch(() => null)) as Review | null;
          if (r) reviews.push({ key: b.key, itemId: r.itemId, rating: r.rating, name: r.name, text: r.text, status: r.status, createdAt: r.createdAt });
        }
        reviews.sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1) || b.createdAt.localeCompare(a.createdAt));
        return json({ ok: true, reviews });
      }
      if (req.method === "POST") {
        const raw = (await req.json().catch(() => null)) as { key?: string; action?: string } | null;
        const key = String(raw?.key || "");
        if (!REVIEW_KEY.test(key) || !["approve", "reject"].includes(String(raw?.action))) return json({ error: "Invalid request" }, 400);
        const r = (await store.get(key, { type: "json" }).catch(() => null)) as Review | null;
        if (!r) return json({ error: "Not found" }, 404);
        r.status = raw!.action === "approve" ? "approved" : "rejected";
        await store.setJSON(key, r);
        return json({ ok: true, status: r.status });
      }
    }

    if (req.method === "POST" && path === "/api/prints/admin") {
      let form: FormData;
      try {
        form = await req.formData();
      } catch {
        return json({ error: "Send the form as multipart/form-data." }, 400);
      }
      const fields: Record<string, unknown> = {};
      for (const [k, v] of form.entries()) if (typeof v === "string") fields[k] = v;
      const upload = form.get("photo_file");
      if (upload && typeof upload !== "string" && upload.size > 0) {
        const problem = checkPhoto(upload.type, upload.size);
        if (problem) return json({ error: problem }, 400);
        const id = String(fields.id || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) || "print";
        const name = `${id}-${Date.now()}.${PHOTO_TYPES[upload.type]}`;
        await photoStore().set(name, await upload.arrayBuffer(), { metadata: { contentType: upload.type } });
        fields.photo = `/api/prints/photo/${name}`;
        if (fields.mockup === undefined) fields.mockup = "false";
      }
      fields.updated_at = new Date().toISOString();
      const { item, errors } = cleanItem(fields);
      if (!item) return json({ error: errors.join("; "), errors }, 422);
      const list = (await storeItems()).filter((x) => (x as { id?: string })?.id !== item.id);
      list.push(item);
      await catalogueStore().setJSON("items.json", { items: list });
      return json({ ok: true, item: { ...item, sellable: isSellable(item), blockers: liveBlockers(item) } });
    }
    return json({ error: "Not found" }, 404);
  }

  return json({ error: "Not found" }, 404);
};

export const config: Config = {
  path: ["/api/prints", "/api/prints/verify", "/api/prints/photo/:file", "/api/prints/reviews", "/api/prints/admin", "/api/prints/admin/*"],
};
