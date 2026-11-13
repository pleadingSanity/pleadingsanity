// Guest chat must answer when no memory id is sent. A well-formed id still
// resolves. A malformed id is never used as a lookup key. No provider calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const arronSrc = source('netlify/functions/arron.mts');
const VALID_ID = 'ab'.repeat(16); // 32 hex chars, the shape js/arron-companion.js sends
const OWNED_ID = 'cd'.repeat(16);
const PRIVATE_STORY = 'private-story-must-not-leak';

function columnName(column) {
  return column && typeof column === 'object' ? column.name : column;
}

function memoryDb(rows) {
  const calls = [];
  function rowsFor(query) {
    if (query.op !== 'select') return [];
    const id = query.where && query.where.value;
    const shape = query.shape || {};
    if (shape.userId) {
      const row = rows[id];
      return row ? [{ userId: row.userId ?? null }] : [];
    }
    if (shape.role) return [];
    const row = rows[id];
    return row ? [{ id, story: row.story || '', userId: row.userId ?? null }] : [];
  }
  function thenable(query) {
    const api = {
      from(table) { query.table = table && table.table; return api; },
      where(clause) { query.where = clause; return api; },
      orderBy() { return api; },
      limit() { return api; },
      values(values) { query.values = values; return api; },
      set(values) { query.set = values; return api; },
      onConflictDoNothing() { return api; },
      returning() { return Promise.resolve([]); },
      then(resolve, reject) {
        calls.push(query);
        return Promise.resolve(rowsFor(query)).then(resolve, reject);
      },
    };
    return api;
  }
  const db = {
    select(shape) { return thenable({ op: 'select', shape }); },
    insert(table) { return thenable({ op: 'insert', table: table && table.table }); },
    update(table) { return thenable({ op: 'update', table: table && table.table }); },
    delete(table) { return thenable({ op: 'delete', table: table && table.table }); },
  };
  return { db, calls };
}

function forbiddenDb() {
  const calls = [];
  const boom = (op) => () => {
    calls.push(op);
    throw new Error('memory lookup forbidden: ' + op);
  };
  return {
    db: { select: boom('select'), insert: boom('insert'), update: boom('update'), delete: boom('delete') },
    calls,
  };
}

