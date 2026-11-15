import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync('js/music-creator-beats.js','utf8');
const context=vm.createContext({window:{},Blob});vm.runInContext(code,context);
const beats=context.window.PSStudioBeats;
test('all seven original presets produce distinct, bounded eight-bar PCM loops',async()=>{
 assert.equal(beats.presets.length,7);const signatures=new Set();
 for(let i=0;i<7;i++){
  const made=beats.create(i),data=await made.blob.arrayBuffer(),v=new DataView(data);
  assert.equal(Buffer.from(data).subarray(0,4).toString(),'RIFF');assert.equal(v.getUint16(22,true),1);assert.equal(v.getUint32(24,true),22050);
  assert.equal(v.getUint32(40,true),data.byteLength-44);assert.equal(made.bpm,beats.presets[i].bpm);
  assert.ok(Math.abs(made.duration-32*60/made.bpm)<1/22050);
  let peak=0,squares=0;for(let p=44;p<data.byteLength;p+=2){const sample=v.getInt16(p,true);peak=Math.max(peak,Math.abs(sample));squares+=sample*sample;}
  assert.ok(peak<=26870 && peak>26000,'normalized below clipping');assert.ok(squares>0);
  signatures.add(Buffer.from(data).subarray(44,88244).toString('base64'));
 }
 assert.equal(signatures.size,7,'presets must not silently generate the same beat');
});
test('the same preset is repeatable and invalid choices are rejected without allocating audio',async()=>{
 assert.deepEqual(Buffer.from(await beats.create(1).blob.arrayBuffer()),Buffer.from(await beats.create(1).blob.arrayBuffer()));
 for(const value of [-1,7,Infinity,NaN,{},'1',1.5])assert.throws(()=>beats.create(value),/Choose/);
});
test('original loop generation has no device, network or speech dependency',()=>{
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|AudioContext|getUserMedia|SpeechRecognition|https?:\/\//);
 assert.match(code,/commercial releases/);
});
