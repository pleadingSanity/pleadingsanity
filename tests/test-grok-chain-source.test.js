import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../netlify/lib/ai-chain.ts', import.meta.url), 'utf8');

test('website Grok path is present and does not reorder the chain', () => {
  assert.match(source, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
  assert.match(source, /process\.env\.GROK_API_KEY \|\| process\.env\.xAI_KEY \|\| process\.env\.XAI_API_KEY/);
  assert.match(source, /baseURL: "https:\/\/api\.x\.ai\/v1"/);
  assert.match(source, /model: "grok-4\.7"/);
  assert.match(source, /sitting out until GROK_API_KEY or xAI_KEY is set/);
  assert.doesNotMatch(source, /GROK_API_KEY\s*=\s*["'][^"']+/);
});
