import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyDeposit } from '../netlify/lib/paypal-verify.ts';

const REF = 'abcdef0123456789abcdef';
const OID = 'ORDER12345ABC';
const env = { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's', PAYPAL_MERCHANT_ID: 'MERCH1' };

const goodOrder = (o = {}) => ({
  status: 'COMPLETED',
  purchase_units: [{
    custom_id: REF,
    amount: { value: '50.00', currency_code: 'GBP' },
    payee: { merchant_id: 'MERCH1' },
    payments: { captures: [{ status: 'COMPLETED', amount: { value: '50.00', currency_code: 'GBP' } }] },
    ...o,
  }],
});

function deps(order, { tokenOk = true, orderStatus = 200, e = env, used = new Map() } = {}) {
  const calls = [];
  return {
    calls, used,
    d: {
      env: e,
      store: {
        get: async (k) => used.get(k) ?? null,
        setIfNew: async (k, v) => { if (used.has(k)) return false; used.set(k, v); return true; },
      },
      fetch: async (url) => {
        calls.push(url);
        if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }), { status: tokenOk ? 200 : 401 });
        return new Response(JSON.stringify(order), { status: orderStatus });
      },
    },
  };
}
const run = (order, opts, input = { orderID: OID, enquiryRef: REF }) => { const x = deps(order, opts); return verifyDeposit(input, x.d).then((r) => ({ ...r, ...x })); };

test('valid order verifies and is consumed', async () => {
  const r = await run(goodOrder());
  assert.equal(r.status, 200); assert.equal(r.body.verified, true);
  assert.equal(r.used.get(`order:${OID}`), REF);
  assert.equal(JSON.stringify(r.body).includes('MERCH1'), false);
});
test('missing keys / merchant id -> 503 and no provider call', async () => {
  for (const e of [{}, { ...env, PAYPAL_MERCHANT_ID: '' }, { ...env, PAYPAL_CLIENT_SECRET: '' }]) {
    const r = await run(goodOrder(), { e });
    assert.equal(r.status, 503); assert.equal(r.calls.length, 0);
  }
});
test('invalid order id or enquiry ref -> 400', async () => {
  assert.equal((await run(goodOrder(), {}, { orderID: 'x', enquiryRef: REF })).status, 400);
  assert.equal((await run(goodOrder(), {}, { orderID: OID, enquiryRef: 'short' })).status, 400);
  assert.equal((await run(goodOrder(), {}, { orderID: OID })).status, 400);
});
test('wrong amount or currency is rejected', async () => {
  for (const amount of [{ value: '5.00', currency_code: 'GBP' }, { value: '50.00', currency_code: 'USD' }]) {
    const r = await run(goodOrder({ amount }));
    assert.equal(r.body.verified, false); assert.equal(r.used.size, 0);
  }
  const cap = await run(goodOrder({ payments: { captures: [{ status: 'COMPLETED', amount: { value: '10.00', currency_code: 'GBP' } }] } }));
  assert.equal(cap.body.verified, false);
  const nocap = await run(goodOrder({ payments: { captures: [] } }));
  assert.equal(nocap.body.verified, false);
});
test('incomplete order or pending capture is rejected', async () => {
  assert.equal((await run({ ...goodOrder(), status: 'APPROVED' })).body.verified, false);
  const pending = await run(goodOrder({ payments: { captures: [{ status: 'PENDING', amount: { value: '50.00', currency_code: 'GBP' } }] } }));
  assert.equal(pending.body.verified, false);
});
test('wrong payee is rejected', async () => {
  const r = await run(goodOrder({ payee: { merchant_id: 'OTHER' } }));
  assert.equal(r.body.verified, false); assert.equal(r.used.size, 0);
});
test('order tagged for a different enquiry is rejected', async () => {
  const r = await run(goodOrder({ custom_id: 'zzzzzzzzzzzzzzzzzzzz' }));
  assert.equal(r.body.verified, false);
});
test('duplicate order: same enquiry is idempotent, other enquiry is 409', async () => {
  const used = new Map();
  await run(goodOrder(), { used });
  const again = await run(goodOrder(), { used });
  assert.equal(again.status, 200); assert.equal(again.body.repeat, true); assert.equal(again.calls.length, 0);
  const other = await run(goodOrder(), { used }, { orderID: OID, enquiryRef: 'otherref0123456789ab' });
  assert.equal(other.status, 409);
});
test('provider failure -> 502 / 404 / 500 without leaking detail', async () => {
  assert.equal((await run(goodOrder(), { tokenOk: false })).status, 502);
  assert.equal((await run(goodOrder(), { orderStatus: 500 })).status, 502);
  assert.equal((await run(goodOrder(), { orderStatus: 404 })).status, 404);
  const x = deps(goodOrder()); x.d.fetch = async () => { throw new Error('secret boom'); };
  const r = await verifyDeposit({ orderID: OID, enquiryRef: REF }, x.d);
  assert.equal(r.status, 500); assert.equal(JSON.stringify(r.body).includes('boom'), false);
});
