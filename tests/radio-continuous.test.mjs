import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('js/radio-player.js','utf8');
const html=readFileSync('insane-radio.html','utf8');
const css=readFileSync('css/radio-styles.css','utf8');
const library=JSON.parse(readFileSync('data/radio-library.json','utf8'));
test('user initiated continuous listening and track-end transition',()=>{
 assert.match(js,/addEventListener\('click'/);
 assert.match(js,/event\.data === STATE\.ENDED/);
 assert.match(js,/move\(1, false\)/);
 assert.doesNotMatch(js,/autoplay=1/);
});
test('eight-second timeout and explicit failure state',()=>{
 assert.match(js,/8000/);
 assert.match(js,/skipFailed\(\)/);
 assert.match(js,/This one's resting/);
 assert.match(js,/onError:/);
});
test('player reports real state and exposes official fallback',()=>{
 assert.match(js,/youtube\.com\/iframe_api/);
 assert.match(js,/onStateChange:onState/);
 assert.match(html,/id="radio-progress"/);
 assert.match(html,/id="radio-support"/);
 assert.match(css,/prefers-reduced-motion/);
});
test('first entry retains official link and does not host audio',()=>{
 const first=library.tracks[0];
 assert.equal(first.title,"Nuthin' but a 'G' Thang");
 assert.match(first.supportLink,/^https:\/\/www\.youtube\.com\/watch\?v=/);
 assert.match(first.youtubeId,/^[\w-]{11}$/);
 const players = [...html.matchAll(/<audio\b([^>]*)>([\s\S]*?)<\/audio>/gi)];
 assert.equal(players.length, 1);
 const [, attributes, children] = players[0];
 assert.match(attributes, /\bid="station-audio"/);
 assert.match(attributes, /\bpreload="none"/);
 assert.doesNotMatch(attributes, /\b(?:autoplay|src)\b/i);
 assert.doesNotMatch(children, /<source\b/i);
 const stationUrls = [...html.matchAll(/<button\b[^>]*\bdata-src="([^"]+)"/gi)];
 assert.ok(stationUrls.length > 0);
 for (const [, source] of stationUrls) {
  const url = new URL(source);
  assert.equal(url.protocol, 'https:');
  assert.match(url.hostname, /^(?:[a-z0-9-]+\.)*somafm\.com$/i);
 }
});
