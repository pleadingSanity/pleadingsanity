import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const library=JSON.parse(readFileSync(new URL('../data/radio-library.json',import.meta.url),'utf8'));
const page=readFileSync(new URL('../insane-radio.html',import.meta.url),'utf8');
const player=readFileSync(new URL('../js/radio-player.js',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('radio library is nonempty and structured',()=>{
  assert.ok(Array.isArray(library.tracks)&&library.tracks.length>0);
  for(const [i,t] of library.tracks.entries()){
    assert.ok(t.title&&t.artist,'missing title/artist '+i);
    assert.match(t.supportLink,/^https:\/\/(www\.)?youtube\.com\//,'unexpected artist link '+i);
    if(t.youtubeId) assert.match(t.youtubeId,/^[A-Za-z0-9_-]{11}$/,'bad embed ID '+i);
  }
});
test('no unrelated tracks share a video ID',()=>{
  const seen=new Map();
  for(const t of library.tracks){
    if(!t.youtubeId)continue;
    const prev=seen.get(t.youtubeId);
    if(prev)assert.equal(t.title.toLowerCase(),prev.toLowerCase(),'video ID reused by unrelated songs: '+t.title+' / '+prev);
    seen.set(t.youtubeId,t.title);
  }
});
test('radio has explicit user play and visible video controls',()=>{
  assert.match(page,/id="radio-play"/);
  assert.match(page,/id="radio-video"/);
  assert.match(page,/\/js\/radio-player\.js/);
  assert.match(player,/youtube-nocookie\.com\/embed/);
  assert.match(player,/function play\(\)/);
  assert.match(player,/addEventListener\('click'/);
  assert.doesNotMatch(page,/<iframe\b/i);
});
test('homepage radio feature links to actual radio page',()=>{
  assert.match(home,/class="ps-radio-feature" href="\/insane-radio\.html"/);
});
