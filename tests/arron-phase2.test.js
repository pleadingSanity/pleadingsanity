// ==============================================================
// Arron Phase 2 regression tests — Supabase memory + tool calling.
// Mocks global fetch and process.env; restores after each test.
// Run: node --test tests/arron-phase2.test.js
// ==============================================================
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const supabaseMod = await import(new URL('../netlify/lib/supabase-memory.ts', import.meta.url));
const toolsMod = await import(new URL('../netlify/lib/arron-tools.ts', import.meta.url));
const { appendMessages, clearMemory, readHistory, supabaseEnabled } = supabaseMod;
const { maybeRunTools, openaiToolsEnabled, solarCalculator, crisisCheck, fetchUrl, TOOLS } = toolsMod;

const MEM_ID = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'; // 32 hex chars, valid shape

// ─── Mock Supabase PostgREST (in-memory store) ────────────────
function makeSupabaseMock() {
  const store = []; // {memory_id, role, content, created_at}
  let lastRequest = null;
  const fetchMock = async (url, init = {}) => {
    lastRequest = { url: String(url), method: init.method || 'GET', body: init.body };
    const u = new URL(String(url));
    const path = u.pathname;
    const memEq = (u.searchParams.get('memory_id') || '').replace(/^eq\./, '');
    if (path.endsWith('/arron_chat_memory') && init.method === 'POST') {
      const rows = JSON.parse(init.body || '[]');
      for (const r of rows) store.push(r);
      return new Response(null, { status: 201 });
    }
    if (path.endsWith('/arron_chat_memory') && (init.method || 'GET') === 'GET') {
      const rows = store.filter((r) => r.memory_id === memEq)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)); // desc
      const limit = Number(u.searchParams.get('limit') || 50);
      return new Response(JSON.stringify(rows.slice(0, limit)), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (path.endsWith('/arron_chat_memory') && init.method === 'DELETE') {
      const before = store.length;
      for (let i = store.length - 1; i >= 0; i--) if (store[i].memory_id === memEq) store.splice(i, 1);
      return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('not found', { status: 404 });
  };
  return { fetchMock, store, getLast: () => lastRequest };
}

// Save/restore env + fetch around each test.
const realFetch = globalThis.fetch;
const envSnapshot = {};
for (const k of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY']) envSnapshot[k] = process.env[k];

function restoreEnv() {
  for (const [k, v] of Object.entries(envSnapshot)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  globalThis.fetch = realFetch;
}

// ─── 1. Supabase round-trip: append → read → clear ─────────────
test('supabase: appendMessages -> readHistory round-trip, clearMemory empties', async () => {
  const { fetchMock, store } = makeSupabaseMock();
  globalThis.fetch = fetchMock;
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  try {
    assert.equal(supabaseEnabled(), true);
    const ok = await appendMessages(MEM_ID, [
      { role: 'user', content: 'hello arron', ts: 1000 },
      { role: 'assistant', content: 'hi there', ts: 2000 },
    ]);
    assert.equal(ok, true);
    assert.equal(store.length, 2);
    // No message content in the URL (content goes in POST body only).
    const rows = await readHistory(MEM_ID, 10);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].role, 'user');
    assert.equal(rows[0].content, 'hello arron');
    assert.equal(rows[1].content, 'hi there'); // oldest-first order preserved
    const cleared = await clearMemory(MEM_ID);
    assert.equal(cleared, true);
    const after = await readHistory(MEM_ID, 10);
    assert.equal(after.length, 0);
  } finally {
    restoreEnv();
  }
});

test('supabase: appendMessages sends apikey + Authorization headers and no content in URL', async () => {
  const { fetchMock, getLast } = makeSupabaseMock();
  globalThis.fetch = fetchMock;
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'secret-anon-key';
  try {
    await appendMessages(MEM_ID, [{ role: 'user', content: 'private words' }]);
    const last = getLast();
    assert.ok(last.url.includes('/rest/v1/arron_chat_memory'), last.url);
    assert.ok(!last.url.includes('private'), 'message content must not appear in URL');
    assert.ok(last.body.includes('private words'), 'content goes in body');
  } finally {
    restoreEnv();
  }
});

// ─── 2. Env-var-missing graceful degrade ───────────────────────
test('supabase: with SUPABASE_URL unset, supabaseEnabled false and ops no-op without throwing', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  globalThis.fetch = async () => { throw new Error('fetch must not be called'); };
  try {
    assert.equal(supabaseEnabled(), false);
    assert.equal(await appendMessages(MEM_ID, [{ role: 'user', content: 'x' }]), false);
    assert.deepEqual(await readHistory(MEM_ID, 10), []);
    assert.equal(await clearMemory(MEM_ID), false);
  } finally {
    restoreEnv();
  }
});

