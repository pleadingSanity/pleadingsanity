/**
 * Read-only visual asset audit for the existing Pleading Sanity HTML pages.
 * Run: node scripts/audit-visual-assets.mjs
 * Writes no files and makes no network requests.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';

const root = process.cwd();
const skip = new Set(['.git', 'node_modules', '.netlify', 'dist', 'build', 'coverage']);
const pages = [];
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') && item.isDirectory()) continue;
    const full = join(dir, item.name);
    if (item.isDirectory()) { if (!skip.has(item.name)) walk(full); }
    else if (item.name.endsWith('.html')) pages.push(full);
  }
}
walk(root);
const issues = [];
const totals = { pages: pages.length, images: 0, missing: 0, noAlt: 0, decorative: 0, remote: 0, emptySections: 0 };
const assetAttrs = /<(img|source)\b[^>]*>/gi;
function attr(tag, name) {
  const m = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\x27([^\x27]*)\x27)', 'i'));
  return m ? (m[1] ?? m[2]) : null;
}
function checkUrl(url, page, label) {
  if (!url || /^(data:|blob:|#|javascript:)/i.test(url)) return;
  if (/^https?:\/\//i.test(url)) { totals.remote++; return; }
  const clean = url.split(/[?#]/)[0];
  if (!clean || /\$\{|\{\{|<%/.test(clean)) return;
  const target = clean.startsWith('/') ? resolve(root, '.' + clean) : resolve(dirname(page), clean);
  if (!target.startsWith(root + '/') && target !== root) return;
  if (!existsSync(target) || !statSync(target).isFile()) {
    totals.missing++;
    issues.push({ page: page.slice(root.length + 1), type: 'missing-image', detail: label + ': ' + url });
  }
}
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const short = page.slice(root.length + 1);
  for (const match of html.matchAll(assetAttrs)) {
    const tag = match[0], type = match[1].toLowerCase();
    if (type === 'img') {
      totals.images++;
      const alt = attr(tag, 'alt');
      if (alt === null) { totals.noAlt++; issues.push({ page: short, type: 'missing-alt', detail: tag.slice(0, 150) }); }
      else if (alt === '') totals.decorative++;
    }
    const src = attr(tag, 'src');
    if (src) checkUrl(src, page, 'src');
    const srcset = attr(tag, 'srcset');
    if (srcset) for (const candidate of srcset.split(',')) checkUrl(candidate.trim().split(/\s+/)[0], page, 'srcset');
  }
  for (const match of html.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi)) {
    if (/\.(png|jpe?g|webp|avif|gif|svg)(?:[?#]|$)/i.test(match[2])) checkUrl(match[2], page, 'inline CSS');
  }
  // Flag only truly empty sections for human visual review; dark styling alone is intentional.
  for (const match of html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)) {
    const body = match[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').trim();
    if (!body) { totals.emptySections++; issues.push({ page: short, type: 'empty-section-review', detail: 'Empty section around character ' + match.index }); }
  }
}
console.log(JSON.stringify({ totals, issues }, null, 2));
if (totals.missing) process.exitCode = 1;
