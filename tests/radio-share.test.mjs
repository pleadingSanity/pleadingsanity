import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/radio-share.js', import.meta.url), 'utf8');
function harness(navigator = {}) {
  const htmlWrites = [];
  function element() {
    return {
      children: [], attributes: {}, listeners: {}, style: {}, classList: { add() {}, remove() {} },
      set innerHTML(value) { htmlWrites.push(value); },
      setAttribute(key, value) { this.attributes[key] = value; },
      appendChild(child) { this.children.push(child); },
      addEventListener(type, fn) { this.listeners[type] = fn; }
    };
  }
  const window = {};
  vm.runInNewContext(source, { window, navigator, URL, document: {
    readyState: 'loading', addEventListener() {}, createElement: element, body: element()
  }, setTimeout() {}, clearTimeout() {} });
  return { api: window.PSRadioShare, htmlWrites };
}

test('custom share labels stay literal text while the built-in SVG is retained', () => {
  const { api, htmlWrites } = harness();
  const label = '<img src=x onerror="alert(1)">';
  const button = api.makeShareButton({ label, title: 'A & B' });
  assert.equal(button.children[1]?.textContent, label);
  assert.equal(button.attributes['aria-label'], label + ' — A & B');
  assert.equal(htmlWrites.length, 1);
  assert.match(htmlWrites[0], /^<svg /);
  assert.ok(htmlWrites.every(value => !value.includes(label)));
});

test('cancelling native sharing does not copy anything to the clipboard', async () => {
  const copies = [], results = [];
  const { api } = harness({
    share: async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); },
    clipboard: { writeText: async text => copies.push(text) }
  });
  api.share({ title: 'Song' }, result => results.push(result));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(copies, []);
  assert.deepEqual(results, ['cancelled']);
});

test('unsupported native sharing retains the clipboard fallback', async () => {
  const copies = [], results = [];
  const { api } = harness({
    share: async () => { throw Object.assign(new Error('unsupported'), { name: 'NotSupportedError' }); },
    clipboard: { writeText: async text => copies.push(text) }
  });
  api.share({ title: 'Song', url: 'https://pleadingsanity.co.uk/insane-radio.html?track=aaaaaaaaaaa' }, result => results.push(result));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copies.length, 1);
  assert.match(copies[0], /track=aaaaaaaaaaa$/);
  assert.deepEqual(results, ['clipboard']);
});
