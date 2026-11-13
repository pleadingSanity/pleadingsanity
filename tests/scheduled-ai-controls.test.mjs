import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
async function scheduled(env, reserve) {
  const context = vm.createContext({ process: { env }, console });
  const module = new vm.SourceTextModule(stripTypeScriptTypes(read('netlify/lib/scheduled-ai.ts')), { context });
  await module.link(() => new vm.SyntheticModule(['withinDailyLimit'], function () {
    this.setExport('withinDailyLimit', reserve);
  }, { context }));
  await module.evaluate();
  return module.namespace.scheduledAiAllowed;
}

test('scheduled AI defaults off and rejects missing, invalid or excessive caps before accounting', async () => {
  for (const env of [{}, { PS_SCHEDULED_AI_ENABLED: 'true' }, ...['-1', '1.5', '5', 'NaN'].map(cap => ({ PS_SCHEDULED_AI_ENABLED: 'true', PS_SCHEDULED_AI_DAILY_CAP: cap }))]) {
    const gate = await scheduled(env, () => { throw Error('must not reach accounting'); });
    assert.equal(await gate('test'), false);
  }
});
test('enabled jobs share an admission counter and stop when exhausted', async () => {
  let used = 0;
  const gate = await scheduled({ PS_SCHEDULED_AI_ENABLED: 'true', PS_SCHEDULED_AI_DAILY_CAP: '2' }, async (key, cap) => {
    assert.equal(key, 'scheduled-ai:site');
    assert.equal(cap, 2);
    return ++used <= cap;
  });
  assert.equal(await gate('family'), true);
  assert.equal(await gate('growth'), true);
  assert.equal(await gate('podcast'), false);
});
test('scheduled AI fails closed when accounting fails', async () => {
  const gate = await scheduled({ PS_SCHEDULED_AI_ENABLED: 'true', PS_SCHEDULED_AI_DAILY_CAP: '1' }, async () => { throw Error('database unavailable'); });
  assert.equal(await gate('test'), false);
});
test('all three scheduled handlers gate before beginning their work', () => {
  for (const name of ['ai-family-daily', 'arron-grow', 'studio-weekly']) {
    assert.match(read(`netlify/functions/${name}.mts`), /export default async \(\) => \{\s*if \(!\(await scheduledAiAllowed\("[a-z-]+"\)\)\) return;/);
  }
});

async function probe(user) {
  let calls = 0;
  const context = vm.createContext({ process: { env: {} }, console, Response, URL, AbortController, setTimeout, clearTimeout,
    fetch: async () => { calls++; throw Error('provider calls forbidden'); } });
  const module = new vm.SourceTextModule(stripTypeScriptTypes(read('netlify/functions/arron-health.mts')), { context });
  const values = {
    '../../db/index.js': { db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }) } },
    '../../db/schema.js': { rateLimits: { key: 'key' } },
    'drizzle-orm': { sql: () => '' },
    '../lib/rate-limit.js': { allow: async () => true, slowDown: () => Response.json({}, { status: 429 }) },
    '../lib/social.js': { optionalUser: async () => user },
  };
  await module.link(name => new vm.SyntheticModule(Object.keys(values[name]), function () {
    for (const [key, value] of Object.entries(values[name])) this.setExport(key, value);
  }, { context }));
  await module.evaluate();
  return { run: module.namespace.default, calls: () => calls };
}
test('guests and ordinary members cannot invoke either active probe without a configured token', async () => {
  for (const user of [null, { isOwner: false }]) {
    const api = await probe(user);
    for (const level of [1, 2]) {
      const response = await api.run(new Request(`https://example.test/api/ops/ai-probe?probe=${level}`), {});
      assert.equal(response.status, 404);
    }
    assert.equal(api.calls(), 0);
  }
});
test('public configuration probe still makes no provider calls', async () => {
  const api = await probe(null);
  const response = await api.run(new Request('https://example.test/api/ops/ai-probe'), {});
  assert.equal(response.status, 200);
  assert.equal(api.calls(), 0);
});
test('even an owner cannot start paid probes without separate spend opt-in', async () => {
  const api = await probe({ isOwner: true });
  const response = await api.run(new Request('https://example.test/api/ops/ai-probe?probe=2'), {});
  assert.equal(response.status, 403);
  assert.equal(api.calls(), 0);
});
