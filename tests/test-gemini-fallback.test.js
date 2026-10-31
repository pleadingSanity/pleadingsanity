import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PROVIDER_ORDER,
  GEMINI_DIRECT_MODEL,
  GEMINI_STEP_MS,
  geminiDirectRequest,
  readGeminiKey,
  walkProviders,
} from '../netlify/lib/provider-fallback.js';

const chain = readFileSync(new URL('../netlify/lib/ai-chain.ts', import.meta.url), 'utf8');
const arron = readFileSync(new URL('../netlify/functions/arron.mts', import.meta.url), 'utf8');

function fail(name, status) {
  const error = new Error(name);
  error.name = name;
  if (status) error.status = status;
  return error;
}

test('fallback order is GPT, Claude, Gemini, then Grok', async () => {
  assert.deepEqual(PROVIDER_ORDER, ['openai', 'anthropic', 'gemini', 'grok']);
  const seen = [];
  const won = await walkProviders(PROVIDER_ORDER, {
    openai: async () => { seen.push('openai'); throw fail('TimeoutError'); },
    anthropic: async () => { seen.push('anthropic'); throw fail('Error', 429); },
    gemini: async () => { seen.push('gemini'); return { text: 'here', model: GEMINI_DIRECT_MODEL }; },
    grok: async () => { seen.push('grok'); return 'should not run'; },
  });
  assert.equal(won.provider, 'gemini');
  assert.equal(won.model, 'gemini-2.5-flash');
  assert.equal(won.text, 'here');
  assert.deepEqual(seen, ['openai', 'anthropic', 'gemini']);
  assert.deepEqual(won.tried, ['openai', 'anthropic', 'gemini']);
});

test('a spent time budget stops before the later providers', async () => {
  let grok = 0;
  await assert.rejects(
    () => walkProviders(PROVIDER_ORDER, {
      openai: async () => { throw fail('OutOfTime'); },
      grok: async () => { grok += 1; return 'late'; },
    }),
    (error) => error.name === 'OutOfTime',
  );
  assert.equal(grok, 0);
});

test('every quiet provider is reported in order', async () => {
  await assert.rejects(
    () => walkProviders(PROVIDER_ORDER, {
      openai: async () => '',
      anthropic: async () => { throw fail('Error', 402); },
      gemini: async () => '   ',
      grok: async () => { throw fail('TimeoutError'); },
    }),
    (error) => {
      assert.equal(error.message, 'Every AI provider failed');
      assert.deepEqual(error.tried, PROVIDER_ORDER);
      return true;
    },
  );
});

test('direct Gemini request names gemini-2.5-flash and carries no key', () => {
  const request = geminiDirectRequest(
    [{ role: 'assistant', content: 'Hello' }, { role: 'user', content: 'Stay with me' }],
    'SAFETY FIRST\nSamaritans 116 123',
  );
  assert.equal(request.model, GEMINI_DIRECT_MODEL);
  assert.equal(GEMINI_STEP_MS, 4500);
  assert.equal(request.contents[0].role, 'model');
  assert.equal(request.contents[1].role, 'user');
  assert.equal(request.config.maxOutputTokens, 800);
  assert.equal(request.config.systemInstruction.includes('116 123'), true);
  assert.equal(JSON.stringify(request).includes('AIza'), false);
  assert.equal(Object.hasOwn(request, 'apiKey'), false);
  assert.throws(() => readGeminiKey({}), /GEMINI_API_KEY is not set/);
  assert.equal(readGeminiKey({ GEMINI_API_KEY: '  from-env  ' }), 'from-env');
});

test('the live chain keeps the order and reads the Gemini key from the environment', () => {
  assert.match(chain, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
  assert.match(chain, /export async function callGeminiFallback/);
  assert.match(chain, /gemini-2\.5-flash/);
  assert.match(chain, /readGeminiKey\(\)/);
  assert.match(chain, /process\.env\.GEMINI_API_KEY/);
  assert.match(chain, /walkProviders\(CHAIN\.map/);
  assert.doesNotMatch(chain, /GEMINI_API_KEY\s*=\s*["'][^"']+/);
  assert.doesNotMatch(chain, /AIza[0-9A-Za-z_-]{10,}/);
});

test('crisis is decided before Arron asks a provider, and the real lines stay', () => {
  const crisisAt = arron.indexOf('const crisis = mood === "crisis" || CRISIS_WORDS.test(message)');
  const replyAt = arron.indexOf('answer = await reply(');
  assert.ok(crisisAt > 0);
  assert.ok(replyAt > crisisAt);
  assert.match(arron, /const CRISIS_SIGNPOST = "[^"]*999[^"]*116 123[^"]*85258[^"]*111/);
  assert.match(arron, /if \(crisis\) return json\(\{ reply: crisisReply/);
});
