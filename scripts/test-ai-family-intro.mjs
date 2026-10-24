import test from 'node:test';
import assert from 'node:assert/strict';
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
