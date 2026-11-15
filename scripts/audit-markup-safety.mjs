#!/usr/bin/env node
/**
 * Reproducible static markup scan for Pleading Sanity HTML pages.
 * Read-only. No network. Does not print secret values.
 * Run: node scripts/audit-markup-safety.mjs
 * JSON: node scripts/audit-markup-safety.mjs --json
 *
 * Exit 0. This report is evidence, not a release gate. scripts/audit-site.py
 * remains the house-guard check.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignore = new Set(['.git', 'node_modules', '.netlify', 'archive']);
let files = [];
try {
  files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
} catch {
  files = [];
}
const pages = files.filter(file => file.endsWith('.html') && !file.split('/').some(part => ignore.has(part)));

function redirects() {
  const rules = [];
  const file = path.join(root, '_redirects');
  if (!existsSync(file)) return rules;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.split('#')[0].trim();
    const parts = line.split(/\s+/);
    if (parts.length >= 2 && !parts[0].startsWith('#')) rules.push([parts[0], parts[1].split('#')[0]]);
  }
  return rules;
}
const redirectRules = redirects();

function onDisk(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const rel = clean.replace(/^\//, '');
  const candidates = [rel, rel + '.html', path.posix.join(rel, 'index.html')];
  return candidates.some(item => {
    const full = path.join(root, item);
    return existsSync(full) && statSync(full).isFile();
  });
}
function resolves(raw) {
  let current = raw.startsWith('/') ? raw : '/' + raw;
  const seen = new Set();
  for (let i = 0; i < 12; i++) {
    if (seen.has(current)) return false;
    seen.add(current);
    const pathOnly = current.split(/[?#]/)[0];
    if (onDisk(pathOnly)) return true;
    const next = redirectRules.find(([from]) => from === pathOnly);
    if (!next) return false;
    current = next[1];
  }
  return false;
}

const banned = [
  [/#[Ff][Ff]4[Dd]8[Dd]/g, '#ff4d8d'],
  [/#[Ff][Ff]00[Ff][Ff]/g, '#ff00ff'],
  [/#[Ff][Ff]66[Ff][Ff]/g, '#ff66ff'],
  [/#000103/g, '#000103'],
  [/#(?:4f46e5|6366f1|7c3aed|8b5cf6|a855f7|6d28d9|312e81)/gi, 'indigo/violet hex']
];
const secret = /(sk_live_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z\-_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|xox[baprs]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{20,})/g;
const emoji = /[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/gu;
const symbol = /[♫♠♥♦♣✨]/gu;

function visible(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
}
function attrs(source) {
  const found = {};
  for (const match of source.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    found[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return found;
}

const report = {
  pages: pages.length,
  missingTitle: [],
  missingDescription: [],
  missingCanonical: [],
  missingOgTitle: [],
  missingOgDescription: [],
  imagesWithoutAlt: [],
  unlabeledControls: [],
  brokenInternalLinks: [],
  missingAssets: [],
  bannedColours: [],
  emoji: [],
  symbols: [],
  secrets: [],
  trackerSignatures: [],
  thirdPartyHosts: {}
};
const tracker = /google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr|\bfbq\s*\(|\bgtag\s*\(|hotjar\.com|clarity\.ms|doubleclick\.net|adsbygoogle/gi;
for (const file of files) {
  if (!/\.(?:js|mjs|html)$/.test(file) || file.startsWith('tests/') || file.startsWith('scripts/')) continue;
  const text = readFileSync(path.join(root, file), 'utf8');
  tracker.lastIndex = 0;
  const hits = text.match(tracker);
  if (hits) report.trackerSignatures.push({ file, signatures: [...new Set(hits)] });
}

for (const file of pages) {
  const html = readFileSync(path.join(root, file), 'utf8');
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] || html.slice(0, 4000);
  const headTitle = head.match(/<title\b[^>]*>\s*([^<]+?)\s*<\/title>/i);
  if (!headTitle) report.missingTitle.push(file);
  if (!/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']\s*\S)[^>]*>/i.test(head)) report.missingDescription.push(file);
  if (!/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(head)) report.missingCanonical.push(file);
  if (!/<meta\b(?=[^>]*\bproperty=["']og:title["'])(?=[^>]*\bcontent=["']\s*\S)[^>]*>/i.test(head)) report.missingOgTitle.push(file);
  if (!/<meta\b(?=[^>]*\bproperty=["']og:description["'])(?=[^>]*\bcontent=["']\s*\S)[^>]*>/i.test(head)) report.missingOgDescription.push(file);

  const withoutSvg = html.replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
  for (const image of withoutSvg.matchAll(/<img\b([^>]*)>/gi)) {
    const tag = attrs(image[1]);
    if (!Object.hasOwn(tag, 'alt')) report.imagesWithoutAlt.push({ file, src: tag.src || '' });
  }

  for (const button of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const tag = attrs(button[1]);
    const text = button[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!text && !tag['aria-label'] && !tag['aria-labelledby']) report.unlabeledControls.push({ file, kind: 'button' });
  }
  for (const input of html.matchAll(/<input\b([^>]*)>/gi)) {
    const tag = attrs(input[1]);
    const type = (tag.type || 'text').toLowerCase();
    if (type === 'hidden') continue;
    if (['submit', 'button', 'reset'].includes(type) && (tag.value || tag['aria-label'])) continue;
    const id = tag.id;
    const wrapped = id && new RegExp(`<label\\b[^>]*\\bfor=["']${id}["']`, 'i').test(html);
    if (tag['aria-label'] || tag['aria-labelledby'] || wrapped) continue;
    report.unlabeledControls.push({ file, kind: 'input:' + type, id: id || '' });
  }

  for (const link of html.matchAll(/(?:^|[^\w-])(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const value = link[1].trim();
    if (!value || value.startsWith('#') || /^(?:mailto|tel|sms|data|javascript):/i.test(value)) continue;
    if (/^https?:\/\//i.test(value)) {
      try {
        const host = new URL(value).host;
        if (!/pleadingsanity\.(co\.uk|uk)$/i.test(host)) report.thirdPartyHosts[host] = (report.thirdPartyHosts[host] || 0) + 1;
      } catch { /* ignore malformed */ }
      continue;
    }
    if (value.startsWith('/api/') || value.startsWith('/.netlify/') || value.includes('${') || value.endsWith('/')) continue;
    const pathOnly = value.split(/[?#]/)[0];
    const local = pathOnly.startsWith('/') ? pathOnly : '/' + pathOnly;
    if (!resolves(local) && !pathOnly.endsWith('/')) {
      const bucket = /\.(?:png|jpe?g|gif|webp|svg|ico|css|js|mjs|json|pdf|woff2?|mp3|mp4|webmanifest)$/i.test(pathOnly)
        ? report.missingAssets : report.brokenInternalLinks;
      bucket.push({ file, url: value });
    }
  }

  for (const [pattern, name] of banned) {
    const hits = html.match(pattern);
    if (hits) report.bannedColours.push({ file, name, count: hits.length });
  }
  const shown = visible(html);
  const emojiHits = shown.match(emoji) || [];
  if (emojiHits.length) report.emoji.push({ file, sample: [...new Set(emojiHits)].slice(0, 6) });
  const symbolHits = shown.match(symbol) || [];
  if (symbolHits.length) report.symbols.push({ file, sample: [...new Set(symbolHits)].slice(0, 6) });
  for (const match of html.matchAll(secret)) {
    report.secrets.push({ file, kind: match[1].slice(0, 4) + '…' });
  }
}

