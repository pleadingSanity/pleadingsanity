// Synthetic inputs only. No model, network, account or user records.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/arron-companion.js',import.meta.url),'utf8');
const server=readFileSync(new URL('../netlify/functions/arron.mts',import.meta.url),'utf8');
const moodStart=source.indexOf('  const MOOD_WORDS =');
const moodCode=source.slice(moodStart,source.indexOf('  // ─── STATE',moodStart));
const handlerStart=source.indexOf('  let busy = false;');
const handlerCode=source.slice(handlerStart,source.indexOf('  // ─── COMPOSER',handlerStart));
function fixture({online=true,response={ok:true,json:async()=>({reply:'Synthetic online reply',provider:'fixture',remembered:false})},failure}={}){
 const messages=[],statuses=[],connections=[],requests=[];
 const context=vm.createContext({currentMood:null,reduceMotion:true,navigator:{onLine:online},KEYS:{draft:'synthetic-draft'},sessionStorage:{removeItem(){}},
 sendButton:{disabled:false},inputField:{value:'synthetic draft',focus(){this.focused=true;}},autosize(){},setMood(m){context.currentMood=m;},
 addMessage(content,role,options){messages.push({content,role,options});},showTyping(){return {};},hideTyping(){},
 CHAT_API:'/api/arron/chat',memoryId:'synthetic-memory',userName:'',creatorMode:false,ownerMode:false,member:null,replyActions:[],
 request:async(url,options)=>{requests.push({url,options});if(failure)throw failure;return response;},
 setConn:s=>connections.push(s),setStatus:s=>statuses.push(s),answeredVia:()=>'',addReplyActions(){},addSuggestion(){},chime(){},setTimeout});
 vm.runInContext(moodCode+handlerCode,context);
 return {api:vm.runInContext('({detectMood,offlineResponse,handleInput})',context),messages,statuses,connections,requests,context};
}
test('offline crisis detector matches the server literal, including unsafe and self-harm variants',()=>{
 const expected=server.match(/^const CRISIS_WORDS = (\/.+\/i);$/m)[1];assert.ok(moodCode.includes("const CRISIS_WORDS = "+expected+";"));
 const f=fixture();for(const text of ['not safe','I want to die','kill me','I am hurting myself','I have taken an overdose','wanna die','take my life'])assert.equal(f.api.detectMood(text),'crisis');
 assert.equal(f.api.detectMood('I feel calm today'),'calm');
});
test('every crisis fallback retains support signposts and AI limitation',()=>{
 const f=fixture();for(const text of ['not safe','I want to die','kill me']){const reply=f.api.offlineResponse(text);for(const token of ['999','116 123','85258','111','/crisis.html','not a therapist'])assert.ok(reply.includes(token));}
});
test('offline mode never requests a provider and re-enables the composer',async()=>{
 const f=fixture({online:false});await f.api.handleInput('Synthetic fixture: not safe');assert.equal(f.requests.length,0);assert.equal(f.messages.at(-1).options.fallback,true);assert.equal(f.connections.at(-1),'offline');assert.equal(f.context.sendButton.disabled,false);assert.equal(f.context.inputField.focused,true);
});
test('404, 503 and rejected requests keep a labelled local reply, without exposing server errors',async()=>{
 for(const config of [{response:{ok:false,status:404}},{response:{ok:false,status:503}},{failure:new Error('private-error-detail')}]){
  const f=fixture(config);await f.api.handleInput('Synthetic fixture: not safe');const reply=f.messages.at(-1);assert.equal(reply.options.fallback,true);assert.ok(reply.content.includes('116 123'));assert.ok(!reply.content.includes('private-error-detail'));assert.equal(f.connections.at(-1),'reconnecting');assert.match(f.statuses.at(-1),/isn't saved/);assert.equal(f.context.sendButton.disabled,false);
 }
});
test('malformed and empty API replies fall back, while successful replies keep the existing shape',async()=>{
 for(const json of [async()=>{throw Error('malformed');},async()=>({reply:''}),async()=>({reply:{unexpected:'object'}}),async()=>({reply:'   '}),async()=>null]){const f=fixture({response:{ok:true,json}});await f.api.handleInput('Synthetic hello');assert.equal(f.messages.at(-1).options.fallback,true);}
 const f=fixture();await f.api.handleInput('Synthetic hello');assert.equal(f.messages.at(-1).content,'Synthetic online reply');assert.equal(f.messages.at(-1).options.fallback,false);assert.equal(f.requests.length,1);
});
