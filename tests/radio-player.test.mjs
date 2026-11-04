import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'insane-radio.html'),'utf8');
const js=readFileSync(resolve(root,'js/radio-player.js'),'utf8');
const data=JSON.parse(readFileSync(resolve(root,'data/radio-library.json'),'utf8'));
test('radio has a visible video container and user-facing fallback',()=>{
 assert.match(html,/id="radio-video"/);
 assert.match(html,/id="radio-support"/);
 assert.match(html,/rel="canonical" href="https:\/\/pleadingsanity\.co\.uk\/insane-radio\.html"/);
 assert.match(js,/youtube-nocookie\.com\/embed/);
 assert.doesNotMatch(js,/left:-9999px|aria-hidden.*true|width:0;height:0/);
});
test('radio does not claim confirmed playback or fake volume',()=>{
 assert.doesNotMatch(js,/setText\('radio-status', 'Playing'\)/);
 assert.doesNotMatch(html,/id="radio-vol"/);
 assert.match(js,/If sound does not start/);
});
test('library retains tracks and valid official support links',()=>{
 assert.ok(data.tracks.length>=20);
 for(const t of data.tracks){assert.ok(t.title && t.artist);assert.ok(/^https:\/\/www\.youtube\.com\//.test(t.supportLink));}
});
