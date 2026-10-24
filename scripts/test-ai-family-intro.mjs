import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { buildIntroduction } from '../js/ai-family-intro.js';
const fixture = () => ({ project: 'Kind Helper', kind: 'AI assistant', operator: 'Public Alias', tool: 'Example model', contribution: 'Draft accessible captions for human review. Cannot post or access member accounts.', link: '', charter: true, authority: true });
test('introduction identifies its human operator, contribution and review-only status', () => {
  const result = buildIntroduction(fixture());
  assert.match(result, /Human operator \/ public alias: Public Alias/);
  assert.match(result, /Cannot post or access member accounts/);
  assert.match(result, /No automatic membership, friendship, verification or technical access/);
});
test('all supported contribution types can prepare a request', () => {
  for (const kind of ['AI assistant', 'Bot', 'Creative project', 'Human contributor']) assert.match(buildIntroduction({ ...fixture(), kind }), new RegExp(`Type: ${kind}`));
  assert.throws(() => buildIntroduction({ ...fixture(), kind: 'admin' }));
});
test('required fields, length limits and both permissions confirmations are enforced', () => {
  for (const key of ['project', 'operator', 'tool', 'contribution']) assert.throws(() => buildIntroduction({ ...fixture(), [key]: ' ' }));
  assert.throws(() => buildIntroduction({ ...fixture(), project: 'x'.repeat(81) }));
  assert.throws(() => buildIntroduction({ ...fixture(), contribution: 'x'.repeat(1201) }));
  for (const key of ['charter', 'authority']) for (const value of [false, 'true', undefined]) assert.throws(() => buildIntroduction({ ...fixture(), [key]: value }));
});
test('public links are optional; executable URLs, credentials and token-style parameters are rejected', () => {
  assert.match(buildIntroduction({ ...fixture(), link: 'https://example.org/project' }), /https:\/\/example.org\/project/);
  for (const link of ['javascript:alert(1)', 'data:text/html,test', 'http://example.org', 'https://user:secret@example.org/', 'https://example.org/?token=secret', 'https://example.org/#access', 'not a url']) assert.throws(() => buildIntroduction({ ...fixture(), link }));
});
test('user markup remains literal text in the export', () => {
  const value = '<img src=x onerror=alert(1)>';
  assert.ok(buildIntroduction({ ...fixture(), project: value }).includes(value));
});

test('a late blur/change event cannot erase a new preview; actual edits still invalidate it', () => {
  const handlers = {}, values = fixture();
  const elements = new Map();
  const element = () => ({ hidden: true, value: '', textContent: '', attrs: {},
    addEventListener(type, fn) { this[type] = fn; },
    removeAttribute(key) { delete this.attrs[key]; }, focus() {} });
  for (const id of ['family-preview', 'family-draft', 'family-status', 'family-email', 'family-clear', 'family-copy']) elements.set(id, element());
  const form = { addEventListener(type, fn) { handlers[type] = fn; }, reportValidity: () => true, hidden: true };
  elements.set('family-intro-form', form);
  elements.get('family-draft').focus = () => handlers.change?.();
  class DraftData extends Map { constructor() { super(Object.entries(values)); } }
  const source = readFileSync(new URL('../js/ai-family-intro.js', import.meta.url), 'utf8').replace(/^export /gm, '');
  vm.runInNewContext(source, { document: { getElementById: id => elements.get(id) }, FormData: DraftData,
    URL, window: { addEventListener() {} }, navigator: {} });
  handlers.submit({ preventDefault() {} });
  assert.equal(elements.get('family-preview').hidden, false);
  assert.ok(elements.get('family-draft').value.includes('Kind Helper'));
  handlers.input();
  assert.equal(elements.get('family-preview').hidden, true);
  assert.equal(elements.get('family-draft').value, '');
});
