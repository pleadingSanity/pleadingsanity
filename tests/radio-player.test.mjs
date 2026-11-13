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
 assert.doesNotMatch(js,/left:-9999px|width:0;height:0/);
});
test('radio does not claim confirmed playback or fake volume',()=>{
 assert.doesNotMatch(js,/setText\('radio-status', 'Playing'\)/);
 assert.doesNotMatch(html,/id="radio-vol"/);
 assert.match(html,/use the official link if needed/);
});

async function playerHarness(options = {}) {
 const documentEvents = new Map();
 const stationPromises = [];
 const nodes=new Map(), timers=new Map(), intervals=new Map(), calls=[];
 let timerId=0, events, state=-1;
 function node(id) {
  if(!nodes.has(id)) nodes.set(id,{textContent:'',value:0,max:100,href:'',style:{},attrs:{},listeners:{},paused:true,pause(){this.paused=true;},load(){},removeAttribute(k){delete this.attrs[k];if(k==='src')this.src='';},play(){this.paused=false;return new Promise((resolve,reject)=>stationPromises.push({resolve,reject}));},
   classList:{toggle(){},add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v;if(k==='src')this.src=v;},getAttribute(k){return this.attrs[k] || null;},querySelector(){return null;},replaceChildren(){},appendChild(){},append(){},
   addEventListener(type,fn){this.listeners[type]=fn;}});
  return nodes.get(id);
 }
 const player={loadVideoById(id){calls.push(['load',id]);},playVideo(){calls.push(['resume']);},
  pauseVideo(){calls.push(['pause']);},stopVideo(){calls.push(['stop']);},getPlayerState(){return state;},
  getVolume(){return 75;},setVolume(){},getDuration(){return 180;},getCurrentTime(){return 15;}};
 const window={location:{origin:'https://example.test',search:options.search || ''},matchMedia:()=>({matches:true}),YT:{Player:function(id,options){events=options.events;return player;}}};
 const station = node('station-test'); station.attrs={'data-src':options.stationSrc || 'https://ice6.somafm.com/groovesalad-256-mp3','data-name':'Test Station'};
 const tracks=[{title:'First',artist:'A',youtubeId:'aaaaaaaaaaa'},{title:'Second',artist:'B',youtubeId:'bbbbbbbbbbb'}];
 vm.runInNewContext(js,{window,URL,URLSearchParams,CustomEvent:class {constructor(type,options){this.type=type;this.detail=options?.detail;}},document:{readyState:'complete',getElementById:node,
  createElement:()=>node('created-'+(++timerId)),querySelectorAll:selector=>options.stations && selector.startsWith('.station-play') ? [station] : [],querySelector:selector=>selector==='audio#station-audio'&&!options.wrongStationElement?node('station-audio'):null,head:{appendChild(){}},addEventListener(type,fn){if(!documentEvents.has(type))documentEvents.set(type,[]);documentEvents.get(type).push(fn);},dispatchEvent(e){for(const fn of documentEvents.get(e.type)||[])fn(e);}},
  fetch:async()=>({ok:true,json:async()=>({tracks})}),
  navigator:{},setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},
  setInterval(fn){const id=++timerId;intervals.set(id,fn);return id;},clearInterval(id){intervals.delete(id);}});
 await new Promise(resolve=>setImmediate(resolve));
 window.onYouTubeIframeAPIReady();events.onReady();
 return {nodes,calls,timers,intervals,stationPromises,station,dispatch:(type,detail)=>{for(const fn of documentEvents.get(type)||[])fn({type,detail});},key:key=>{for(const fn of documentEvents.get('keydown')||[])fn({key});},click:id=>node(id).listeners.click(),
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


test('a delayed station start after Stop cannot restore playing status or the floating Stop',async()=>{
 const h=await playerHarness({stations:true});
 h.station.listeners.click();
 assert.match(h.nodes.get('station-status').textContent,/Connecting/);
 h.click('radio-stop');
 h.stationPromises[0].resolve(); await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.nodes.get('station-audio').src,'');
 assert.match(h.nodes.get('station-status').textContent,/stopped/);
 assert.equal(h.nodes.get('radio-float-stop').hidden,true);
});