const summary = {
  pages: report.pages,
  missingTitle: report.missingTitle.length,
  missingDescription: report.missingDescription.length,
  missingCanonical: report.missingCanonical.length,
  missingOgTitle: report.missingOgTitle.length,
  missingOgDescription: report.missingOgDescription.length,
  imagesWithoutAlt: report.imagesWithoutAlt.length,
  unlabeledControls: report.unlabeledControls.length,
  brokenInternalLinks: report.brokenInternalLinks.length,
  missingAssets: report.missingAssets.length,
  bannedColourFiles: report.bannedColours.length,
  emojiPages: report.emoji.length,
  symbolPages: report.symbols.length,
  secrets: report.secrets.length,
  trackerSignatures: report.trackerSignatures.length,
  thirdPartyHosts: Object.keys(report.thirdPartyHosts).length
};
report.summary = summary;

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  console.log('PLEADING SANITY — markup safety scan');
  console.log(JSON.stringify(summary, null, 2));
  const lists = ['missingTitle', 'missingDescription', 'missingCanonical', 'missingOgTitle', 'missingOgDescription', 'imagesWithoutAlt', 'brokenInternalLinks', 'missingAssets', 'emoji', 'secrets', 'trackerSignatures'];
  for (const key of lists) {
    if (!report[key].length) continue;
    console.log('\n' + key);
    for (const item of report[key].slice(0, 40)) console.log(' - ' + (typeof item === 'string' ? item : JSON.stringify(item)));
  }
  console.log('\nThird-party hosts: ' + Object.keys(report.thirdPartyHosts).sort().join(', '));
  console.log('Static scan only. Live HTTP, playback, and screen-reader behaviour are not proven.');
}
