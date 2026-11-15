import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { ORDER_ID as DEPOSIT_ORDER_ID } from '../netlify/lib/paypal-verify.ts';
import {
  ORDER_ID, canGoLive, cleanAddress, cleanItem, customIdFor, isSellable, liveBlockers, treatedAsToy,
  mergeCatalogue, publicItem, totalFor, verifyPrintOrder, checkPhoto, cleanDelivery, cleanReview, canReview,
  mentionsTrademark, CONTACT,
} from '../netlify/lib/prints.ts';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const catalogue = JSON.parse(read('data/prints.json'));

const OID = 'PRINTORDER123';
const REF = 'psabc123def456ghi789';
const env = { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's', PAYPAL_MERCHANT_ID: 'MERCH1' };
const delivery = { post_gbp: 2, collect: true };
const address = { name: 'Test Buyer', line1: '1 Test Street', line2: '', city: 'Leicester', postcode: 'LE1 1AA', email: 'buyer@example.com' };

const liveKeyring = {
  id: 'pumpkin-tag', name: 'Pumpkin tag', description: 'A flat test keyring in black PLA.', material: 'SUNLU PLA+ 1.75 mm, black',
  colour: 'black', price_gbp: 2, photo: '/images/3d-prints/pumpkin.webp', photo_alt: 'Tag', mockup: false,
  age_rating: '14+', category: 'keyring', form: 'flat', status: 'live', compliance: false, compliance_ref: '', stock: 0, made_to_order: true,
  batch: 'B001', licence: 'Original design, Pleading Sanity', warnings: 'Decorative keyring for ages 14+. Not a toy. Small parts: choking hazard.',
};
const toy = (o = {}) => ({ ...liveKeyring, id: 'rocket', name: 'Rocket', category: 'toy', age_rating: '3+', ...o });

const paypalOrder = (o = {}, u = {}) => ({
  status: 'COMPLETED',
  purchase_units: [{
    custom_id: customIdFor('pumpkin-tag', 1, 'post', REF),
    amount: { value: '4.00', currency_code: 'GBP' },
    payee: { merchant_id: 'MERCH1' },
    shipping: { name: { full_name: 'Test Buyer' }, address: { address_line_1: '1 Test Street', admin_area_2: 'Leicester', postal_code: 'LE1 1AA', country_code: 'GB' } },
    payments: { captures: [{ status: 'COMPLETED', amount: { value: '4.00', currency_code: 'GBP' } }] },
    ...u,
  }],
  ...o,
});

