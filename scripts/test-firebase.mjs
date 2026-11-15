import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import handler from '../netlify/functions/firebase-public-config.mts';
import { validateFirebaseConfig } from '../js/firebase-config.js';
import { createFixtureServer } from './serve-firebase-config.mjs';

const fixture = { apiKey: 'AIza' + 'A'.repeat(35), appId: '1:123456789:web:abcdef1234567890abcdef12', authDomain: 'pleading-sanity-36bfa.firebaseapp.com', projectId: 'pleading-sanity-36bfa' };
const envNames = { apiKey: 'FIREBASE_WEB_API_KEY', appId: 'FIREBASE_WEB_APP_ID', authDomain: 'FIREBASE_WEB_AUTH_DOMAIN', projectId: 'FIREBASE_PROJECT_ID', storageBucket: 'FIREBASE_WEB_STORAGE_BUCKET', messagingSenderId: 'FIREBASE_WEB_MESSAGING_SENDER_ID', measurementId: 'FIREBASE_WEB_MEASUREMENT_ID' };
async function withEnv(config, run) {
  const saved = Object.fromEntries(Object.values(envNames).map(k => [k, process.env[k]]));
  try {
    for (const [field, key] of Object.entries(envNames)) { delete process.env[key]; if (config[field] != null) process.env[key] = config[field]; }
    return await run();
  } finally {
    for (const [key, value] of Object.entries(saved)) { if (value == null) delete process.env[key]; else process.env[key] = value; }
  }
}
const request = (method = 'GET', suffix = '') => new Request('https://test.invalid/api/firebase-public-config' + suffix, { method });

test('GET returns only allowlisted public fields, no caching or secrets', async () => withEnv({ ...fixture, messagingSenderId: '123456789', measurementId: 'G-TEST123' }, async () => {
  process.env.PS_TEST_PRIVATE_SENTINEL = 'never-public';
  try {
    const response = await handler(request());
    const body = await response.json();
    assert.equal(response.status, 200); assert.equal(body.configured, true);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.deepEqual(Object.keys(body.config).sort(), [...Object.keys(fixture), 'messagingSenderId', 'measurementId'].sort());
    assert.ok(!JSON.stringify(body).includes('never-public'));
  } finally { delete process.env.PS_TEST_PRIVATE_SENTINEL; }
}));
test('missing and invalid environment config stay disabled without returning values', async () => {
  for (const config of [{}, { ...fixture, projectId: 'pleadingsanity' }, { ...fixture, appId: '1:00000000:web:00000000' }, { ...fixture, apiKey: 'YOUR_ACTUAL_API_KEY' }, { ...fixture, authDomain: 'other.firebaseapp.com' }, { ...fixture, storageBucket: 'other.appspot.com' }, { ...fixture, messagingSenderId: '999' }]) {
    await withEnv(config, async () => assert.deepEqual(await (await handler(request())).json(), { configured: false }));
  }
});
test('unexpected methods, query and body have explicit JSON failures', async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
    const response = await handler(request(method)); assert.equal(response.status, 405); assert.equal(response.headers.get('allow'), 'GET'); assert.equal((await response.json()).error, 'Method not allowed');
  }
  for (const input of [request('GET', '?projectId=other'), { method: 'GET', url: request().url, body: 'unexpected' }]) {
    assert.equal((await handler(input)).status, 400);
  }
});
test('runtime exceptions are contained without reflecting their details', async () => {
  const response = await handler({ get method() { throw new Error('private-sentinel'); } });
  assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('private-sentinel'));
});
test('validator rejects malformed payloads and discards extra properties', () => {
  for (const config of [null, [], 'config', { ...fixture, apiKey: {} }, { ...fixture, appId: 'x'.repeat(500) }, { ...fixture, appId: '1:123:web:placeholder' }]) assert.equal(validateFirebaseConfig(config), null);
  assert.deepEqual(validateFirebaseConfig({ ...fixture, privateKey: 'never-public' }), fixture);
});
test('fixture HTTP server exposes the actual handler and OpenAPI route', async () => withEnv({}, async () => {
  const server = createFixtureServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = 'http://127.0.0.1:' + server.address().port;
    assert.equal((await (await fetch(origin + '/openapi.json')).json()).openapi, '3.0.3');
    assert.deepEqual(await (await fetch(origin + '/api/firebase-public-config')).json(), { configured: false });
    assert.equal((await fetch(origin + '/api/firebase-public-config', { method: 'POST', body: 'bad' })).status, 405);
    assert.equal((await fetch(origin + '/api/firebase-public-config?bad=1')).status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); }
}));

