import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildChartBrief } from '../js/cosmic-reflections.js';

const input = { system: 'both', name: 'Test Visitor', date: '2000-01-01', time: '12:34', unknown: false, place: 'Test Town, UK' };
const today = '2026-10-24';
test('both traditions receive explicit settings and separate results', () => {
  const brief = buildChartBrief(input, today);
  assert.match(brief, /Western reading: declare the house system/);
  assert.match(brief, /Vedic reading: declare the ayanamsa/);
  assert.match(brief, /Present each system separately/);
  assert.doesNotMatch(buildChartBrief({ ...input, system: 'western' }, today), /Vedic reading:/);
  assert.doesNotMatch(buildChartBrief({ ...input, system: 'vedic' }, today), /Western reading:/);
});
test('unknown time is explicit and never substituted with noon', () => {
  const brief = buildChartBrief({ ...input, unknown: true, time: '' }, today);
  assert.match(brief, /Birth time: unknown/); assert.doesNotMatch(brief, /Local birth time:|12:00/);
});
test('invalid dates, future dates, malformed suffixes and unknown systems are rejected', () => {
  for (const patch of [{ date: '2025-02-30' }, { date: '2028-01-01' }, { date: '2000-01-01junk' }, { system: 'toString' }, { system: '__proto__' }, { time: '25:00' }, { place: '  ' }]) {
    assert.throws(() => buildChartBrief({ ...input, ...patch }, today));
  }
  assert.throws(() => buildChartBrief(null, today));
});
test('entered markup remains literal text, with bounded optional content', () => {
  const brief = buildChartBrief({ ...input, name: '<img src=x>', question: '<script>alert(1)</script>' + 'a'.repeat(500) }, today);
  assert.match(brief, /Name: <img src=x>/); assert.match(brief, /<script>alert\(1\)<\/script>/);
  assert.ok(!brief.includes('a'.repeat(351)));
});

const source = await readFile(new URL('../js/cosmic-reflections.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../cosmic-reflections.html', import.meta.url), 'utf8');
class Element extends EventTarget {
  value = ''; checked = false; disabled = false; required = false; hidden = false; textContent = ''; dataset = {};
  focus() { this.focused = true; }
}
async function page(writeText = async () => {}) {
  const ids = ['chart-form', 'form-status', 'brief-text', 'brief-result', 'copy-brief', 'birth-date', 'birth-name', 'birth-time', 'birth-place', 'birth-question', 'time-unknown', 'clear-details', 'next-reflection', 'reflection-prompt'];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  const el = id => elements[id];
  el('brief-result').hidden = true;
  el('chart-form').reportValidity = () => true;
  el('chart-form').querySelector = () => ({ value: 'both' });
  el('chart-form').reset = () => { for (const id of ['birth-name','birth-date','birth-time','birth-place','birth-question']) el(id).value = ''; el('time-unknown').checked = false; };
  const window = new EventTarget(); window.getSelection = () => null;
  const denyStorage = new Proxy({}, { get() { throw new Error('Birth data must not access storage'); } });
  const context = vm.createContext({ document: { getElementById: el }, window, navigator: { clipboard: { writeText } }, localStorage: denyStorage, sessionStorage: denyStorage, fetch() { throw new Error('Birth data must not make network requests'); } });
  const module = new vm.SourceTextModule(source, { context }); await module.link(() => {}); await module.evaluate();
  function fill() { el('birth-name').value = input.name; el('birth-date').value = input.date; el('birth-time').value = input.time; el('birth-place').value = input.place; }
  function submit() { const event = new Event('submit', { cancelable: true }); el('chart-form').dispatchEvent(event); assert.equal(event.defaultPrevented, true); }
  return { el, fill, submit, window };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
test('form supports native submit while preventing navigation and showing a brief', async () => {
  assert.match(html, /id="build-brief"[^>]*type="submit"/);
  const p = await page(); p.fill(); p.submit();
  assert.equal(p.el('brief-result').hidden, false); assert.match(p.el('brief-text').textContent, /Test Visitor/); assert.equal(p.el('brief-text').focused, true);
});
test('editing details invalidates the previous brief and prevents a stale copy', async () => {
  const copies = []; const p = await page(async text => copies.push(text)); p.fill(); p.submit();
  p.el('birth-place').value = 'Another Town'; p.el('chart-form').dispatchEvent(new Event('input'));
  assert.equal(p.el('brief-result').hidden, true); assert.equal(p.el('brief-text').textContent, '');
  p.el('copy-brief').dispatchEvent(new Event('click')); await tick(); assert.equal(copies.length, 0);
  p.submit(); p.el('copy-brief').dispatchEvent(new Event('click')); await tick(); assert.match(copies[0], /Another Town/);
});
test('clear wins over an outstanding clipboard completion; leaving also clears fields', async () => {
  let finishCopy; const p = await page(() => new Promise(resolve => { finishCopy = resolve; })); p.fill(); p.submit();
  p.el('copy-brief').dispatchEvent(new Event('click')); assert.equal(p.el('copy-brief').disabled, true);
  p.el('clear-details').dispatchEvent(new Event('click')); finishCopy(); await tick();
  assert.match(p.el('form-status').textContent, /Details cleared/); assert.equal(p.el('brief-text').textContent, ''); assert.equal(p.el('copy-brief').disabled, false);
  p.fill(); p.submit(); p.window.dispatchEvent(new Event('pagehide')); assert.equal(p.el('birth-date').value, ''); assert.equal(p.el('brief-result').hidden, true);
});
test('clipboard denial provides a manual fallback even without a selection object', async () => {
  const p = await page(async () => { throw new Error('Permission denied'); }); p.fill(); p.submit();
  p.el('copy-brief').dispatchEvent(new Event('click')); await tick(); assert.match(p.el('form-status').textContent, /Copy was blocked/); assert.equal(p.el('copy-brief').disabled, false);
});