function deps(order, { items = [cleanItem(liveKeyring).item], used = new Map(), e = env, orderStatus = 200, d = delivery } = {}) {
  const calls = [];
  return {
    calls, used,
    d: {
      env: e, catalogue: items, delivery: d, buyerId: 'user-1', now: () => new Date('2026-11-16T10:00:00Z'),
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
const body = (o = {}) => ({ orderID: OID, itemId: 'pumpkin-tag', qty: 1, ref: REF, delivery: 'post', address, ...o });
const run = async (order, opts, b = body()) => { const x = deps(order, opts); return { ...(await verifyPrintOrder(b, x.d)), ...x }; };

test('order id rule matches the existing deposit check', () => {
  assert.equal(String(ORDER_ID), String(DEPOSIT_ORDER_ID));
});

test('a toy can never go live without compliance and a technical file reference', () => {
  assert.equal(canGoLive(toy()), false);
  assert.ok(liveBlockers(toy()).some((b) => b.includes('toy compliance')));
  assert.equal(canGoLive(toy({ compliance: true })), false, 'compliance alone is not enough');
  assert.equal(canGoLive(toy({ compliance: true, compliance_ref: 'TF-ROCKET-001' })), true);
  assert.equal(canGoLive(toy({ compliance: true, compliance_ref: 'TF-1', age_rating: 'adult' })), false);
  const r = cleanItem(toy());
  assert.equal(r.item, undefined);
  assert.ok(r.errors.join(' ').includes('cannot go live'));
  assert.ok(cleanItem(toy({ status: 'draft' })).item, 'a toy may be saved as a draft');
});

test('a 3D, flexi or articulated keyring is treated as a toy; a flat one is not', () => {
  assert.equal(treatedAsToy(liveKeyring), false);
  assert.equal(treatedAsToy({ ...liveKeyring, form: '3d' }), true);
  assert.equal(canGoLive({ ...liveKeyring, form: '3d' }), false);
  assert.equal(canGoLive({ ...liveKeyring, form: '3d', compliance: true, compliance_ref: 'TF-FLEXI-1' }), true);
});

test('non-toys must be 14+ or adult, never aimed at children', () => {
  assert.equal(canGoLive(liveKeyring), true);
  assert.equal(canGoLive({ ...liveKeyring, age_rating: '3+' }), false);
  assert.equal(canGoLive({ ...liveKeyring, age_rating: 'adult' }), true);
});

test('live items need price, real photo, stock, batch, warnings, material and a real licence', () => {
  assert.ok(liveBlockers({ ...liveKeyring, mockup: true }).some((b) => b.includes('mockup')));
  assert.ok(liveBlockers({ ...liveKeyring, photo: 'https://evil.example/x.png' }).includes('photo'));
  assert.ok(liveBlockers({ ...liveKeyring, made_to_order: false, stock: 0 }).includes('stock or made to order'));
  assert.ok(liveBlockers({ ...liveKeyring, price_gbp: 0 }).includes('price'));
  assert.ok(liveBlockers({ ...liveKeyring, batch: '' }).some((b) => b.includes('batch')));
  assert.ok(liveBlockers({ ...liveKeyring, licence: '' }).some((b) => b.includes('licence')));
  assert.ok(liveBlockers({ ...liveKeyring, licence: 'Original (concept only)' }).some((b) => b.includes('licence')));
  const cleaned = cleanItem(liveKeyring).item;
  assert.ok(cleanItem({ ...liveKeyring, status: 'draft', warnings: '' }).item.warnings.includes('choking'), 'keyrings get the default warning');
  assert.ok(/not food-safe/i.test(cleaned.material_note), 'PLA note is added');
});

test('original designs only: trademarked names are refused', () => {
  for (const n of ['Spider-Man keyring', 'Jack Skellington flexi', 'Ghostface ghost', 'Marvel hero tag']) {
    assert.ok(mentionsTrademark(n), n);
    assert.ok(cleanItem({ ...liveKeyring, status: 'draft', name: n }).errors.some((e) => e.includes('original')), n);
  }
  assert.equal(mentionsTrademark('Pinstripe skeleton flexi'), false);
  assert.ok(cleanItem({ ...liveKeyring, status: 'draft', matches: 'Disney hoodie' }).errors.length);
});

test('clothing link: range and matches are validated and public', () => {
  const r = cleanItem({ ...liveKeyring, range: 'womens', matches: 'PS-L01 leggings' });
  assert.equal(r.item.range, 'womens');
  assert.equal(publicItem(r.item).matches, 'PS-L01 leggings');
  assert.ok(cleanItem({ ...liveKeyring, range: 'kids-toys' }).errors.length);
});

test('toys without compliance are dropped from the shop even if marked live', () => {
  const merged = mergeCatalogue([liveKeyring, toy()], []);
  assert.deepEqual(merged.filter(isSellable).map((i) => i.id), ['pumpkin-tag']);
});

test('creator-page items override file items by id; invalid entries are dropped', () => {
  const merged = mergeCatalogue([liveKeyring], [{ ...liveKeyring, price_gbp: 3 }, { id: 'BAD ID' }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].price_gbp, 3);
});

test('repo catalogue: valid, all drafts, licences recorded, toy-like items blocked, photos exist, clothing links', () => {
  assert.equal(catalogue.currency, 'GBP');
  const ids = new Set();
  for (const raw of catalogue.items) {
    const { item, errors } = cleanItem(raw);
    assert.ok(item, `${raw.id}: ${errors.join('; ')}`);
    assert.ok(!ids.has(item.id), `duplicate ${item.id}`);
    ids.add(item.id);
    assert.equal(item.status, 'draft', `${item.id} must stay draft until real photos`);
    assert.ok(item.licence, `${item.id} licence recorded`);
    assert.ok(item.batch, `${item.id} batch`);
    if (treatedAsToy(item)) assert.equal(canGoLive({ ...item, mockup: false, licence: 'Original design' }), false, `${item.id} toy-like but not blocked`);
    if (item.photo) assert.ok(existsSync(new URL('..' + item.photo, import.meta.url)), `${item.id} photo missing`);
    assert.equal(mentionsTrademark(`${item.name} ${item.description}`), false, item.id);
    if (item.category !== 'toy') assert.ok(['14+', 'adult'].includes(item.age_rating), `${item.id} age`);
  }
  for (const id of ['pinstripe-skeleton-flexi', 'hooded-ghost-flexi', 'crying-brain-flexi', 'articulated-snowman', 'articulated-pumpkin']) {
    assert.ok(ids.has(id), id);
  }
  const linked = catalogue.items.filter((i) => i.matches);
  assert.ok(linked.some((i) => i.range === 'womens') && linked.some((i) => i.range === 'signature'));
  const raw = read('data/prints.json');
  assert.ok(!/\p{Extended_Pictographic}/u.test(raw), 'no emoji');
  assert.ok(!/#(ff4d8d|000103)\b/i.test(raw), 'no banned colours');
});

test('totals are exact pence and delivery-aware', () => {
  assert.equal(totalFor({ price_gbp: 2 }, 1, 'post', delivery), '4.00');
  assert.equal(totalFor({ price_gbp: 2 }, 3, 'collect', delivery), '6.00');
  assert.equal(totalFor({ price_gbp: 12.99 }, 5, 'post', { post_gbp: 3.5, collect: false }), '68.45');
  assert.equal(customIdFor('a', 2, 'collect', REF), `ps-print:a:2:collect:${REF}`);
  assert.deepEqual(cleanDelivery({ post_gbp: '2.5', collect: 'false' }), { post_gbp: 2.5, collect: false });
  assert.equal(cleanDelivery({ post_gbp: 999 }).post_gbp, 2);
});

test('address: UK postcode for post, only name and email for collection', () => {
  assert.ok(cleanAddress(address).address);
  assert.ok(cleanAddress({ ...address, postcode: '90210' }).error);
  assert.ok(cleanAddress({ ...address, email: 'nope' }).error);
  assert.ok(cleanAddress(null).error);
  assert.ok(cleanAddress({ name: 'Al', email: 'a@b.co' }, 'collect').address);
});

test('valid order verifies, records once with ref index, never echoes merchant id or address', async () => {
  const r = await run(paypalOrder());
  assert.equal(r.status, 200);
  assert.equal(r.body.verified, true);
  const rec = JSON.parse(r.used.get(`order:${OID}`));
  assert.equal(rec.total, '4.00');
  assert.equal(rec.delivery, 'post');
  assert.equal(rec.buyerId, 'user-1');
  assert.equal(r.used.get(`ref:${REF}`), OID);
  assert.equal(JSON.stringify(r.body).includes('MERCH1'), false);
  assert.equal(JSON.stringify(r.body).includes('LE1'), false);
});

test('collection orders verify without postage; collection can be switched off', async () => {
  const order = paypalOrder({}, { custom_id: customIdFor('pumpkin-tag', 1, 'collect', REF), amount: { value: '2.00', currency_code: 'GBP' }, payments: { captures: [{ status: 'COMPLETED', amount: { value: '2.00', currency_code: 'GBP' } }] } });
  const b = body({ delivery: 'collect', address: { name: 'Al', email: 'a@b.co' } });
  assert.equal((await run(order, undefined, b)).body.verified, true);
  assert.equal((await run(order, { d: { post_gbp: 2, collect: false } }, b)).status, 400);
});

test('wrong amount, payee, custom id, currency or partial capture is not verified', async () => {
  for (const [label, order] of [
    ['amount', paypalOrder({}, { amount: { value: '2.00', currency_code: 'GBP' } })],
    ['payee', paypalOrder({}, { payee: { merchant_id: 'OTHER' } })],
    ['custom id', paypalOrder({}, { custom_id: customIdFor('pumpkin-tag', 1, 'collect', REF) })],
    ['currency', paypalOrder({}, { amount: { value: '4.00', currency_code: 'USD' } })],
    ['capture', paypalOrder({}, { payments: { captures: [{ status: 'PENDING', amount: { value: '4.00', currency_code: 'GBP' } }] } })],
    ['status', paypalOrder({ status: 'APPROVED' })],
  ]) {
    const r = await run(order);
    assert.equal(r.body.verified, false, label);
    assert.equal(r.used.size, 0, `${label}: nothing recorded`);
  }
});

test('an unsellable item (toy or flexi keyring without compliance) is refused before calling PayPal', async () => {
  const flexi = { ...liveKeyring, form: '3d' };
  const r = await run(paypalOrder(), { items: mergeCatalogue([{ ...flexi, status: 'draft' }], []) });
  assert.equal(r.status, 409);
  assert.equal(r.calls.length, 0);
});

test('replays: same ref is a safe repeat, another ref is refused', async () => {
  const used = new Map();
  assert.equal((await run(paypalOrder(), { used })).body.verified, true);
  assert.equal((await run(paypalOrder(), { used })).body.repeat, true);
  assert.equal((await run(paypalOrder(), { used }, body({ ref: 'differentref123456' }))).status, 409);
});

test('not configured, bad input and provider errors', async () => {
  assert.equal((await run(paypalOrder(), { e: {} })).status, 503);
  assert.equal((await run(paypalOrder(), undefined, body({ orderID: 'x' }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, body({ address: { ...address, postcode: '' } }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, body({ qty: 99 }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, body({ delivery: 'drone' }))).status, 400);
  assert.equal((await run(paypalOrder(), undefined, null)).status, 400);
  assert.equal((await run(paypalOrder(), { orderStatus: 404 })).status, 404);
  assert.equal((await run(paypalOrder(), { orderStatus: 500 })).status, 502);
});

test('reviews: stars, clean text, no links, no swearing, verified buyers only', () => {
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 5, text: 'Lovely little keyring.' }).review);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 6, text: 'Lovely little keyring.' }).error);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 4, text: 'what a shit print' }).error);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 4, text: 'buy at www.spam.example now' }).error);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 4, text: 'call 07700900123 today' }).error);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 4, text: 'aaaaaaaaaaaa' }).error);
  assert.ok(cleanReview({ itemId: 'pumpkin-tag', rating: 4, text: 'Scunthorpe delivery was quick' }).review, 'no false positive');
  const order = { status: 'paid', itemId: 'pumpkin-tag', buyerId: 'user-1', address: { email: 'buyer@example.com' } };
  assert.equal(canReview(order, 'pumpkin-tag', { email: 'BUYER@example.com' }), true);
  assert.equal(canReview(order, 'pumpkin-tag', { buyerId: 'user-1' }), true);
  assert.equal(canReview(order, 'pumpkin-tag', { email: 'other@example.com' }), false);
  assert.equal(canReview(order, 'other-item', { email: 'buyer@example.com' }), false);
  assert.equal(canReview(null, 'pumpkin-tag', { email: 'buyer@example.com' }), false);
});

