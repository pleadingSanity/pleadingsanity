// Dependency-free regression tests. Browser/Identity/Postgres fixtures are simulated, not production.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { mergeBrain, mergeProgress } from '../js/progress-merge.js';
const source = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const scores = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source('netlify/lib/game-scores.ts'))).toString('base64'));

test('concurrent XP is additive; retry is idempotent; best scores and badges survive', () => {
  const a = { xp: 115, xpLedger: { base: 100, sources: { a: 15 } }, games: { dash: { best: 300, bestLevel: 4, plays: 2 } }, badges: { first: 1 } };
  const b = { xp: 120, xpLedger: { base: 100, sources: { b: 20 } }, games: { dash: { best: 100, bestLevel: 7, plays: 1 } }, badges: { second: 2 } };
  const merged = mergeBrain(a, b);
  assert.equal(merged.xp, 135);
  assert.equal(mergeBrain(merged, b).xp, 135);
  assert.equal(merged.games.dash.best, 300);
  assert.equal(merged.games.dash.bestLevel, 7);
  assert.deepEqual(Object.keys(merged.badges).sort(), ['first', 'second']);
  assert.equal(mergeBrain({ xp: 80 }, { xp: 100 }).xp, 100);
});
test('campaign and legacy levels never regress; reflection conflicts stay separate', () => {
  assert.equal(mergeProgress('stardust-campaign', { completed: 12 }, { completed: 2 }).completed, 12);
  assert.equal(mergeProgress('legacy-focus', { lvl: 9, score: 200 }, { lvl: 2, score: 30 }).lvl, 9);
  assert.equal(mergeProgress('guest-progress', { levels: { solitaire: 7 } }, { levels: { solitaire: 3 } }).levels.solitaire, 7);
  assert.equal(mergeProgress('mood-journey', { private: 'one' }, { private: 'two' }), null);
});
test('public score allowlist excludes moods and breathing; validation rejects malformed input', () => {
  assert.ok(!scores.SCORE_GAMES.includes('mood-journey'));
  assert.ok(!scores.SCORE_GAMES.includes('mind-mode'));
  assert.deepEqual(scores.scoreEntry({ alias: 'Star Explorer', score: 20, level: 2 }), { alias: 'Star Explorer', score: 20, level: 2 });
  for (const value of [null, {}, { alias: '<script>', score: 10, level: 1 }, { alias: 'Player', score: -1, level: 1 },
    { alias: 'Player', score: 1.5, level: 1 }, { alias: 'Player', score: 10_000_001, level: 1 }]) assert.equal(scores.scoreEntry(value), null);
});

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k), clear: () => data.clear() };
}
function syncDevice(server, initial = {}) {
  const events = new EventTarget(), localStorage = storage(initial);
  const window = { addEventListener: events.addEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) };
  const ctx = vm.createContext({ localStorage, window, Event, CustomEvent, structuredClone, Date, JSON, Object,
    clearTimeout() {}, setTimeout() {}, document: { visibilityState: 'visible', addEventListener() {} },
    loadMe: async () => ({ user: { id: 'fixture' } }), mergeProgress,
    api: async (path, options) => {
      if (!options) return { progress: structuredClone(server.rows) };
      if (server.fail) throw new Error('Unavailable');
      if (server.html) return {};
      const game = path.split('/').pop(), current = server.rows[game], body = options.body;
      if ((current?.updatedAt || null) !== body.expectedAt) {
        const error = new Error('Conflict'); error.status = 409; error.data = { current: structuredClone(current) }; throw error;
      }
      server.rows[game] = { data: structuredClone(body.data), updatedAt: new Date(++server.clock).toISOString() };
      return { ok: true, updatedAt: server.rows[game].updatedAt };
    } });
  const code = source('js/progress.js').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')
    + '\nwindow.test={ready,flush,progressStatus,saveProgress,progressConflicts,resolveProgressConflict};';
  vm.runInContext(code, ctx);
  return { window, localStorage, api: window.test };
}
test('complete sync: first save, second-device restore, conflict merge, retry and failed-save protection', async () => {
  const server = { rows: {}, clock: Date.now() };
  const one = syncDevice(server, { 'ps-games-profile': JSON.stringify({ xp: 50 }) }); await one.api.ready;
  assert.equal(server.rows['brain-games'].data.xp, 50);
  const two = syncDevice(server); await two.api.ready;
  assert.equal(JSON.parse(two.localStorage.getItem('ps-games-profile')).xp, 50);
  one.localStorage.setItem('ps-games-profile', JSON.stringify({ xp: 60, xpLedger: { base: 50, sources: { a: 10 } } }));
  two.localStorage.setItem('ps-games-profile', JSON.stringify({ xp: 70, xpLedger: { base: 50, sources: { b: 20 } } }));
  await one.api.flush(); await two.api.flush();
  assert.equal(server.rows['brain-games'].data.xp, 80);
  await two.api.flush(); assert.equal(server.rows['brain-games'].data.xp, 80);
  server.fail = true; two.api.saveProgress('stardust-campaign', { completed: 4 });
  assert.equal(await two.window.psProgressFlush(), false);
  assert.ok(two.localStorage.getItem('ps-games-profile'));
  assert.equal(two.api.progressStatus(), 'pending');
  server.fail = false; server.html = true;
  assert.equal(await two.api.flush(), false);
  server.html = false; assert.equal(await two.api.flush(), true);
  assert.equal(server.rows['stardust-campaign'].data.completed, 4);
});
test('unsaved higher guest levels are merged on sign-in rather than overwritten', async () => {
  const server = { clock: Date.now(), rows: { 'brain-games': { data: { xp: 100, games: { solitaire: { bestLevel: 3 } } }, updatedAt: new Date().toISOString() } } };
  const device = syncDevice(server, { 'ps-games-profile': JSON.stringify({ xp: 120, games: { solitaire: { bestLevel: 8 } } }) });
  await device.api.ready;
  assert.equal(server.rows['brain-games'].data.xp, 120);
  assert.equal(server.rows['brain-games'].data.games.solitaire.bestLevel, 8);
});