test('station playback rejects active URLs and unapproved hosts before starting audio',async()=>{
 for(const source of ['javascript:alert(1)','data:text/html,<script>alert(1)</script>','http://ice6.somafm.com/live','https://ice6.somafm.com.evil.example/live','https://user:password@ice6.somafm.com/live','https://127.0.0.1/live']){
  const h=await playerHarness({stations:true,stationSrc:source});
  h.station.listeners.click();
  assert.equal(h.stationPromises.length,0,source);
  assert.notEqual(h.nodes.get('station-audio').src,source);
  assert.match(h.nodes.get('station-status').textContent,/unavailable/);
 }
});

test('all existing station URLs remain supported without changing their source',async()=>{
 const sources=[...html.matchAll(/data-src="([^"]+)"/g)].map(match=>match[1]);
 assert.ok(sources.length>=18);
 for(const source of sources){
  const h=await playerHarness({stations:true,stationSrc:source});h.station.listeners.click();
  assert.equal(h.nodes.get('station-audio').src,source);
  assert.equal(h.stationPromises.length,1);
 }
});

test('a non-audio element with the station ID cannot receive a playback URL',async()=>{
 const h=await playerHarness({stations:true,wrongStationElement:true});
 assert.equal(h.station.listeners.click,undefined);
 assert.equal(h.stationPromises.length,0);
});

test('a failure from the previous station cannot overwrite the current station',async()=>{
 const h=await playerHarness({stations:true});
 h.station.listeners.click(); h.station.listeners.click();
 h.stationPromises[1].resolve(); await new Promise(resolve=>setImmediate(resolve));
 const current=h.nodes.get('station-status').textContent;
 assert.match(current,/Playing Test Station/);
 assert.equal(h.nodes.get('radio-float-stop').hidden,false,'floating stop works without MediaSession');
 h.stationPromises[0].reject(new Error('old stream'));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.nodes.get('station-status').textContent,current);
});

test('Escape stops stations and the shared focus event pauses the radio',async()=>{
 const h=await playerHarness({stations:true}); h.station.listeners.click(); h.key('Escape');
 assert.equal(h.nodes.get('station-audio').src,'');
 h.click('radio-play');h.dispatch('ps-audio-focus',{source:'playlist'});
 assert.equal(h.nodes.get('radio-play').textContent,'Play');
});

test('a shared track is selected without autoplay and unknown track values are ignored',async()=>{
 const selected=await playerHarness({search:'?track=bbbbbbbbbbb'});
 assert.equal(selected.nodes.get('radio-title').textContent,'Second');
 assert.equal(selected.calls.length,0);
 const invalid=await playerHarness({search:'?track=https://evil.example/'});
 assert.equal(invalid.nodes.get('radio-title').textContent,'First');
 assert.equal(invalid.calls.length,0);
});


test('share decoration never turns a share button into another share target',()=>{
 const body=js.slice(js.indexOf('    function decorateTrackButton('),js.indexOf('    function scanTracks()'));
 const make=(share)=>({attrs:{},textContent:'First · Artist',classList:{contains:name=>share && name==='ps-share-btn'},getAttribute(k){return this.attrs[k] || null;},setAttribute(k,v){this.attrs[k]=v;}});
 const context={RADIO_PAGE:'https://pleadingsanity.co.uk/insane-radio.html'};
 vm.createContext(context);vm.runInContext(body+';this.decorate = decorateTrackButton;',context);
 const track=make(false),share=make(true);
 context.decorate(track);context.decorate(share);
 assert.equal(track.attrs['data-ps-share'],'song');
 assert.equal(share.attrs['data-ps-share'],undefined,'observer-created buttons must not recursively create shares');
});
