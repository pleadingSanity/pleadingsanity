// Writes binary assets (images, icons) from base64 text in /binary-src.
// Why: the agent box cannot `git push`, and the GitHub connector commits text
// only. So new or replaced images are committed as base64 text and turned back
// into real files at build time (Netlify runs this via validate-build.cjs) and
// before `npm test`.
//   binary-src/assets/icons/icon-512x512.png.base64  ->  assets/icons/icon-512x512.png
// When someone can push binaries directly, commit the real files and delete
// the matching .base64 (or the whole folder). Safe to run any number of times.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = path.join(root, 'binary-src');
let written = 0, same = 0;
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!entry.name.endsWith('.base64')) continue;
    const rel = path.relative(src, full).slice(0, -7);
    if (rel.startsWith('..') || path.isAbsolute(rel) || /(^|[\\/])\.\.([\\/]|$)/.test(rel)) continue;
    const target = path.join(root, rel);
    const bytes = Buffer.from(fs.readFileSync(full, 'utf8').replace(/\s+/g, ''), 'base64');
    if (!bytes.length) throw new Error('empty base64 asset: ' + rel);
    if (fs.existsSync(target) && fs.readFileSync(target).equals(bytes)) { same++; continue; }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    written++;
  }
}
walk(src);
console.log(`Binary assets from base64: ${written} written, ${same} already current.`);
