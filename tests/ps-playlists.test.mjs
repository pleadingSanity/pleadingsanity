import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const data = JSON.parse(read('data/ps-playlists.json'));
const page = read('music/index.html');
const js = read('js/ps-playlists.js');
const css = read('css/ps-playlists.css');

test('two separate playlists: Shane\'s voice and the AI playlist', () => {
  const titles = data.playlists.map((p) => p.title);
  assert.deepEqual(titles, ["Pleading Socially - Shane's Voice", 'P.S AI Playlist']);
  const [voice, ai] = data.playlists;
  assert.equal(voice.kind, 'human');
  assert.equal(ai.kind, 'ai');
  assert.equal(ai.label, 'AI-generated');
});

test('nothing is published until Shane approves it', () => {
  for (const list of data.playlists) {
    for (const t of list.tracks) {
      if (t.approved === true) {
        assert.match(t.src, /^\/music\/audio\//);
        assert.ok(existsSync(new URL('../' + t.src.slice(1), import.meta.url)), t.src);
      }
    }
  }
  assert.match(js, /approved === true/);
  assert.doesNotMatch(js, /\.autoplay|innerHTML/);
  assert.match(js, /AI-generated/);
});

test('music page loads the playlists section without inline script', () => {
  assert.match(page, /id="ps-playlists"/);
  assert.match(page, /<script src="\/js\/ps-playlists\.js" defer><\/script>/);
  assert.match(page, /\/css\/ps-playlists\.css/);
});

test('brand lock: no purple, pink or indigo in the playlist styles', () => {
  assert.doesNotMatch(css, /purple|pink|indigo|violet|#a855f7|#8b5cf6|#7c3aed|#6366f1|#ec4899|#d946ef/i);
});
