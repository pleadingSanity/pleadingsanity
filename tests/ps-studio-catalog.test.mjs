// P.S Studio 3D-print catalogue guard. Any AI or person adding a print must
// pass this before it can merge. See docs/3D-PRINT-SHOP.md.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../ps-products.json", import.meta.url), "utf8"));
const BUY_HOSTS = ["payhip.com", "www.payhip.com", "vt.tiktok.com", "www.tiktok.com", "shop.tiktok.com"];
const PHOTO = /^\/images\/3d-prints\/[a-z0-9._-]+\.(webp|jpe?g|png|svg)$/i;

test("ps-products.json has a products list in GBP", () => {
  assert.ok(Array.isArray(data.products));
  assert.equal(data.currency, "GBP");
});

test("every print has a unique slug id, a title and a description", () => {
  const ids = new Set();
  for (const p of data.products) {
    assert.match(p.id, /^[a-z0-9-]+$/, `bad id ${p.id}`);
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.ok(p.title && p.description, `${p.id} needs title and description`);
  }
});

test("an active print is complete: price, real photo, stock, safe buy link", () => {
  for (const p of data.products.filter((x) => x.active === true)) {
    assert.ok(typeof p.price_gbp === "number" && p.price_gbp > 0, `${p.id} price_gbp`);
    assert.match(p.photo || "", PHOTO, `${p.id} photo must live in /images/3d-prints/`);
    assert.ok(existsSync(new URL(".." + p.photo, import.meta.url)), `${p.id} photo file missing: ${p.photo}`);
    assert.ok(p.photo_alt, `${p.id} photo_alt`);
    assert.ok(p.made_to_order === true || (Number.isInteger(p.stock) && p.stock > 0), `${p.id} stock or made_to_order`);
    const u = p.buy_url || "";
    const ok = u.startsWith("mailto:pleadingsanity1@gmail.com") || (() => { try { const x = new URL(u); return x.protocol === "https:" && BUY_HOSTS.includes(x.hostname); } catch { return false; } })();
    assert.ok(ok, `${p.id} buy_url must be the existing Payhip/TikTok store or Shane's email`);
  }
});

test("catalogue copy stays on brand: no emoji, no banned colours", () => {
  const raw = readFileSync(new URL("../ps-products.json", import.meta.url), "utf8");
  assert.ok(!/\p{Extended_Pictographic}/u.test(raw), "no emoji");
  assert.ok(!/#(ff4d8d|000103)\b/i.test(raw), "no banned colours");
});

test("studio page keeps crisis numbers and the empty state", () => {
  const html = readFileSync(new URL("../ps-studio.html", import.meta.url), "utf8");
  for (const n of ["tel:999", "tel:116123", "sms:85258", "tel:111"]) assert.ok(html.includes(n), n);
  assert.ok(html.includes("First prints coming soon"));
});
