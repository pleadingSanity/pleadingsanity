import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const data = JSON.parse(read('data/ps-ai-content.json'));
const page = read('podcast/index.html');
const review = read('podcast/review.html');
const js = read('js/ps-podcast.js');
const css = read('css/ps-podcast.css');
const studioFn = read('netlify/functions/studio.mts');
const studioLib = read('netlify/lib/studio.ts');
const family = read('netlify/functions/ai-family-daily.mts');
const ownerFn = read('netlify/functions/owner.mts');
const ownerLib = read('netlify/lib/owner.ts');
const redirects = read('_redirects');
const sitemap = read('sitemap.xml');
const site = read('js/site.js');
const aiStudio = read('js/ai-studio.js');

const bannedColour = /purple|pink|indigo|violet|#ff4d8d|#a855f7|#8b5cf6|#7c3aed|#6366f1|#ec4899|#d946ef|#000103|#ff00ff|#ff6b6b/i;
const emoji = /\p{Extended_Pictographic}/u;
const invented = /\b\d+\s*%\b|\bstud(?:y|ies) show|\bresearch (?:shows|says|found)\b|\b[0-9]+ out of [0-9]+\b/i;
const needles = ['116 123', '85258', '111', '999', 'not a therapist'];
const topics = ['grounding', 'sleep', 'peer connection', 'asking for help'];

const episodes = (data.items || []).filter((i) => i.kind === 'podcast');

test('four sample episodes exist and are drafts only', () => {
  assert.equal(episodes.length, 4);
  assert.ok(episodes.every((e) => e.status === 'draft'));
  assert.equal(episodes.filter((e) => e.status === 'approved').length, 0);
  const found = new Set(episodes.map((e) => e.topic));
  for (const topic of topics) assert.ok(found.has(topic), 'missing topic ' + topic);
});

test('sample titles are the expected four', () => {
  assert.deepEqual(episodes.map((e) => e.title), [
    'Feet on the Floor',
    "When Sleep Won't Come",
    "You Don't Have to Carry This Alone",
    'Asking for Help Is Allowed'
  ]);
});

test('every draft carries an AI label, a not-therapy note, crisis numbers, and no invented stats', () => {
  for (const episode of episodes) {
    assert.equal(episode.label, 'AI-generated');
    assert.match(episode.notTherapy, /not a therapist/i);
    const blob = [episode.summary, episode.notTherapy, ...(episode.script || []).map((t) => t.text)].join('\n');
    for (const needle of needles) assert.ok(blob.includes(needle), episode.id + ' missing ' + needle);
    assert.ok(!invented.test(blob), 'possible invented stat in ' + episode.id);
    assert.ok((episode.script || []).length >= 1);
    assert.ok(existsSync(resolve(root, episode.image.slice(1))), episode.image);
  }
});

test('public page and review page keep crisis numbers visible and label AI work', () => {
  for (const html of [page, review]) {
    for (const needle of needles) assert.ok(html.includes(needle), 'page missing ' + needle);
    assert.match(html, /tel:116123/);
    assert.match(html, /tel:999/);
    assert.match(html, /tel:111/);
    assert.match(html, /85258/);
    assert.doesNotMatch(html, emoji);
  }
  assert.match(page, /AI-generated|labelled AI/);
  assert.match(page, /human review queue/);
  assert.match(page, /speechSynthesis|browser's own voices|browser/);
  assert.match(page, /P\.S Radio/);
  assert.match(page, /profile\.html/);
  assert.match(page, /rel="canonical" href="https:\/\/pleadingsanity\.co.uk\/podcast\/"/);
  assert.match(review, /noindex/);
  assert.doesNotMatch(review, /name="robots" content="index/);
});

test('public page only renders approved catalog items', () => {
  assert.match(js, /status === 'approved'/);
  assert.match(js, /human review queue/);
  assert.match(js, /speechSynthesis/);
  assert.doesNotMatch(js, /clone|elevenlabs|cloned voice/i);
  assert.doesNotMatch(js, emoji);
});

test('new CSS stays on the house colours', () => {
  assert.match(css, /#0b0f19/);
  assert.match(css, /#00fff0/);
  assert.match(css, /#38bdf8/);
  assert.match(css, /#f59e0b/);
  assert.doesNotMatch(css, bannedColour);
  assert.doesNotMatch(css, emoji);
});

test('new AI studio posts and podcasts start hidden for human review', () => {
  assert.match(studioLib, /hidden:\s*true/);
  assert.match(studioFn, /hidden:\s*true/);
  assert.match(studioFn, /pendingReview/);
  assert.match(studioFn, /\/api\/studio\/draft/);
  assert.match(family, /hidden:\s*true/);
  assert.match(ownerFn, /studio-queue/);
  assert.match(ownerLib, /studioReviewQueue/);
  assert.match(aiStudio, /review queue/);
});

test('podcast route, nav and sitemap point at the new page', () => {
  assert.match(redirects, /\/podcast\.html\s+\/podcast\/index\.html\s+301/);
  assert.match(sitemap, /https:\/\/pleadingsanity\.co.uk\/podcast\//);
  assert.doesNotMatch(sitemap, /review\.html/);
  assert.match(site, /ensureNavLink\('\/podcast\/',\s*'Podcast'\)/);
});
