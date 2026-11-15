// ==============================================================
// P.S Prints — 3D prints with PayPal checkout (see netlify/lib/prints.ts)
//   GET  /api/prints                    { configured, clientId, sandbox, currency, delivery_gbp, items: live only }
//   POST /api/prints/verify             { orderID, itemId, qty, ref, address } -> checks with PayPal,
//                                       records the order once (Blobs "print-orders")
//   GET  /api/prints/photo/:file        photo uploaded from the creator page (public)
//   GET  /api/prints/admin              creator only: every item (drafts too) with what blocks it going live
//   POST /api/prints/admin              creator only: multipart form, adds or updates an item (+ optional photo)
//   GET  /api/prints/admin/orders       creator only: paid orders with delivery addresses
//
// Catalogue = data/prints.json (in the repo) + items added on creator-prints.html
// (Blobs "prints-catalogue"). Toys can never be live without compliance (enforced in the lib).
// Env (Netlify only): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MERCHANT_ID, optional PAYPAL_ENV=sandbox.
// No addresses, emails or order details are logged.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow } from "../lib/rate-limit.js";
import { currentUser } from "../lib/social.js";
import { studioGate } from "../lib/creator-studio-core.js";
import catalogueFile from "../../data/prints.json";
import {
  CURRENCY,
  PHOTO_TYPES,
  checkPhoto,
  cleanItem,
  isSellable,
  liveBlockers,
  mergeCatalogue,
  paypalConfigured,
  publicItem,
  verifyPrintOrder,
  type PrintItem,
} from "../lib/prints.js";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const catalogueStore = () => getStore("prints-catalogue");
const photoStore = () => getStore("prints-photos");
const orderStore = () => getStore("print-orders");
const file = catalogueFile as { items?: unknown[]; delivery_gbp?: number };
const deliveryGbp = typeof file.delivery_gbp === "number" && file.delivery_gbp >= 0 ? file.delivery_gbp : 3.5;

async function storeItems(): Promise<unknown[]> {
  const raw = (await catalogueStore().get("items.json", { type: "json" }).catch(() => null)) as { items?: unknown[] } | null;
  return Array.isArray(raw?.items) ? raw.items : [];
}
async function catalogue(): Promise<PrintItem[]> {
  return mergeCatalogue(file.items ?? [], await storeItems());
}

async function creator() {
  const user = await currentUser().catch(() => null);
  return studioGate(user);
}

export default async (req: Request, context: Context) => {
  const env = process.env as Record<string, string | undefined>;
  const path = new URL(req.url).pathname.replace(/\/+$/, "");

  if (req.method === "GET" && path === "/api/prints") {
    const configured = paypalConfigured(env);
    const items = (await catalogue()).filter(isSellable).map(publicItem);
    return json({ configured, clientId: configured ? env.PAYPAL_CLIENT_ID : null, sandbox: (env.PAYPAL_ENV || "").toLowerCase() === "sandbox", currency: CURRENCY, delivery_gbp: deliveryGbp, items });
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
    const store = orderStore();
    const { status, body } = await verifyPrintOrder(raw, {
      fetch,
      env,
      catalogue: await catalogue(),
      deliveryGbp,
      store: {
        get: (key) => store.get(key),
        setIfNew: async (key, value) => (await store.set(key, value, { onlyIfNew: true })).modified,
      },
    });
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

  if (path === "/api/prints/admin" || path === "/api/prints/admin/orders") {
    const gate = await creator();
    if (!gate.ok) return json({ error: gate.error, privateStudio: true }, gate.status);

    if (req.method === "GET" && path === "/api/prints/admin") {
      const items = (await catalogue()).map((i) => ({ ...i, sellable: isSellable(i), blockers: liveBlockers(i) }));
      return json({ ok: true, delivery_gbp: deliveryGbp, paypal: paypalConfigured(env), items });
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
  path: ["/api/prints", "/api/prints/verify", "/api/prints/photo/:file", "/api/prints/admin", "/api/prints/admin/orders"],
};
