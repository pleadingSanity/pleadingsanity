import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'insane-radio.html'),'utf8');
const js=readFileSync(resolve(root,'js/radio-player.js'),'utf8');
const data=JSON.parse(readFileSync(resolve(root,'data/radio-library.json'),'utf8'));
test('radio has a visible video container and user-facing fallback',()=>{
 assert.match(html,/id="radio-video-player"/);
 assert.match(html,/id="radio-support"/);
 assert.match(html,/rel="canonical" href="https:\/\/pleadingsanity\.co\.uk\/insane-radio\.html"/);
 assert.match(js,/youtube\.com\/iframe_api/);
 assert.doesNotMatch(js,/left:-9999px|aria-hidden.*true|width:0;height:0/);
});
test('radio does not claim confirmed playback or fake volume',()=>{
 assert.doesNotMatch(js,/setText\('radio-status', 'Playing'\)/);
 assert.doesNotMatch(html,/id="radio-vol"/);
 assert.match(html,/use the official link if needed/);
});

async function playerHarness() {
 const nodes=new Map(), timers=new Map(), intervals=new Map(), calls=[];
 let timerId=0, events, state=-1;
 function node(id) {
  if(!nodes.has(id)) nodes.set(id,{textContent:'',value:0,max:100,href:'',listeners:{},
   classList:{toggle(){}},setAttribute(){},replaceChildren(){},appendChild(){},
   addEventListener(type,fn){this.listeners[type]=fn;}});
  return nodes.get(id);
 }
 const player={loadVideoById(id){calls.push(['load',id]);},playVideo(){calls.push(['resume']);},
  pauseVideo(){calls.push(['pause']);},stopVideo(){calls.push(['stop']);},getPlayerState(){return state;},
  getVolume(){return 75;},setVolume(){},getDuration(){return 180;},getCurrentTime(){return 15;}};
 const window={location:{origin:'https://example.test'},YT:{Player:function(id,options){events=options.events;return player;}}};
 const tracks=[{title:'First',artist:'A',youtubeId:'aaaaaaaaaaa'},{title:'Second',artist:'B',youtubeId:'bbbbbbbbbbb'}];
 vm.runInNewContext(js,{window,URL,document:{readyState:'complete',getElementById:node,
  createElement:()=>node('created-'+(++timerId)),head:{appendChild(){}},addEventListener(){}},
  fetch:async()=>({ok:true,json:async()=>({tracks})}),
  setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},
  setInterval(fn){const id=++timerId;intervals.set(id,fn);return id;},clearInterval(id){intervals.delete(id);}});
 await new Promise(resolve=>setImmediate(resolve));
 window.onYouTubeIframeAPIReady();events.onReady();
 return {nodes,calls,timers,intervals,click:id=>node(id).listeners.click(),
  emit(value){state=value;events.onStateChange({data:value});},error(){events.onError();},
  timeout(){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}};
}

test('radio waits for Play and reports playback only after the player confirms it',async()=>{
 const h=await playerHarness();assert.equal(h.calls.length,0);
 h.click('radio-play');assert.deepEqual(h.calls,[['load','aaaaaaaaaaa']]);
 assert.doesNotMatch(h.nodes.get('radio-status').textContent,/Now playing/);
 h.emit(1);assert.match(h.nodes.get('radio-status').textContent,/Now playing/);
 assert.equal(h.timers.size,0);
 h.emit(0);assert.deepEqual(h.calls.at(-1),['load','bbbbbbbbbbb']);
});

test('selecting another track while paused loads that track instead of resuming the old audio',async()=>{
 const h=await playerHarness();h.click('radio-play');h.emit(1);h.click('radio-play');h.emit(2);
 h.click('radio-next');h.click('radio-play');
 assert.deepEqual(h.calls.at(-1),['load','bbbbbbbbbbb']);
});

test('a pause inside YouTube clears the startup timer and one Play click resumes',async()=>{
 const h=await playerHarness();h.click('radio-play');h.emit(1);h.emit(3);h.emit(2);
 assert.equal(h.timers.size,0);
 assert.equal(h.nodes.get('radio-play').textContent,'Play');
 h.click('radio-play');assert.deepEqual(h.calls.at(-1),['resume']);
});

test('a late playing event after Stop is paused instead of starting unwanted audio',async()=>{
 const h=await playerHarness();h.click('radio-play');h.click('radio-play');
 const before=h.calls.length;h.emit(1);
 assert.equal(h.calls.length,before+1);assert.deepEqual(h.calls.at(-1),['pause']);
});

test('unavailable tracks are skipped once and stop after the entire list fails',async()=>{
 const h=await playerHarness();h.click('radio-play');h.error();h.error();
 assert.deepEqual(h.calls,[['load','aaaaaaaaaaa'],['load','bbbbbbbbbbb'],['stop']]);
 assert.equal(h.timers.size,0);assert.equal(h.nodes.get('radio-play').textContent,'Play');
 assert.match(h.nodes.get('radio-status').textContent,/official music link/);
});

test('startup timeout advances and manual Pause cancels further timeout skips',async()=>{
 const h=await playerHarness();h.click('radio-play');h.timeout();
 assert.deepEqual(h.calls.at(-1),['load','bbbbbbbbbbb']);
 h.click('radio-play');assert.equal(h.timers.size,0);
});
test('library retains tracks and valid official support links',()=>{
 assert.ok(data.tracks.length>=20);
 for(const t of data.tracks){assert.ok(t.title && t.artist);assert.ok(/^https:\/\/www\.youtube\.com\//.test(t.supportLink));}
});