test('conflicting current-board saves require an explicit choice; either choice can then sync', async () => {
  for (const choice of ['device', 'account']) {
    const server = { clock: Date.now(), rows: { 'cosmic-connect': { data: { board: 'account' }, updatedAt: new Date().toISOString() } } };
    const device = syncDevice(server, { 'ps-progress-cosmic-connect': JSON.stringify({ board: 'device' }) });
    await device.api.ready;
    assert.deepEqual([...device.api.progressConflicts()], ['cosmic-connect']);
    assert.equal(await device.api.resolveProgressConflict('cosmic-connect', choice), true);
    assert.equal(server.rows['cosmic-connect'].data.board, choice);
    assert.equal(JSON.parse(device.localStorage.getItem('ps-progress-cosmic-connect')).board, choice);
  }
});

function dashFixture(saved = storage()) {
  const elements = new Map(), awards = [];
  function element() {
    return { value: '', children: [], style: {}, textContent: '', hidden: false,
      appendChild(item) { this.children.push(item); if (!this.value) this.value = String(item.value); },
      set innerHTML(v) { this.children = []; this.value = ''; }, get innerHTML() { return ''; },
      addEventListener() {}, setAttribute() {}, focus() {}, blur() {},
      getBoundingClientRect: () => ({ width: 360, height: 480, left: 0, top: 0 }) };
  }
  const drawing = new Proxy({}, { get: (_, name) => name === 'createRadialGradient' ? () => ({ addColorStop() {} }) : name === 'measureText' ? () => ({ width: 120 }) : () => {} });
  const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  get('cv').getContext = () => drawing;
  const ps = new Proxy({ reducedMotion: () => true, award: (game, score, extra) => { awards.push({ game, score, ...extra }); return { xp: 10, newBadges: [] }; },
    multiplier: () => 1, quip: () => 'Keep going' }, { get: (o, k) => o[k] || (() => {}) });
  const ctx = vm.createContext({ localStorage: saved, window: { PSGames: ps, addEventListener() {}, dispatchEvent() {} },
    document: { getElementById: get, createElement: element, addEventListener() {}, activeElement: {} },
    performance: { now: () => 0 }, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, CustomEvent, Math });
  vm.runInContext(source('js/stardust-dash.js').replace('  resize(); hud();', `
    window.test = { start, setPause, get running() { return running; }, get paused() { return paused; },
      get campaign() { return campaign; }, catchStar() { st.items = [{type:'star',x:st.x,y:st.y,w:28,rot:0,v:0}];update(0); } };
    resize(); hud();`), ctx);
  return { state: ctx.window.test, get, awards, saved };
}
test('all twelve Stardust levels complete, award once per clear, unlock, reload and replay', () => {
  const dash = dashFixture();
  for (let level = 1; level <= 12; level++) {
    dash.get('dash-level').value = String(level); dash.state.start();
    for (let star = 0; star < 6 + level * 2; star++) dash.state.catchStar();
    assert.equal(dash.state.running, false);
    assert.equal(dash.state.campaign.completed, level);
    assert.equal(dash.awards.length, level);
  }
  assert.equal(dash.get('dash-level').children.length, 12);
  const restored = dashFixture(dash.saved);
  assert.equal(restored.state.campaign.completed, 12);
  restored.get('dash-level').value = '3'; restored.state.start(); restored.state.setPause(true);
  assert.equal(restored.state.paused, true); restored.state.setPause(false); assert.equal(restored.state.paused, false);
});

