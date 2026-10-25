import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../js/site.js', import.meta.url), 'utf8');
const start = source.indexOf('  // Install controls are optional.');
const code = source.slice(start, source.indexOf('  // ─── INSTALL ONCE', start));
function fixture({standalone=false, ios=false, ipad=false}={}) {
  const listeners = {}, displayListeners = {};
  const document = { activeElement: null, createElement: () => note() };
  function note() { return { dataset:{}, attrs:{}, textContent:'', setAttribute(k,v){this.attrs[k]=v;},focus(){document.activeElement=this;} }; }
  function button() {
    const parent = { status:null, querySelector(){return this.status;} };
    return { parentElement:parent, hidden:false, disabled:false, listeners:{}, classList:{toggle(){}},
      addEventListener(k,f){this.listeners[k]=f;},insertAdjacentElement(where,n){parent.status=n;},
      focus(){document.activeElement=this;},click(){return this.listeners.click();} };
  }
  const buttons = [button(),button()];
  document.querySelectorAll=()=>buttons;
  const window={matchMedia:()=>({matches:standalone,addEventListener(k,f){displayListeners[k]=f;}}),addEventListener(k,f){listeners[k]=f;}};
  const navigator={standalone:false,userAgent:ios?'iPhone':'Test browser',platform:ipad?'MacIntel':'',maxTouchPoints:ipad?5:0};
  vm.runInNewContext(code,{window,document,navigator});
  function ready(prompt){let prevented=false;listeners.beforeinstallprompt({preventDefault(){prevented=true;},...prompt});assert.ok(prevented);}
  return {buttons,document,listeners,displayListeners,ready};
}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
test('unsupported browsers hide native-install controls; standalone remains hidden',()=>{
 const f=fixture();assert.ok(f.buttons.every(b=>b.hidden));
 const installed=fixture({standalone:true});installed.ready({prompt(){throw Error('must not prompt');}});
 assert.ok(installed.buttons.every(b=>b.hidden));
});
test('iPhone and desktop-mode iPad offer manual guidance without a fake prompt',async()=>{
 for(const options of [{ios:true},{ipad:true}]){const f=fixture(options);assert.equal(f.buttons[0].hidden,false);await f.buttons[0].click();assert.match(f.buttons[0].parentElement.status.textContent,/Safari.*Add to Home Screen/);}
});
test('one browser event is consumed once, including rapid clicks on duplicate controls',async()=>{
 const f=fixture(), d=deferred();let calls=0;
 f.ready({prompt(){calls++;return d.promise;}});f.buttons[0].focus();const pending=f.buttons[0].click();
 assert.ok(f.buttons.every(b=>b.disabled));await f.buttons[1].click();assert.equal(calls,1);
 d.resolve({outcome:'dismissed'});await pending;
 assert.ok(f.buttons.every(b=>b.hidden&&!b.disabled));assert.match(f.buttons[0].parentElement.status.textContent,/No problem/);assert.equal(f.document.activeElement,f.buttons[0].parentElement.status);
});
test('synchronous failures and rejected choices leave usable instructions without uncaught rejection',async()=>{
 for(const prompt of [{prompt(){throw Error('private-error');}},{prompt(){return Promise.resolve();},userChoice:Promise.reject(Error('private-error'))}]){
 const f=fixture();f.ready(prompt);await f.buttons[0].click();const text=f.buttons[0].parentElement.status.textContent;
 assert.match(text,/could not open/);assert.doesNotMatch(text,/private-error/);assert.ok(f.buttons.every(b=>!b.disabled&&b.hidden));
 }
});
test('installation through browser UI wins over an older pending prompt failure',async()=>{
 const f=fixture(),d=deferred();f.ready({prompt:()=>d.promise});f.buttons[0].focus();const pending=f.buttons[0].click();f.listeners.appinstalled();
 d.reject(Error('late failure'));await pending;assert.match(f.buttons[0].parentElement.status.textContent,/^Installed/);
 f.ready({prompt(){throw Error('no second install');}});assert.ok(f.buttons.every(b=>b.hidden));
});
test('accepted prompt is not described as completed installation until appinstalled',async()=>{
 const f=fixture();f.ready({prompt:async()=>({outcome:'accepted'})});await f.buttons[0].click();assert.match(f.buttons[0].parentElement.status.textContent,/browser will finish/);
 f.listeners.appinstalled();assert.match(f.buttons[0].parentElement.status.textContent,/^Installed/);
});
