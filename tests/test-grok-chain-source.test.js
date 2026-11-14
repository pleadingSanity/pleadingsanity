import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../netlify/lib/ai-chain.ts', import.meta.url), 'utf8');
const config = readFileSync(new URL('../netlify/lib/provider-config.js', import.meta.url), 'utf8');

test('website Grok path is present and does not reorder the chain', () => {
  assert.match(source, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
  // Key names moved to provider-config.js; the old order is kept after the ARRON_GROK_KEY drop-in.
  assert.match(source, /const grokKey = resolveKey\("grok"\)\.value/);
  assert.match(config, /grok: \["ARRON_GROK_KEY", "GROK_API_KEY", "xAI_KEY", "XAI_API_KEY"\]/);
  assert.match(source, /baseURL: "https:\/\/api\.x\.ai\/v1"/);
  // grok-2 is retired by xAI; the no-soul fallback now uses the current id and grok-4.3 as the second name.
  assert.doesNotMatch(source, /model: "grok-2"/);
  assert.match(config, /grok: "grok-4\.7"/);
  assert.match(config, /GROK_SECOND_MODEL = "grok-4\.3"/);
  assert.match(source, /sitting out until GROK_API_KEY or xAI_KEY is set/);
  assert.doesNotMatch(source, /GROK_API_KEY\s*=\s*["'][^"']+/);
});