test('supabase: with only one env var set, still disabled (both required)', async () => {
  process.env.SUPABASE_URL = 'https://x.supabase.co';
  delete process.env.SUPABASE_ANON_KEY;
  try {
    assert.equal(supabaseEnabled(), false);
    assert.equal(await appendMessages(MEM_ID, [{ role: 'user', content: 'x' }]), false);
  } finally {
    restoreEnv();
  }
});

test('supabase: fetch failure degrades gracefully (no throw, returns false/[])', async () => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'key';
  globalThis.fetch = async () => { throw new Error('network down'); };
  try {
    assert.equal(await appendMessages(MEM_ID, [{ role: 'user', content: 'x' }]), false);
    assert.deepEqual(await readHistory(MEM_ID, 10), []);
    assert.equal(await clearMemory(MEM_ID), false);
  } finally {
    restoreEnv();
  }
});

// ─── 3. Tool fallback: OPENAI_API_KEY unset → tools skipped ────
test('tools: with OPENAI_API_KEY unset, openaiToolsEnabled false and maybeRunTools returns null (no SDK call)', async () => {
  delete process.env.OPENAI_API_KEY;
  // If maybeRunTools tried to call OpenAI, it would need fetch/SDK — we make fetch throw.
  globalThis.fetch = async () => { throw new Error('no network in test'); };
  try {
    assert.equal(openaiToolsEnabled(), false);
    const turns = [{ role: 'user', content: 'how much solar for 4kW?' }];
    const result = await maybeRunTools('system', turns, { maxTokens: 100, deadline: Date.now() + 5000, logTag: 'test' });
    assert.equal(result, null);
    // turns unchanged when no tool runs
    assert.equal(turns[0].content, 'how much solar for 4kW?');
  } finally {
    restoreEnv();
  }
});

test('tools: exactly three tools defined with required names', () => {
  assert.equal(TOOLS.length, 3);
  const names = TOOLS.map((t) => t.function.name);
  assert.deepEqual(names.sort(), ['crisis_check', 'solar_calculator', 'url_fetch']);
  for (const t of TOOLS) assert.equal(t.type, 'function');
});

// ─── 4. Tool executors (pure, no network) ──────────────────────
test('tools: solarCalculator returns transparent estimate with stated assumptions', () => {
  const r = solarCalculator({ system_kw: 4 });
  assert.match(r, /10 × 400 W/); // 4kW / 400W = 10 panels
  assert.match(r, /rails/i);
  assert.match(r, /£4,800/); // 4 * 1200 = 4800
  assert.match(r, /assumption/i);
  assert.match(r, /not a quote/i);
});

test('tools: solarCalculator derives system size from roof_sqm and asks for input when neither given', () => {
  const fromRoof = solarCalculator({ roof_sqm: 20 });
  assert.match(fromRoof, /system size: ~4\.2 kW/i); // 20 * 0.21 ≈ 4.2
  const neither = solarCalculator({});
  assert.match(neither, /tell me either/i);
});

test('tools: crisisCheck detects crisis words and returns lines incl. 116 123, 988, 999', () => {
  const yes = crisisCheck('I want to end my life');
  assert.equal(yes.crisis, true);
  assert.ok(yes.lines.includes('116 123'));
  assert.ok(yes.lines.includes('988'));
  assert.ok(yes.lines.includes('999'));
  assert.ok(yes.lines.includes('findahelpline.com'));
  const no = crisisCheck('I had a nice cup of tea today');
  assert.equal(no.crisis, false);
  assert.equal(no.lines, undefined);
});