test('public items never expose compliance internals or stock counts', () => {
  const p = publicItem(cleanItem(liveKeyring).item);
  for (const k of ['compliance', 'compliance_ref', 'stock', 'status']) assert.equal(k in p, false, k);
  assert.ok(p.warnings && p.batch && p.material_note);
});

test('photo uploads: images only, under 3 MB', () => {
  assert.equal(checkPhoto('image/webp', 1000), null);
  assert.ok(checkPhoto('image/svg+xml', 1000));
  assert.ok(checkPhoto('image/png', 4_000_000));
});

test('pages: brand-safe, contact links, crisis numbers, creator page private, reviews moderated', () => {
  const shop = read('prints.html'), js = read('js/prints.js'), cp = read('creator-prints.html'), fn = read('netlify/functions/prints.mts');
  for (const src of [shop, js, cp, read('js/creator-prints.js')]) {
    assert.ok(!/#(ff4d8d|000103)\b/i.test(src), 'banned colour');
    assert.ok(!/purple|violet|indigo|magenta/i.test(src), 'banned colour word');
    assert.ok(!/\p{Extended_Pictographic}/u.test(src), 'no emoji');
    assert.ok(!/client-id=A[A-Za-z0-9_-]{20,}/.test(src), 'no hardcoded client id');
  }
  assert.ok(/\/api\/prints/.test(js), 'client id comes from the server');
  for (const n of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(shop.includes(n), n);
  assert.ok(shop.includes('wa.me/447711147663') && shop.includes('shop@pleadingsanity.co.uk'));
  assert.equal(CONTACT.whatsapp, '447711147663');
  assert.ok(cp.includes('noindex'));
  assert.ok(fn.includes('studioGate'), 'admin routes use the creator gate');
  assert.ok(fn.includes('"pending"') || fn.includes("'pending'"), 'reviews start pending');
  assert.ok(!/PAYPAL_CLIENT_SECRET\s*[:=]\s*["'][^"']+["']/.test(fn), 'no secret in code');
});

test('existing payment code is untouched by this feature', () => {
  for (const f of ['netlify/functions/verify-paypal.mts', 'netlify/functions/supporter.mts', 'netlify/lib/supporter.ts']) {
    assert.ok(!read(f).includes('prints'), `${f} should not reference prints`);
  }
});
