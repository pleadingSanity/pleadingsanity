import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { ORDER_ID as DEPOSIT_ORDER_ID } from '../netlify/lib/paypal-verify.ts';
import {
  ORDER_ID, canGoLive, cleanAddress, cleanItem, customIdFor, isSellable, liveBlockers,
  mergeCatalogue, publicItem, totalFor, verifyPrintOrder, checkPhoto,
} from '../netlify/lib/prints.ts';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const catalogue = JSON.parse(read('data/prints.json'));

const OID = 'PRINTORDER123';
const REF = 'psabc123def456ghi789';
const env = { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's', PAYPAL_MERCHANT_ID: 'MERCH1' };
const address = { name: 'Test Buyer', line1: '1 Test Street', line2: '', city: 'Leicester', postcode: 'LE1 1AA', email: 'buyer@example.com' };

const liveDesk = {
  id: 'phone-stand', name: 'Phone stand', description: 'A test phone stand in white PLA.', material: 'PLA',
  colour: 'white', price_gbp: 10, photo: '/images/3d-prints/phone-stand.webp', photo_alt: 'Stand', mockup: false,
  age_rating: '14+', category: 'desk', status: 'live', compliance: false, compliance_ref: '', stock: 0, made_to_order: true,
};
const toy = (o = {}) => ({ ...liveDesk, id: 'rocket', name: 'Rocket', category: 'toy', age_rating: '3+', ...o });

const paypalOrder = (o = {}, u = {}) => ({
  status: 'COMPLETED',
  purchase_units: [{
    custom_id: customIdFor('phone-stand', 1, REF),
    amount: { value: '13.50', currency_code: 'GBP' },
    payee: { merchant_id: 'MERCH1' },
    shipping: { name: { full_name: 'Test Buyer' }, address: { address_line_1: '1 Test Street', admin_area_2: 'Leicester', postal_code: 'LE1 1AA', country_code: 'GB' } },
    payments: { captures: [{ status: 'COMPLETED', amount: { value: '13.50', currency_code: 'GBP' } }] },
    ...u,
  }],
  ...o,
});

function deps(order, { items = [cleanItem(liveDesk).item], used = new Map(), e = env, orderStatus = 200 } = {}) {
  const calls = [];
  return {
    calls, used,
    d: {
      env: e, catalogue: items, deliveryGbp: 3.5, now: () => new Date('2026-11-16T10:00:00Z'),
      store: {
        get: async (k) => used.get(k) ?? null,
        setIfNew: async (k, v) => { if (used.has(k)) return false; used.set(k, v); return true; },
      },
      fetch: async (url) => {
        calls.push(String(url));
        if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }), { status: 200 });
        return new Response(JSON.stringify(order), { status: orderStatus });
      },
    },
  };
}
const body = (o = {}) => ({ orderID: OID, itemId: 'phone-stand', qty: 1, ref: REF, address, ...o });
const run = async (order, opts, b = body()) => { const x = deps(order, opts); return { ...(await verifyPrintOrder(b, x.d)), ...x }; };

test('order id rule matches the existing deposit check', () => {
  assert.equal(String(ORDER_ID), String(DEPOSIT_ORDER_ID));
});

test('a toy can never go live without compliance and a technical file reference', () => {
  assert.equal(canGoLive(toy()), false);
  assert.ok(liveBlockers(toy()).some((b) => b.includes('toy compliance')));
  assert.equal(canGoLive(toy({ compliance: true })), false, 'compliance alone is not enough: needs a reference');
  assert.equal(canGoLive(toy({ compliance: true, compliance_ref: 'TF-ROCKET-001' })), true);
  assert.equal(canGoLive(toy({ compliance: true, compliance_ref: 'TF-1', age_rating: 'adult' })), false);
  const r = cleanItem(toy());
  assert.equal(r.item, undefined);
  assert.ok(r.errors.join(' ').includes('cannot go live'));
  assert.ok(cleanItem(toy({ status: 'draft' })).item, 'a toy may be saved as a draft');
});