test('tools: fetchUrl rejects non-https and fails gracefully on network error', async () => {
  const bad = await fetchUrl('http://insecure.example.com/page');
  assert.equal(bad.ok, false);
  assert.match(bad.text, /https/i);
  globalThis.fetch = async () => { throw new Error('boom'); };
  try {
    const down = await fetchUrl('https://example.com');
    assert.equal(down.ok, false);
    assert.match(down.text, /could not fetch/i);
  } finally {
    restoreEnv();
  }
});

test('tools: fetchUrl returns truncated text from mocked page', async () => {
  globalThis.fetch = async () => new Response('<html><body><script>x=1</script><h1>Hello World</h1><p>' + 'a'.repeat(5000) + '</p></body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  try {
    const r = await fetchUrl('https://example.com/article');
    assert.equal(r.ok, true);
    assert.ok(r.text.includes('Hello World'));
    assert.ok(!r.text.includes('<script>'), 'scripts stripped');
    assert.ok(r.text.length <= 4000, 'truncated to ~4000 chars');
  } finally {
    restoreEnv();
  }
});

// ─── 5. Source-level guarantees (arron.mts unchanged contract) ─
const arronSrc = readFileSync(new URL('../netlify/functions/arron.mts', import.meta.url), 'utf8');

test('arron.mts: DELETE /api/arron/memory still returns {ok:true, cleared:true} exactly', () => {
  assert.match(arronSrc, /return json\(\{ ok: true, cleared: true \}\)/);
  assert.match(arronSrc, /if \(req\.method === "DELETE"\)/);
});

test('arron.mts: provider chain fallback preserved (reply()/runChain still the single-mind path)', () => {
  assert.match(arronSrc, /answer = await reply\(system \+ capNote, turns, creator, creative, Boolean\(user\), budget, ownerAdmitted\)/);
  assert.match(arronSrc, /import \{ ALL_QUIET_REPLY, askCouncil, askGrokDirect, personalSparesAllowed, runChain, workAsOne/);
  // tool path is guarded by openaiToolsEnabled and never replaces reply()
  assert.match(arronSrc, /if \(!council && !family && openaiToolsEnabled\(\)\)/);
  assert.match(arronSrc, /await maybeRunTools\(/);
});

test('arron.mts: Supabase append + clear wired in, best-effort (try/catch), consent gated', () => {
  assert.match(arronSrc, /supabaseConsent = body\.saveToCloud === true \|\| Boolean\(user\)/);
  assert.match(arronSrc, /if \(supabaseEnabled\(\) && supabaseConsent && resolved\.readable\)/);
  assert.match(arronSrc, /await supabaseAppend\(memoryId, \[/);
  assert.match(arronSrc, /await supabaseClear\(id\)/);
});

test('arron.mts: no duplicate path registration — arron-memory.mts owns /api/arron/memory/supabase', () => {
  assert.match(arronSrc, /path: \["\/api\/arron\/chat", "\/api\/arron\/memory", "\/api\/arron\/health", "\/api\/arron\/grok-test"\]/);
  const memFn = readFileSync(new URL('../netlify/functions/arron-memory.mts', import.meta.url), 'utf8');
  assert.match(memFn, /path: "\/api\/arron\/memory\/supabase"/);
  assert.doesNotMatch(arronSrc, /\/api\/arron\/memory\/supabase/);
});

test('ai-chain.ts: chain order unchanged (openai→anthropic→gemini→grok)', () => {
  const chainSrc = readFileSync(new URL('../netlify/lib/ai-chain.ts', import.meta.url), 'utf8');
  assert.match(chainSrc, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
});

test('arron-knowledge.json: phase2 blocks appended, existing keys preserved', () => {
  const k = JSON.parse(readFileSync(new URL('../arron-knowledge.json', import.meta.url), 'utf8'));
  assert.ok(k.phase2_tools, 'phase2_tools added');
  assert.ok(k.system_prompt_phase2, 'system_prompt_phase2 added');
  assert.ok(k.crisisLines, 'existing crisisLines preserved');
  assert.ok(k.covenant, 'existing covenant preserved');
  assert.ok(k.version.startsWith('4.0'), 'version bumped');
  assert.equal(k.updated, '2026-10-31');
});
