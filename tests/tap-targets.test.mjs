// 48px tap targets on phones (10 Nov 2026). Static guards; the 390x844 measurements
// are in AI_HANDOFF.md (Playwright, iPhone user agent).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('css/tap-targets.css');
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');

test('tap-target layer is sizing only: no colour, font or border values', () => {
  assert.doesNotMatch(rules, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\bcolor\s*:|background|border|font|box-shadow|outline/i);
  assert.match(rules, /min-height:\s*48px/);
  assert.doesNotMatch(rules, /display:\s*none|visibility:\s*hidden/, 'nothing may be hidden');
});

test('tap-target layer loads last on the homepage and the Arron app', () => {
  for (const page of ['index.html', 'arron-app.html']) {
    const html = read(page);
    const at = html.indexOf('<link rel="stylesheet" href="/css/tap-targets.css">');
    assert.ok(at > 0, `${page} links tap-targets.css`);
    const head = html.slice(0, html.indexOf('</head>'));
    const lastSheet = head.lastIndexOf('rel="stylesheet"');
    assert.ok(lastSheet <= at + 20, `${page}: tap-targets.css is the last stylesheet in <head>`);
  }
});

test('Arron install banner close: 48px rule, visible SVG X, label kept', () => {
  const html = read('arron-app.html');
  const button = html.match(/<button[^>]*id="aa-install-close"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(button, 'close button present');
  assert.match(button[0], /aria-label="Not now"/);
  assert.match(button[1], /<svg[^>]*aria-hidden="true"/);
  assert.match(button[1], /stroke="#cbd5e1"/, 'silver icon from the locked palette');
  assert.match(rules, /#aa-install-close\s*\{[^}]*min-width:\s*48px[^}]*min-height:\s*48px/);
  assert.match(rules, /#aa-install-banner > p\s*\{\s*flex:\s*0 0 auto;\s*\}/);
});

test('crisis strip and every crisis number are still on the Arron app', () => {
  const html = read('arron-app.html');
  for (const href of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111', 'tel:08001111', 'tel:08082000247', '/crisis.html']) {
    assert.ok(html.includes(`href="${href}"`), href);
  }
  assert.match(rules, /\.aa-crisis-persist a\s*\{[^}]*min-height:\s*48px/);
});