test('toys without compliance are dropped from the shop even if marked live', () => {
  const merged = mergeCatalogue([liveDesk, toy()], []);
  assert.deepEqual(merged.filter(isSellable).map((i) => i.id), ['phone-stand']);
});

test('live items need a price, a real photo and stock or made to order', () => {
  assert.ok(liveBlockers({ ...liveDesk, mockup: true }).some((b) => b.includes('mockup')));
  assert.ok(liveBlockers({ ...liveDesk, photo: null }).includes('photo'));
  assert.ok(liveBlockers({ ...liveDesk, photo: 'https://evil.example/x.png' }).includes('photo'));
  assert.ok(liveBlockers({ ...liveDesk, made_to_order: false, stock: 0 }).includes('stock or made to order'));
  assert.ok(liveBlockers({ ...liveDesk, price_gbp: 0 }).includes('price'));
  assert.equal(canGoLive(liveDesk), true);
});

test('creator-page items override file items by id; invalid entries are dropped', () => {
  const merged = mergeCatalogue([liveDesk], [{ ...liveDesk, price_gbp: 11 }, { id: 'BAD ID' }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].price_gbp, 11);
});

test('repo catalogue: valid, drafts only for now, toys never live without compliance, photos exist', () => {
  assert.equal(catalogue.currency, 'GBP');
  assert.ok(Array.isArray(catalogue.items) && catalogue.items.length >= 3);
  const ids = new Set();
  for (const raw of catalogue.items) {
    const { item, errors } = cleanItem(raw);
    assert.ok(item, `${raw.id}: ${errors.join('; ')}`);
    assert.ok(!ids.has(item.id), `duplicate ${item.id}`);
    ids.add(item.id);
    if (item.category === 'toy' && item.status === 'live') assert.equal(canGoLive(item), true, `${item.id} toy live without compliance`);
    if (item.photo) assert.ok(existsSync(new URL('..' + item.photo, import.meta.url)), `${item.id} photo missing`);
    if (item.mockup) assert.notEqual(item.status, 'live', `${item.id} is a mockup and cannot be live`);
  }
  assert.ok(catalogue.items.some((i) => i.category === 'toy'), 'seed includes a draft toy to prove the rule');
  const raw = read('data/prints.json');
  assert.ok(!/\p{Extended_Pictographic}/u.test(raw), 'no emoji');
  assert.ok(!/#(ff4d8d|000103)\b/i.test(raw), 'no banned colours');
});

test('totals are exact pence: price x qty + delivery', () => {
  assert.equal(totalFor({ price_gbp: 10 }, 1, 3.5), '13.50');
  assert.equal(totalFor({ price_gbp: 0.1 }, 3, 0.2), '0.50');
  assert.equal(totalFor({ price_gbp: 12.99 }, 5, 3.5), '68.45');
});

test('delivery address: UK postcode and email required', () => {
  assert.ok(cleanAddress(address).address);
  assert.ok(cleanAddress({ ...address, postcode: '90210' }).error);
  assert.ok(cleanAddress({ ...address, email: 'nope' }).error);
  assert.ok(cleanAddress(null).error);
});

test('valid order verifies, records the address once and never echoes the merchant id', async () => {
  const r = await run(paypalOrder());
  assert.equal(r.status, 200);
  assert.equal(r.body.verified, true);
  const rec = JSON.parse(r.used.get(`order:${OID}`));
  assert.equal(rec.total, '13.50');
  assert.equal(rec.address.postcode, 'LE1 1AA');
  assert.equal(rec.paypalShipping.city, 'Leicester');
  assert.equal(JSON.stringify(r.body).includes('MERCH1'), false);
  assert.equal(JSON.stringify(r.body).includes('LE1'), false, 'address not echoed');
});

test('wrong amount, payee, custom id, currency or partial capture is not verified', async () => {
  for (const [label, order] of [
    ['amount', paypalOrder({}, { amount: { value: '3.50', currency_code: 'GBP' } })],
    ['payee', paypalOrder({}, { payee: { merchant_id: 'OTHER' } })],
    ['custom id', paypalOrder({}, { custom_id: customIdFor('phone-stand', 1, 'someoneelse12345') })],
    ['currency', paypalOrder({}, { amount: { value: '13.50', currency_code: 'USD' } })],
    ['capture', paypalOrder({}, { payments: { captures: [{ status: 'PENDING', amount: { value: '13.50', currency_code: 'GBP' } }] } })],
    ['status', paypalOrder({ status: 'APPROVED' })],
  ]) {
    const r = await run(order);
    assert.equal(r.body.verified, false, label);
    assert.equal(r.used.size, 0, `${label}: nothing recorded`);
  }
});

test('quantity must match the amount paid', async () => {
  const r = await run(paypalOrder(), undefined, body({ qty: 2 }));
  assert.equal(r.body.verified, false);
});

test('an unsellable item (toy without compliance) is refused before calling PayPal', async () => {
  const r = await run(paypalOrder(), { items: mergeCatalogue([toy({ status: 'draft' })], []) }, body({ itemId: 'rocket' }));
  assert.equal(r.status, 409);
  assert.equal(r.calls.length, 0);
});

test('replays: same ref is a safe repeat, another ref is refused', async () => {
  const used = new Map();
  const first = await run(paypalOrder(), { used });
  assert.equal(first.body.verified, true);
  const again = await run(paypalOrder(), { used });
  assert.equal(again.body.repeat, true);
  const other = await run(paypalOrder(), { used }, body({ ref: 'differentref123456' }));
  assert.equal(other.status, 409);
});

test('not configured, bad input and provider errors', async () => {
  assert.equal((await run(paypalOrder(), { e: {} })).status, 503);
  assert.equal((await run(paypalOrder(), undefined, body({ orderID: 'x' }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, body({ address: { ...address, postcode: '' } }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, body({ qty: 9 }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, null)).status, 400);
  assert.equal((await run(paypalOrder(), { orderStatus: 404 })).status, 404);
  assert.equal((await run(paypalOrder(), { orderStatus: 500 })).status, 502);
});

test('public items never expose compliance internals or stock counts', () => {
  const p = publicItem(cleanItem(liveDesk).item);
  for (const k of ['compliance', 'compliance_ref', 'stock', 'status']) assert.equal(k in p, false, k);
});

test('photo uploads: images only, under 3 MB', () => {
  assert.equal(checkPhoto('image/webp', 1000), null);
  assert.ok(checkPhoto('image/svg+xml', 1000));
  assert.ok(checkPhoto('image/png', 4_000_000));
});

test('pages: brand-safe, no hardcoded PayPal client id, creator page private, crisis numbers on shop', () => {
  const shop = read('prints.html'), js = read('js/prints.js'), cp = read('creator-prints.html'), fn = read('netlify/functions/prints.mts');
  for (const src of [shop, js, cp, read('js/creator-prints.js')]) {
    assert.ok(!/#(ff4d8d|000103)\b/i.test(src), 'banned colour');
    assert.ok(!/purple|violet|indigo|magenta/i.test(src), 'banned colour word');
    assert.ok(!/\p{Extended_Pictographic}/u.test(src), 'no emoji');
    assert.ok(!/client-id=A[A-Za-z0-9_-]{20,}/.test(src), 'no hardcoded client id');
  }
  assert.ok(js.includes("fetch('/api/prints'"), 'client id comes from the server');
  for (const n of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(shop.includes(n), n);
  assert.ok(cp.includes('noindex'));
  assert.ok(fn.includes('studioGate'), 'admin routes use the creator gate');
  assert.ok(!/PAYPAL_CLIENT_SECRET\s*[:=]\s*["'][^"']+["']/.test(fn), 'no secret in code');
});

test('existing payment code is untouched by this feature', () => {
  for (const f of ['netlify/functions/verify-paypal.mts', 'netlify/functions/supporter.mts', 'netlify/lib/supporter.ts']) {
    assert.ok(!read(f).includes('prints'), `${f} should not reference prints`);
  }
});
