#!/usr/bin/env node
/**
 * PLEADING SANITY — whole-repository static integrity audit.
 * Read-only. No network, no secrets, no user data, no deploy.
 * Run: node scripts/audit-ecosystem.mjs
 * Exit nonzero only for high-confidence broken local references and missing safety anchors.
 */
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git','node_modules','.netlify','.next','dist','build','coverage','archive','vendor','tmp']);
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes:true })) {
    if (entry.name.startsWith('.') || ignored.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) files.push(full);
  }
}
walk(root);
const html = files.filter(p => extname(p).toLowerCase() === '.html');
const problems = [];
const pageData = [];
const issue = (severity, path, rule, detail) => problems.push({severity,path,rule,detail});
const rootRel = p => p.slice(root.length + 1).replaceAll('\\','/');
const decode = s => { try { return decodeURIComponent(s); } catch { return s; } };
const isExternal = s => /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?|data:)/i.test(s);
function localTarget(raw, page) {
  const s = decode(raw.split(/[?#]/)[0].trim());
  if (!s || isExternal(raw.trim()) || s.includes('{{') || s.includes('${')) return null;
  if (s.startsWith('/.netlify/') || s.startsWith('/api/')) return null;
  if (s.includes('\\') || s.split('/').includes('..') && s.startsWith('/')) return null;
  const target = s.startsWith('/') ? resolve(root, '.' + s) : resolve(dirname(page), s);
  if (!(target === root || target.startsWith(root + '/'))) return null;
  return target;
}
const reAttr = /\b(?:href|src|poster|action)\s*=\s*["']([^"']+)["']/gi;
for (const page of html) {
  const rel = rootRel(page), src = readFileSync(page,'utf8');
  const title = src.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g,' ').trim() || '';
  const h1 = [...src.matchAll(/<h1\b/gi)].length;
  const canonical = src.match(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/i)?.[0] || '';
  const desc = /<meta\b(?=[^>]*name\s*=\s*["']description["'])[^>]*>/i.test(src);
  const sensitive = /(?:^|\/)(?:arron|journal-vault|support|crisis)\.html$/i.test(rel);
  const mental = /\b(?:crisis|suicid|mental health|Arron)\b/i.test(src);
  if (!title) issue('warning',rel,'seo-title','Missing <title>');
  if (!desc) issue('warning',rel,'seo-description','Missing meta description');
  if (h1 !== 1) issue('warning',rel,'heading-structure','Expected one H1, found '+h1);
  if (!canonical) issue('info',rel,'seo-canonical','No explicit canonical link');
  if (mental && !src.includes('116 123')) issue('warning',rel,'crisis-reference','Mentions mental health/crisis/Arron but no visible-source Samaritans 116 123');
  if (sensitive && /<script\b[^>]*src=["'][^"']*\/music-player\.js["']/i.test(src)) issue('warning',rel,'quiet-page','Background music player included on sensitive page');
  const refs = new Set();
  for (const match of src.matchAll(reAttr)) {
    const value = match[1].trim();
    if (refs.has(value)) continue;
    refs.add(value);
    const target = localTarget(value,page);
    if (!target) continue;
    let found = existsSync(target);
    if (found && statSync(target).isDirectory()) found = existsSync(join(target,'index.html'));
    if (!found && !extname(target)) found = existsSync(target + '.html');
    if (!found && !value.includes('*')) issue('error',rel,'missing-local-reference',value);
  }
  pageData.push({page:rel,title,h1,links:refs.size,sensitive,mental});
}
const count = sev => problems.filter(x=>x.severity===sev).length;
const report = {generatedAt:new Date().toISOString(),scope:{htmlPages:html.length,files:files.length},summary:{errors:count('error'),warnings:count('warning'),info:count('info')},pages:pageData,issues:problems};
const out = process.argv.includes('--json') ? 'json' : 'text';
if (out === 'json') console.log(JSON.stringify(report,null,2));
else {
  console.log('PLEADING SANITY — WHOLE SITE STATIC AUDIT');
  console.log('HTML pages:',html.length,'Files:',files.length,'Errors:',count('error'),'Warnings:',count('warning'),'Info:',count('info'));
  for (const p of problems) console.log('['+p.severity+'] '+p.path+' :: '+p.rule+' :: '+p.detail);
  console.log('Scope note: static analysis only. Dynamic routes, Netlify rewrites, JavaScript navigation, browser UX, external URLs, auth and production are NOT verified.');
}
if (process.argv.includes('--strict') && count('error')) process.exitCode = 1;
