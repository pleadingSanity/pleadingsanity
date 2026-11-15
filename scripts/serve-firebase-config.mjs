// Local fixture API for optional Mayhem runs. Synthetic public identifiers only.
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import handler from '../netlify/functions/firebase-public-config.mts';

export function createFixtureServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost:8080');
      if (url.pathname === '/openapi.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ openapi: '3.0.3', info: { title: 'Optional Firebase public config only', version: '1.0.0' }, paths: {
          '/api/firebase-public-config': { get: { responses: {
            200: { description: 'Public config or disabled state', content: { 'application/json': { schema: { type: 'object', required: ['configured'], properties: { configured: { type: 'boolean' }, config: { type: 'object' } } } } } },
            400: { description: 'Query/body rejected' }, 503: { description: 'Config unavailable' },
          } } },
        } }));
        return;
      }
      if (url.pathname !== '/api/firebase-public-config') { res.writeHead(404); res.end(); return; }
      const response = await handler(new Request(url, { method: req.method, headers: req.headers }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Never inherit real Firebase or other application config into the fuzz target.
  for (const key of Object.keys(process.env)) if (key.startsWith('FIREBASE_')) delete process.env[key];
  Object.assign(process.env, {
    FIREBASE_PROJECT_ID: 'pleading-sanity-36bfa',
    FIREBASE_WEB_AUTH_DOMAIN: 'pleading-sanity-36bfa.firebaseapp.com',
    FIREBASE_WEB_API_KEY: 'AIza' + 'A'.repeat(35),
    FIREBASE_WEB_APP_ID: '1:123456789:web:abcdef1234567890abcdef12',
  });
  createFixtureServer().listen(8080, '127.0.0.1', () => console.log('Synthetic Firebase fixture at http://127.0.0.1:8080'));
}
