import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { readDepositBody, verifyDeposit } from '../netlify/lib/paypal-verify.ts';

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

test('null or invalid JSON body is a 400 and does not call PayPal', async () => {
  for (const raw of [null, undefined, [], 'null', 0, true]) {
    assert.equal(readDepositBody(raw), null);
    const x = deps(goodOrder());
    const r = await verifyDeposit(raw, x.d);
    assert.equal(r.status, 400);
    assert.equal(r.body.error, 'Invalid request');
    assert.equal(x.calls.length, 0);
  }
  const parsed = readDepositBody({ orderID: OID, enquiryRef: REF });
  assert.deepEqual(parsed, { orderID: OID, enquiryRef: REF });
});

test('failed verify does not record the order', async () => {
  let writes = 0;
  const x = deps(goodOrder({ custom_id: 'zzzzzzzzzzzzzzzzzzzz' }));
  x.d.store.setIfNew = async () => { writes += 1; return true; };
  const r = await verifyDeposit({ orderID: OID, enquiryRef: REF }, x.d);
  assert.equal(r.status, 200);
  assert.equal(r.body.verified, false);
  assert.equal(writes, 0);
  assert.equal(x.used.size, 0);
});

test('repeat verify of the same order is idempotent', async () => {
  const used = new Map();
  const first = await run(goodOrder(), { used });
  assert.equal(first.status, 200);
  assert.equal(first.body.verified, true);
  assert.equal(first.body.repeat, undefined);
  const second = await run(goodOrder(), { used });
  assert.equal(second.status, 200);
  assert.equal(second.body.verified, true);
  assert.equal(second.body.repeat, true);
  assert.equal(second.calls.length, 0);
  assert.equal(used.get(`order:${OID}`), REF);
});

test('concurrent verify: onlyIfNew admits one writer and the same enquiry repeats', async () => {
  let stored = null;
  let writes = 0;
  let waiting = [];
  const store = {
    get: async () => {
      if (stored === null) {
        await new Promise((resolve) => {
          waiting.push(resolve);
          if (waiting.length >= 2) {
            const ready = waiting;
            waiting = [];
            for (const release of ready) release();
          }
        });
        return null;
      }
      return stored;
    },
    setIfNew: async (_key, value) => {
      if (stored !== null) return false;
      stored = value;
      writes += 1;
      return true;
    },
  };
  const fetch = async (url) => {
    if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }), { status: 200 });
    return new Response(JSON.stringify(goodOrder()), { status: 200 });
  };
  const pair = Promise.all([
    verifyDeposit({ orderID: OID, enquiryRef: REF }, { env, store, fetch }),
    verifyDeposit({ orderID: OID, enquiryRef: REF }, { env, store, fetch }),
  ]);
  const results = await Promise.race([
    pair,
    new Promise((_, reject) => setTimeout(() => reject(new Error('concurrent verify timed out')), 3000)),
  ]);
  assert.equal(results.filter((r) => r.status === 200 && r.body.verified === true).length, 2);
  assert.equal(results.filter((r) => r.body.repeat === true).length, 1);
  assert.equal(writes, 1);
  assert.equal(stored, REF);
});

test('onlyIfNew race lost to a different enquiry is 409', async () => {
  let look = 0;
  const x = deps(goodOrder());
  x.d.store = {
    get: async () => {
      look += 1;
      return look === 1 ? null : 'otherref0123456789ab';
    },
    setIfNew: async () => false,
  };
  const r = await verifyDeposit({ orderID: OID, enquiryRef: REF }, x.d);
  assert.equal(r.status, 409);
  assert.equal(r.body.verified, false);
  assert.equal(r.body.ok, false);
  assert.equal(JSON.stringify(r.body).includes('otherref'), false);
});

function depositScript() {
  const html = readFileSync(new URL('../insane-solar.html', import.meta.url), 'utf8');
  const start = html.indexOf('/* enquiry-ref:start */');
  const end = html.indexOf('/* enquiry-ref:end */');
  assert.ok(start > 0 && end > start);
  return { html, refFn: html.slice(start, end) };
}

test('enquiryRef stays stable when sessionStorage throws', () => {
  const { refFn } = depositScript();
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
  };
  const context = {
    sessionStorage: blocked,
    crypto: { getRandomValues(bytes) { bytes.fill(4); return bytes; } },
  };
  vm.runInNewContext(`${refFn}\nthis.a = enquiryRef(); this.b = enquiryRef();`, context);
  assert.equal(context.a, context.b);
  assert.match(context.a, /^[0-9a-f]{32}$/);
});

test('deposit success UI waits for verified true and does not offer a second charge', async () => {
  const { html } = depositScript();
  assert.equal(html.includes(".catch(function(){})"), false);
  const script = html.slice(html.indexOf('(function(){\n  /* enquiry-ref:start */'), html.indexOf('})();\n</script>', html.indexOf('enquiry-ref:start')));
  const els = {};
  function el(id, text) {
    const node = { id, textContent: text || '', style: { display: id === 'paypal-button-container' ? 'block' : 'none' }, focus() { node.focused = true; }, listeners: {} };
    node.addEventListener = (type, fn) => { node.listeners[type] = fn; };
    els[id] = node;
    return node;
  }
  el('paypal-msg', 'Deposit received');
  el('paypal-verify-msg', 'PayPal has your payment, but we could not confirm it yet.');
  el('paypal-verify-retry');
  el('paypal-button-container');
  let buttons;
  let fetchBody;
  const calls = [];
  const context = {
    sessionStorage: { getItem() { return null; }, setItem() {} },
    crypto: { getRandomValues(bytes) { bytes.fill(9); return bytes; } },
    document: { getElementById: (id) => els[id] },
    fetch: async (_url, opts) => {
      fetchBody = JSON.parse(opts.body);
      calls.push(fetchBody);
      const verified = calls.length === 1 ? false : true;
      return { ok: true, json: async () => ({ verified }) };
    },
    window: {},
  };
  context.window.paypal = {
    Buttons(config) { buttons = config; return { render() {} }; },
  };
  context.paypal = context.window.paypal;
  vm.runInNewContext(script + '\n})();', context);
  const created = [];
  await buttons.createOrder({}, { order: { create: async (order) => { created.push(order); return 'ORDER12345ABC'; } } });
  await buttons.onApprove({ orderID: 'ORDER12345ABC' }, { order: { capture: async () => ({ status: 'COMPLETED' }) } });
  assert.equal(els['paypal-msg'].style.display, 'none');
  assert.equal(els['paypal-verify-msg'].style.display, 'block');
  assert.equal(els['paypal-button-container'].style.display, 'none');
  assert.equal(els['paypal-verify-retry'].style.display, 'inline-flex');
  assert.equal(fetchBody.orderID, 'ORDER12345ABC');
  assert.equal(fetchBody.enquiryRef, created[0].purchase_units[0].custom_id);
  els['paypal-verify-retry'].listeners.click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(els['paypal-msg'].style.display, 'block');
  assert.equal(els['paypal-verify-msg'].style.display, 'none');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].enquiryRef, calls[0].enquiryRef);
});
