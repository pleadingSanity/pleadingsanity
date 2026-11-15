import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../netlify/functions/arron.mts', import.meta.url), 'utf8');
test('owner AI status is restricted to GET and authenticated owner', () => {
  const start = src.indexOf('if (route === "owner-ai-status")');
  const end = src.indexOf('if (route === "health")', start);
  assert.ok(start >= 0 && end > start);
  const body = src.slice(start, end);
  assert.match(body, /req\.method !== "GET"/);
  assert.match(body, /await optionalUser\(\)/);
  assert.match(body, /if \(!user\?\.isOwner\) return json\(\{ error: "Not found" \}, 404\)/);
  assert.match(body, /liveProviderHealth: "not tested"/);
  assert.doesNotMatch(body, /apiKey:\s*process\.env|keyValue:\s*process\.env/);
});
