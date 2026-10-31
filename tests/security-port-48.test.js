// Source contracts for the security fixes ported from closed PR #48.
// Read-only. No network, database, or provider call.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

function rawErrorLogs(source) {
  return source.split('\n').filter((line) => /console\.error\([^;\n]*,\s*error\s*\)/.test(line));
}

test('direct OpenAI fallback is not built from a Gateway key', () => {
  const source = read('netlify/lib/ai-chain.ts');
  assert.match(source, /process\.env\.OPENAI_API_KEY && !process\.env\.OPENAI_BASE_URL/);
  assert.match(source, /baseURL: "https:\/\/api\.openai\.com\/v1"/);
  assert.doesNotMatch(source, /const openaiDirect = process\.env\.OPENAI_API_KEY\s*\n\s*\?/);
});

test('rap stays rate-limited, same-origin, and treats member text as data', () => {
  const source = read('netlify/functions/rap.mts');
  assert.match(source, /allow\("ai", context\)/);
  assert.match(source, /new URL\(origin\)\.host === new URL\(req\.url\)\.host/);
  assert.match(source, /Not allowed from another site/);
  assert.match(source, /<member_text>/);
  assert.doesNotMatch(source, /console\.error\([^;\n]*,\s*error\s*\)/);
});

test('image reads stay visibility-checked and logs omit query text', () => {
  const source = read('netlify/functions/images.mts');
  assert.match(source, /Deny access by default/);
  assert.match(source, /posts\.imageKey/);
  assert.match(source, /logReason\(error\)/);
  assert.equal(rawErrorLogs(source).length, 0);
});

test('poker seat names are cleaned on the server and escaped in the page', () => {
  const api = read('netlify/functions/poker-room.mts');
  const page = read('poker.html');
  assert.match(api, /const cleanName = \(v: unknown\)/);
  assert.match(api, /cleanNames\(room\.players\)/);
  assert.match(page, /function esc\(v\)/);
  assert.match(page, /\$\{esc\(s\.name\)\}/);
});

test('source paths and env files are sent to the 404 page', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /^\/\.env\s+\/404\.html\s+404!/m);
  assert.match(redirects, /^\/\.env\.\*\s+\/404\.html\s+404!/m);
  assert.match(redirects, /^\/netlify\/\*\s+\/404\.html\s+404!/m);
  assert.match(redirects, /^\/db\/\*\s+\/404\.html\s+404!/m);
});

test('function logs do not print a raw error object', () => {
  const files = [
    'netlify/functions/ai-family-daily.mts',
    'netlify/functions/arron-grow.mts',
    'netlify/functions/blueprint.mts',
    'netlify/functions/images.mts',
    'netlify/functions/owner.mts',
    'netlify/functions/profile.mts',
    'netlify/functions/studio-podcast-background.mts',
    'netlify/functions/studio-weekly.mts',
    'netlify/functions/studio.mts',
    'netlify/lib/arron-growth.ts',
    'netlify/lib/social.ts',
  ];
  const leaks = [];
  for (const file of files) {
    for (const line of rawErrorLogs(read(file))) leaks.push(file + ': ' + line.trim());
  }
  assert.deepEqual(leaks, []);
});
