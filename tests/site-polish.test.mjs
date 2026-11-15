// Site polish checks (15 Nov 2026): page transitions, radio skip link, root icon redirects.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');

test('shared CSS opts into cross-document view transitions with a reduced-motion off switch', () => {
  for (const f of ['css/site.css', 'css/ui-polish.css', 'css/styles.css', 'css/city-night.css', 'css/radio-perfection.css']) {
    const css = read(f);
    assert.match(css, /@view-transition\s*{\s*navigation:\s*auto;\s*}/, f);
    assert.match(css, /prefers-reduced-motion:\s*reduce\)\s*{\s*@view-transition\s*{\s*navigation:\s*none;/, f);
    assert.doesNotMatch(css.slice(css.indexOf('Seamless page-to-page')), /#(ff4d8d|000103)|purple|violet|indigo|magenta/i, f);
  }
});

test('radio page skip link is hidden until focused', () => {
  assert.match(read('insane-radio.html'), /class="skip-link"/);
  const css = read('css/radio-perfection.css');
  assert.match(css, /\.skip-link\{[^}]*top:-60px/);
  assert.match(css, /\.skip-link:focus[^{]*\{[^}]*top:12px/);
});

test('root icon requests resolve and binary sources stay private', () => {
  const r = read('_redirects');
  assert.match(r, /^\/apple-touch-icon\.png\s+\/assets\/apple-touch-icon\.png\s+200$/m);
  assert.match(r, /^\/apple-touch-icon-precomposed\.png\s+\/assets\/apple-touch-icon\.png\s+200$/m);
  assert.match(r, /^\/binary-src\/\*\s+\/404\.html\s+404!$/m, 'forced so the real files are shadowed');
});