async function loadArron({ user = null, chain, db } = {}) {
  const seen = { story: undefined, chainCalls: 0 };
  const context = vm.createContext({
    Request, Response, URL, URLSearchParams, console, process, crypto,
    Date, Object, Array, JSON, Math, Number, String, Boolean, RegExp, Promise,
    Error, TypeError, AbortSignal,
  });
  const module = new vm.SourceTextModule(stripTypeScriptTypes(arronSrc), { context });
  const memories = {
    table: 'arronMemories',
    id: { name: 'id' },
    userId: { name: 'userId' },
  };
  const messages = {
    table: 'arronMessages',
    id: { name: 'id' },
    memoryId: { name: 'memoryId' },
    role: { name: 'role' },
    content: { name: 'content' },
  };
  await module.link((specifier) => {
    if (specifier === '../lib/crisis-phrases.js') {
      return new vm.SourceTextModule(source('netlify/lib/crisis-phrases.js'), { context });
    }
    const values = {
      'drizzle-orm': {
        asc: () => ({}),
        desc: () => ({}),
        eq: (column, value) => ({ column: columnName(column), value }),
      },
      '../../db/index.js': { db },
      '../../db/schema.js': { arronMemories: memories, arronMessages: messages, siteContent: { table: 'siteContent' } },
      '../lib/arron-knowledge.js': {
        ARRON_PHASE2_TOOLS_BRIEF: '',
        MOODS: { calm: true, crisis: true },
        buildSystemPrompt(story) { seen.story = story; return 'system'; },
      },
      '../lib/arron-growth.js': { getGrowth: async () => ({}), growthBrief: () => '' },
      '../lib/ai-chain.js': {
        ALL_QUIET_REPLY: 'QUIET-FALLBACK',
        askCouncil: async () => { throw new Error('council must not run'); },
        askGrokDirect: async () => { throw new Error('grok probe must not run'); },
        personalSparesAllowed: () => false,
        lastChainFailure: () => null,
        workAsOne: async () => { throw new Error('family must not run'); },
        runChain: async () => {
          seen.chainCalls += 1;
          if (chain === 'down') throw new Error('every provider quiet');
          return { text: 'Pleading Sanity is a free sanctuary.', provider: 'gpt', model: 'test' };
        },
      },
      '../lib/rate-limit.js': {
        allow: async () => true,
        allowToday: async () => true,
        slowDown: (text) => Response.json({ error: text }, { status: 429 }),
      },
      '../lib/social.js': {
        getSettings: async () => ({ arronVoice: '' }),
        isCreator: () => false,
        logActivity: async () => {},
        moderate: async () => ({ ok: true }),
        optionalUser: async () => user,
        profileFor: async () => null,
      },
      '../lib/publish.js': { publishPost: async () => { throw new Error('publish'); }, saveJournalEntry: async () => { throw new Error('journal'); } },
      '../lib/owner.js': { approveAll: async () => { throw new Error('owner'); }, overview: async () => { throw new Error('owner'); }, setRole: async () => { throw new Error('owner'); } },
      '../lib/workbench.js': { pulseFacts: async () => { throw new Error('workbench'); }, saveProposal: async () => { throw new Error('workbench'); }, sitePulse: async () => { throw new Error('workbench'); } },
      '../lib/supabase-memory.js': {
        appendMessages: async () => { throw new Error('supabase write'); },
        clearMemory: async () => { throw new Error('supabase clear'); },
        supabaseEnabled: () => false,
      },
      '../lib/arron-tools.js': { maybeRunTools: async () => { throw new Error('tools'); }, openaiToolsEnabled: () => false },
      '../lib/kb-retrieve.js': { groundArronSystem: async (system) => system },
    }[specifier];
    if (!values) throw new Error('Unexpected dependency: ' + specifier);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return { api: module.namespace, seen };
}

async function chat(api, body) {
  const response = await api.default(new Request('https://pleadingsanity.co.uk/api/arron/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), { ip: '203.0.113.8' });
  return { status: response.status, body: await response.json() };
}

test('chat no longer rejects a missing memory id; the memory route still does', () => {
  const chatStart = arronSrc.indexOf('async function chat');
  const memoryStart = arronSrc.indexOf('async function memory');
  assert.ok(chatStart > 0 && memoryStart > chatStart);
  assert.doesNotMatch(arronSrc.slice(chatStart, memoryStart), /Invalid memory id/);
  assert.match(arronSrc.slice(memoryStart), /Invalid memory id/);
});

test('a guest with no memory id gets a reply and no memory lookup', async () => {
  const store = forbiddenDb();
  const { api, seen } = await loadArron({ db: store.db });
  const res = await chat(api, { message: 'hello, what is pleading sanity?' });
  assert.equal(res.status, 200);
  assert.equal(res.body.error, undefined);
  assert.equal(res.body.provider, 'gpt');
  assert.match(res.body.reply, /free sanctuary/);
  assert.equal(res.body.crisis, false);
  assert.equal(res.body.remembered, false);
  assert.equal(store.calls.length, 0);
  assert.equal(seen.story, '');
  assert.equal(seen.chainCalls, 1);
});

test('an empty memory id is the same local-only reply', async () => {
  for (const memoryId of ['', '   ']) {
    const store = forbiddenDb();
    const { api } = await loadArron({ db: store.db });
    const res = await chat(api, { message: 'hello, what is pleading sanity?', memoryId });
    assert.equal(res.status, 200, JSON.stringify(memoryId));
    assert.equal(res.body.error, undefined);
    assert.equal(res.body.provider, 'gpt');
    assert.equal(res.body.remembered, false);
    assert.equal(store.calls.length, 0);
  }
});

test('a valid memory id is still resolved and can be remembered', async () => {
  const store = memoryDb({ [VALID_ID]: { userId: null, story: 'came by last night' } });
  const { api, seen } = await loadArron({ db: store.db });
  const res = await chat(api, { message: 'hello, what is pleading sanity?', memoryId: VALID_ID });
  assert.equal(res.status, 200);
  assert.equal(res.body.provider, 'gpt');
  assert.equal(res.body.remembered, true);
  assert.equal(seen.story, 'came by last night');
  assert.ok(store.calls.some((query) => query.op === 'select' && query.where && query.where.value === VALID_ID));
  const saved = store.calls.find((query) => query.op === 'insert' && query.table === 'arronMessages');
  assert.ok(saved);
  assert.equal(saved.values[0].memoryId, VALID_ID);
  assert.equal(saved.values[1].memoryId, VALID_ID);
});

test('a malformed or hostile memory id is ignored and never looked up', async () => {
  const hostile = [
    "'; DROP TABLE arron_memories; --",
    '../../../etc/passwd',
    'eq.' + VALID_ID,
    'sl-' + VALID_ID,
    VALID_ID + ' ',
    'x'.repeat(200),
    { $gt: '' },
    0,
  ];
  for (const memoryId of hostile) {
    const store = forbiddenDb();
    const { api } = await loadArron({ db: store.db });
    const res = await chat(api, { message: 'hello, what is pleading sanity?', memoryId });
    assert.equal(res.status, 200);
    assert.equal(res.body.error, undefined);
    assert.equal(res.body.provider, 'gpt');
    assert.equal(res.body.remembered, false);
    assert.equal(store.calls.length, 0);
  }
});

test('a guest cannot read or write an account-owned memory', async () => {
  const store = memoryDb({ [OWNED_ID]: { userId: 'member-9', story: PRIVATE_STORY } });
  const { api, seen } = await loadArron({ db: store.db });
  const res = await chat(api, { message: 'hello, what is pleading sanity?', memoryId: OWNED_ID });
  assert.equal(res.status, 200);
  assert.equal(res.body.provider, 'gpt');
  assert.equal(res.body.remembered, false);
  assert.equal(seen.story, '');
  assert.equal(JSON.stringify(res.body).includes(PRIVATE_STORY), false);
  assert.equal(store.calls.some((query) => query.op === 'insert'), false);
  assert.ok(store.calls.some((query) => query.op === 'select' && query.shape && query.shape.userId && query.where.value === OWNED_ID));
});

test('a crisis message with no memory id still returns the crisis lines', async () => {
  const store = forbiddenDb();
  const { api } = await loadArron({ db: store.db });
  const res = await chat(api, { message: 'I want to die' });
  assert.equal(res.status, 200);
  assert.equal(res.body.error, undefined);
  assert.equal(res.body.crisis, true);
  assert.match(res.body.reply, /\b999\b/);
  assert.match(res.body.reply, /116\s?123/);
  assert.match(res.body.reply, /85258/);
  assert.match(res.body.reply, /\b111\b/);
  assert.equal(store.calls.length, 0);
});

test('providers being down still returns the quiet fallback, not a memory error', async () => {
  const store = forbiddenDb();
  const { api } = await loadArron({ db: store.db, chain: 'down' });
  const res = await chat(api, { message: 'hello, what is pleading sanity?' });
  assert.equal(res.status, 200);
  assert.equal(res.body.error, undefined);
  assert.equal(res.body.provider, 'none');
  assert.match(res.body.reply, /QUIET-FALLBACK/);
  assert.equal(store.calls.length, 0);
});

test('the memory route still refuses a missing or hostile id before any lookup', async () => {
  const store = forbiddenDb();
  const { api } = await loadArron({ db: store.db });
  const missing = await api.default(new Request('https://pleadingsanity.co.uk/api/arron/memory'), { ip: '203.0.113.8' });
  const hostile = await api.default(new Request('https://pleadingsanity.co.uk/api/arron/memory', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memoryId: "'; DROP TABLE arron_memories; --" }),
  }), { ip: '203.0.113.8' });
  assert.equal(missing.status, 400);
  assert.equal((await missing.json()).error, 'Invalid memory id');
  assert.equal(hostile.status, 400);
  assert.equal((await hostile.json()).error, 'Invalid memory id');
  assert.equal(store.calls.length, 0);
});
