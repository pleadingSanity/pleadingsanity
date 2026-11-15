import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../insane-solar.html', import.meta.url), 'utf8');
const start = html.indexOf('(function(){\n  /* enquiry-ref:start */');
const script = html.slice(start, html.indexOf('})();\n</script>', start)) + '\n})();';

function harness({ cfg, fetchFails = false, httpOk = true } = {}) {
  const els = {};
  const el = (id) => (els[id] = { id, textContent: '', style: { display: id === 'paypal-button-container' ? 'block' : 'none' }, addEventListener() {}, focus() {} });
  ['paypal-msg', 'paypal-verify-msg', 'paypal-verify-retry', 'paypal-button-container', 'paypal-unavailable'].forEach(el);
  const appended = [];
  const fetched = [];
  let rendered = 0;
  const context = {
    sessionStorage: { getItem() { return null; }, setItem() {} },
    crypto: { getRandomValues(b) { return b.fill(1); } },
    window: {},
    document: {
      getElementById: (id) => els[id],
      createElement: () => ({}),
      head: { appendChild: (node) => appended.push(node) },
    },
    fetch: async (url) => {
      fetched.push(url);
      if (fetchFails) throw new Error('offline');
      return { ok: httpOk, json: async () => cfg };
    },
  };
  vm.runInNewContext(script, context);
  const sdkLoads = () => {
    context.window.paypal = { Buttons: () => ({ render() { rendered++; } }) };
    context.paypal = context.window.paypal;
    appended[0].onload();
  };
  return { els, appended, fetched, sdkLoads, rendered: () => rendered };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

test('no PayPal client ID is hardcoded in insane-solar.html', () => {
  assert.doesNotMatch(html, /client-id=A[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(html, /<script[^>]+src=["']https:\/\/www\.paypal\.com\/sdk\/js/);
});

test('deposit amount, verify call and enquiry ref are unchanged', () => {
  assert.match(html, /amount: \{ value: '50\.00', currency_code: 'GBP' \}/);
  assert.match(html, /fetch\('\/\.netlify\/functions\/verify-paypal'/);
  assert.match(html, /custom_id: enquiryRef\(\)/);
});

test('SDK loads with the client ID from /api/supporter, then renders the buttons', async () => {
  const h = harness({ cfg: { configured: true, clientId: 'TEST_client-ID' } });
  await tick(); await tick();
  assert.deepEqual(h.fetched, ['/api/supporter']);
  assert.equal(h.appended.length, 1);
  assert.equal(h.appended[0].src, 'https://www.paypal.com/sdk/js?client-id=TEST_client-ID&currency=GBP&intent=capture');
  h.sdkLoads();
  assert.equal(h.rendered(), 1);
  assert.equal(h.els['paypal-unavailable'].style.display, 'none');
});

for (const [name, opts] of [
  ['config fetch fails', { fetchFails: true }],
  ['config HTTP error', { httpOk: false, cfg: {} }],
  ['PayPal not configured', { cfg: { configured: false, clientId: null } }],
]) {
  test(`graceful fallback when ${name}`, async () => {
    const h = harness(opts);
    await tick(); await tick();
    assert.equal(h.appended.length, 0);
    assert.equal(h.els['paypal-unavailable'].style.display, 'block');
    assert.equal(h.els['paypal-button-container'].style.display, 'none');
  });
}

test('graceful fallback when the PayPal SDK script fails to load', async () => {
  const h = harness({ cfg: { configured: true, clientId: 'X' } });
  await tick(); await tick();
  h.appended[0].onerror();
  assert.equal(h.els['paypal-unavailable'].style.display, 'block');
});
