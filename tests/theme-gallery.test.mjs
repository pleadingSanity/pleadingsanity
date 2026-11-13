import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderThemes, loadGallery } from '../js/theme-gallery.js';

function documentStub() {
  const nodes = new Map();
  function element(tag) {
    return { tag, children: [], attributes: {}, events: {}, textContent: '',
      append(...items) { this.children.push(...items); },
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(name, callback) { this.events[name] = callback; }
    };
  }
  return { createElement: element, getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, element('div'));
    return nodes.get(id);
  } };
}

test('gallery preserves full artwork links and renders captions as text', () => {
  const doc = documentStub();
  assert.equal(renderThemes(doc, [{ file: 'brain-split.png', bestFor: '<b>Original artwork</b>' }]), 1);
  const card = doc.getElementById('artwork-grid').children[0];
  const [link, caption] = card.children;
  const image = link.children[0];
  assert.equal(link.href, '/images/themes/dola-2026/brain-split.png');
  assert.equal(image.src, '/images/themes/dola-2026/brain-split.webp');
  assert.equal(image.alt, '<b>Original artwork</b>');
  assert.equal(caption.children[0].textContent, '<b>Original artwork</b>');
  image.events.error();
  assert.equal(image.src, link.href);
});

test('gallery rejects external, traversing and malformed asset entries', () => {
  const doc = documentStub();
  const entries = ['https://example.test/x.png', '../secret.png', 'x.svg', 'x.png?token=value'].map(file => ({ file, bestFor: 'Art' }));
  assert.equal(renderThemes(doc, [null, {}, ...entries]), 0);
  assert.equal(doc.getElementById('artwork-grid').children.length, 0);
});

test('all collection originals and optimized images exist', () => {
  const root = new URL('../images/themes/dola-2026/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
  const doc = documentStub();
  assert.equal(renderThemes(doc, manifest.themes), manifest.themes.length);
  for (const theme of manifest.themes) {
    assert.ok(existsSync(new URL(theme.file, root)), theme.file);
    assert.ok(existsSync(new URL(theme.file.replace(/\.(png|jpg)$/i, '.webp'), root)), theme.file);
  }
});

test('gallery announces the loaded collection', async () => {
  const doc = documentStub();
  await loadGallery(doc, async url => {
    assert.equal(url, '/images/themes/dola-2026/manifest.json');
    return { ok: true, json: async () => ({ themes: [{ file: 'podium.png', bestFor: 'Spotlight' }] }) };
  });
  assert.match(doc.getElementById('gallery-status').textContent, /1 artwork ·/);
});

test('gallery exposes failures instead of leaving a blank page', async () => {
  for (const fetcher of [async () => { throw Error('offline'); }, async () => ({ ok: false }), async () => ({ ok: true, json: async () => ({}) })]) {
    const doc = documentStub();
    await loadGallery(doc, fetcher);
    assert.match(doc.getElementById('gallery-status').textContent, /could not load/);
  }
});

test('visual audit ignores template strings and still checks literal image references', () => {
  const report = JSON.parse(execFileSync(process.execPath, [new URL('../scripts/audit-visual-assets.mjs', import.meta.url).pathname], { encoding: 'utf8' }));
  assert.equal(report.totals.missing, 0);
  assert.equal(report.totals.noAlt, 0);
  assert.ok(report.totals.images > 200);
});

test('visual audit still fails on a real missing image while excluding script templates', () => {
  const root = mkdtempSync(join(tmpdir(), 'ps-image-audit-'));
  try {
    writeFileSync(join(root, 'index.html'), `<img src="missing.webp" alt="Missing artwork"><script>const markup = '<img src="/dynamic/' + name + '.webp" alt="">';</script>`);
    let output;
    try {
      output = execFileSync(process.execPath, [new URL('../scripts/audit-visual-assets.mjs', import.meta.url).pathname], { cwd: root, encoding: 'utf8' });
      assert.fail('a missing image must fail the audit');
    } catch (error) {
      assert.equal(error.status, 1);
      output = error.stdout;
    }
    const report = JSON.parse(output);
    assert.equal(report.totals.images, 1);
    assert.equal(report.totals.missing, 1);
    assert.equal(report.issues[0].detail, 'src: missing.webp');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
