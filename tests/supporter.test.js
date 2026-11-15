import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ORDER_ID as DEPOSIT_ORDER_ID } from '../netlify/lib/paypal-verify.ts';
import { ORDER_ID, SUPPORTER_ROLE, customIdFor, grantSupporter, isSupporter, verifySupporter } from '../netlify/lib/supporter.ts';

const USER = '0b7e3c1a-1111-4222-8333-444455556666';
const OID = 'ORDER99PABC12';
const env = { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's', PAYPAL_MERCHANT_ID: 'MERCH1' };

const goodOrder = (o = {}) => ({
  status: 'COMPLETED',
  purchase_units: [{
    custom_id: customIdFor(USER),
    amount: { value: '0.99', currency_code: 'GBP' },
    payee: { merchant_id: 'MERCH1' },
    payments: { captures: [{ status: 'COMPLETED', amount: { value: '0.99', currency_code: 'GBP' } }] },
    ...o,
  }],
});

function deps(order, { e = env, used = new Map(), roleMap = new Map([[USER, ['member']]]), orderStatus = 200, tokenOk = true } = {}) {
  const calls = [];
  return {
    calls, used, roleMap,
    d: {
      env: e,
      store: {
        get: async (k) => used.get(k) ?? null,
        setIfNew: async (k, v) => { if (used.has(k)) return false; used.set(k, v); return true; },
      },
      roles: {
        getRoles: async (id) => [...(roleMap.get(id) ?? [])],
        setRoles: async (id, list) => { roleMap.set(id, list); },
      },
      fetch: async (url) => {
        calls.push(String(url));
        if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }), { status: tokenOk ? 200 : 401 });
        return new Response(JSON.stringify(order), { status: orderStatus });
      },
    },
  };
}
const run = (order, opts, body = { orderID: OID }, user = USER) => {
  const x = deps(order, opts);
  return verifySupporter(body, user, x.d).then((r) => ({ ...r, ...x }));
};

test('order id rule matches the deposit check', () => {
  assert.equal(String(ORDER_ID), String(DEPOSIT_ORDER_ID));
});

test('valid 99p order verifies, is recorded once and adds the supporter role', async () => {
  const r = await run(goodOrder());
  assert.equal(r.status, 200);
  assert.equal(r.body.verified, true);
  assert.equal(r.used.get(`supporter:${OID}`), USER);
  assert.deepEqual(r.roleMap.get(USER), ['member', SUPPORTER_ROLE]);
  assert.equal(JSON.stringify(r.body).includes('MERCH1'), false);
});

test('not configured -> 503 and no PayPal call', async () => {
  for (const e of [{}, { ...env, PAYPAL_MERCHANT_ID: '' }, { ...env, PAYPAL_CLIENT_SECRET: '' }]) {
    const r = await run(goodOrder(), { e });
    assert.equal(r.status, 503); assert.equal(r.body.configured, false); assert.equal(r.calls.length, 0);
  }
});

test('signed-out caller -> 401, bad body -> 400', async () => {
  assert.equal((await run(goodOrder(), {}, { orderID: OID }, null)).status, 401);
  for (const body of [null, [], 'x', { orderID: 'bad' }, {}]) assert.equal((await run(goodOrder(), {}, body)).status, 400);
});

test('wrong amount, currency, payee, status or owner is not verified and grants nothing', async () => {
  const bad = [
    goodOrder({ amount: { value: '50.00', currency_code: 'GBP' } }),
    goodOrder({ amount: { value: '0.99', currency_code: 'USD' } }),
    goodOrder({ payee: { merchant_id: 'OTHER' } }),
    goodOrder({ custom_id: customIdFor('someone-else') }),
    goodOrder({ payments: { captures: [] } }),
    goodOrder({ payments: { captures: [{ status: 'PENDING', amount: { value: '0.99', currency_code: 'GBP' } }] } }),
    { ...goodOrder(), status: 'APPROVED' },
  ];
  for (const order of bad) {
    const r = await run(order);
    assert.equal(r.body.verified, false);
    assert.equal(r.used.size, 0);
    assert.deepEqual(r.roleMap.get(USER), ['member']);
  }
});

test('the 50 pound deposit order cannot be reused as a supporter order', async () => {
  const deposit = goodOrder({ custom_id: 'abcdef0123456789abcdef', amount: { value: '50.00', currency_code: 'GBP' } });
  assert.equal((await run(deposit)).body.verified, false);
});

test('replay by another account is refused; same account repeat is safe', async () => {
  const used = new Map([[`supporter:${OID}`, 'another-user']]);
  const r = await run(goodOrder(), { used });
  assert.equal(r.status, 409); assert.equal(r.calls.length, 0);

  const mine = new Map([[`supporter:${OID}`, USER]]);
  const again = await run(goodOrder(), { used: mine });
  assert.equal(again.status, 200); assert.equal(again.body.repeat, true);
  assert.deepEqual(again.roleMap.get(USER), ['member', SUPPORTER_ROLE]);
});

test('PayPal errors are reported without granting', async () => {
  assert.equal((await run(goodOrder(), { tokenOk: false })).status, 502);
  assert.equal((await run(goodOrder(), { orderStatus: 404 })).status, 404);
  assert.equal((await run(goodOrder(), { orderStatus: 500 })).status, 502);
});

test('granting keeps existing roles and never duplicates', async () => {
  const m = new Map([[USER, ['creator']]]);
  const roles = { getRoles: async (id) => [...m.get(id)], setRoles: async (id, l) => m.set(id, l) };
  assert.equal(await grantSupporter(USER, roles), true);
  assert.equal(await grantSupporter(USER, roles), false);
  assert.deepEqual(m.get(USER), ['creator', 'supporter']);
  assert.equal(isSupporter(m.get(USER)), true);
});

test('supporter page: free-forever wording, brand palette, no secrets, nothing gated', () => {
  const html = readFileSync(new URL('../supporter.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../js/supporter.js', import.meta.url), 'utf8');
  assert.match(html, /free forever/i);
  assert.match(html, /not a subscription/i);
  for (const banned of [/#ff4d8d/i, /purple/i, /indigo/i, /violet/i, /magenta/i, /#000103/i, /\p{Extended_Pictographic}/u]) {
    assert.doesNotMatch(html + js, banned);
  }
  assert.doesNotMatch(html + js, /client-id=A[A-Za-z0-9_-]{20,}/);
  assert.match(js, /\/api\/supporter/);
  assert.match(js, /value: '0\.99', currency_code: 'GBP'/);
});

test('core and safety pages do not reference the supporter gate', () => {
  for (const page of ['crisis.html', 'arron.html', 'index.html', 'login.html', 'signup.html', 'journal-vault.html']) {
    const src = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /supporter\.js|isSupporter|api\/supporter/, page);
  }
});