test('actual sign-out function leaves the session and local data intact after a failed save', async () => {
  let loggedOut = false, cleared = false;
  const code = source('js/auth.js');
  const body = code.slice(code.indexOf('export async function signOut'), code.indexOf('// ─── EMAIL LINKS'))
    .replace('export async function', 'async function') + '\nwindow.signOut = signOut;';
  const window = { psProgressFlush: async () => false };
  const ctx = vm.createContext({ window, toast() {}, logout: async () => { loggedOut = true; }, clearMe() {},
    sessionStorage: { clear: () => { cleared = true; } }, localStorage: { clear: () => { cleared = true; } } });
  vm.runInContext(body, ctx);
  assert.equal(await window.signOut({ redirect: false }), false);
  assert.equal(loggedOut, false); assert.equal(cleared, false);
});

test('score API rejects anonymous writes, rejects private games, and exposes only allowlisted public fields', async () => {
  let user = null, readGame;
  const ctx = vm.createContext({ Request, Response, URL, Date, console, SCORE_GAMES: scores.SCORE_GAMES, scoreEntry: scores.scoreEntry,
    gameProgress: { data: 'data', game: 'game', userId: 'userId', updatedAt: 'updatedAt' },
    db: { select: () => ({ from: () => ({ where: value => { readGame = value; return { orderBy: () => ({ limit: async () => [
      { data: { alias: 'Player One', score: 40, level: 2, email: 'not-public', userId: 'private-id' } }
    ] }) }; } }) }) },
    currentUser: async () => user, allow: async () => true, slowDown: () => Response.json({}, { status: 429 }),
    unauthorized: () => Response.json({}, { status: 401 }), readBody: req => req.json(),
    json: (body, status = 200) => Response.json(body, { status }), logReason: () => 'error',
    eq: (a, b) => [a, b], and: (...v) => v, desc: v => v, sql: (...v) => v });
  const code = stripTypeScriptTypes(source('netlify/functions/scores.mts')).replace(/^import .*;\r?\n/gm, '')
    .replace('export default async', 'const handler = async').replace('export const config', 'const config') + '\nglobalThis.handler=handler;';
  vm.runInContext(code, ctx);
  const response = await ctx.handler(new Request('https://fixture/api/scores/cosmic-focus'), {});
  const result = await response.json();
  assert.equal(result.entries[0].email, undefined); assert.equal(result.entries[0].userId, undefined);
  assert.equal(result.entries[0].alias, 'Player One');
  assert.equal(readGame[1], 'scores-cosmic-focus');
  assert.equal((await ctx.handler(new Request('https://fixture/api/scores/mood-journey'), {})).status, 404);
  assert.equal((await ctx.handler(new Request('https://fixture/api/scores/cosmic-focus', { method: 'PUT', body: '{}' }), {})).status, 401);
  user = { id: 'fixture' };
  assert.equal((await ctx.handler(new Request('https://fixture/api/scores/cosmic-focus', { method: 'PUT', body: '{}' }), {})).status, 400);
});