const source = await readFile(new URL('../js/firebase.js', import.meta.url), 'utf8');
const validatorSource = await readFile(new URL('../js/firebase-config.js', import.meta.url), 'utf8');
async function client({ payload = { configured: false }, fetchError, sdkError, existing, dbError, hang } = {}) {
  const events = [], storage = { journal: 'private note', solitaire: 'saved deal', poker: 'saved chips' };
  const original = JSON.stringify(storage);
  const sandbox = { window: {}, AbortController, setTimeout, clearTimeout, console: { info: (...args) => events.push(['info', ...args]) }, localStorage: { getItem: k => storage[k], setItem: () => { throw new Error('Unexpected local save mutation'); }, clear: () => { throw new Error('Unexpected local save deletion'); } }, fetch: async (url, options) => {
    events.push(['fetch', url]); assert.equal(options.credentials, 'omit');
    if (hang) return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))));
    if (fetchError) throw new Error('offline');
    return new Response(typeof payload === 'string' ? payload : JSON.stringify(payload), { status: 200 });
  } };
  const context = vm.createContext(sandbox);
  const synthetic = (exports) => new vm.SyntheticModule(Object.keys(exports), function () { for (const [k, v] of Object.entries(exports)) this.setExport(k, v); }, { context });
  const module = new vm.SourceTextModule(source, { context, importModuleDynamically: async url => {
    events.push(['sdk', url]); if (sdkError) throw new Error('CDN blocked');
    let exports;
    if (url.endsWith('firebase-app.js')) exports = { getApps: () => existing ? [existing] : [], initializeApp: config => { events.push(['initialize']); return { name: '[DEFAULT]', options: config }; } };
    else if (url.endsWith('firebase-auth.js')) exports = { getAuth: app => ({ app }) };
    else if (url.endsWith('firebase-firestore.js')) exports = { getFirestore: app => { if (dbError) throw new Error('init failure'); return { app }; } };
    else if (url.endsWith('firebase-storage.js')) exports = { getStorage: app => ({ app }) };
    else throw new Error('Unexpected import');
    const sdk = synthetic(exports); await sdk.link(() => {}); await sdk.evaluate(); return sdk;
  } });
  await module.link(async specifier => { assert.equal(specifier, './firebase-config.js'); const helper = new vm.SourceTextModule(validatorSource, { context }); await helper.link(() => {}); return helper; });
  await module.evaluate();
  assert.equal(JSON.stringify(storage), original);
  return { ns: module.namespace, global: sandbox.window.PSFirebase, events };
}
test('missing, malformed and offline config never imports the CDN or touches saves', async () => {
  for (const options of [{}, { payload: '<html>not json</html>' }, { fetchError: true }, { payload: { configured: true, config: { ...fixture, appId: 'PASTE_APP_ID_HERE' } } }]) {
    const result = await client(options); assert.equal(result.ns.firebaseReady, false); assert.equal(result.global.ready, false); assert.equal(result.ns.auth, null); assert.equal(result.events.filter(e => e[0] === 'sdk').length, 0);
  }
});
test('valid config initializes SDK services and keeps every existing export', async () => {
  const result = await client({ payload: { configured: true, config: fixture } });
  for (const name of ['firebaseConfig', 'firebaseReady', 'app', 'auth', 'db', 'storage', 'authSdk', 'firestore', 'storageSdk']) assert.ok(name in result.ns, name);
  assert.equal(result.ns.firebaseReady, true); assert.equal(result.global.ready, true); assert.equal(result.ns.storage, null); assert.equal(result.ns.analytics, null); assert.equal(result.ns.appCheck, null);
});
test('matching default app is reused without replacing another app', async () => {
  const existing = { name: '[DEFAULT]', options: fixture };
  const result = await client({ existing, payload: { configured: true, config: fixture } });
  assert.equal(result.ns.app, existing); assert.equal(result.events.filter(e => e[0] === 'initialize').length, 0);
});
test('blocked SDK, partial initialization and wrong project never report ready', async () => {
  for (const options of [{ sdkError: true }, { dbError: true }, { existing: { name: '[DEFAULT]', options: { projectId: 'other', appId: 'other' } } }]) {
    const result = await client({ ...options, payload: { configured: true, config: fixture } });
    assert.equal(result.ns.firebaseReady, false); assert.equal(result.global.ready, false); assert.equal(result.ns.app, null); assert.equal(result.ns.auth, null); assert.equal(result.ns.db, null);
  }
});
test('stalled config request resolves to optional-off after the timeout', async () => {
  const result = await client({ hang: true }); assert.equal(result.ns.firebaseStatus.state, 'unavailable'); assert.equal(result.ns.firebaseReady, false);
});
