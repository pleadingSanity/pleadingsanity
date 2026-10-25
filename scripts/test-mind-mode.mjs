import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../js/mind-mode.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function fixture(saved={}) {
 const ids=new Map(), intervals=new Map(), listeners={}, winListeners={}, writes=[];let counter=0;
 const document={hidden:false,activeElement:null,listeners,addEventListener(k,f){listeners[k]=f;}};
 class Element {
  constructor(){this.dataset={};this.hidden=false;this.children=[];this.attrs={};this.listeners={};this.textContent='';this.style={};this.classList={add(){},remove(){},toggle(){}};this._html='';}
  set innerHTML(v){this._html=v;}
  get innerHTML(){return this._html;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,f){this.listeners[k]=f;}
  click(){document.activeElement=this;this.listeners.click?.({target:this});}
  focus(){document.activeElement=this;}
  querySelectorAll(){return [];}
  replaceChildren(){this.children=[];}
  append(...children){this.children.push(...children);}
  appendChild(child){this.children.push(child);}
 }
 document.getElementById=(id)=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
 document.createElement=()=>new Element();document.createTextNode=text=>({textContent:text});
 const tabs=['breathe','focus','calm'].map(mode=>{const e=new Element();e.dataset.mode=mode;return e;});
 const panels=tabs.map((tab,i)=>{const e=new Element();e.dataset.panel=tab.dataset.mode;e.hidden=i!==0;return e;});
 document.querySelectorAll=s=>s==='[data-mode]'?tabs:s==='[data-panel]'?panels:[];
 document.querySelector=()=>panels[2];
 const context=vm.createContext({document,window:{matchMedia:()=>({matches:true}),addEventListener(k,f){winListeners[k]=f;}},
 structuredClone,Date,loadProgress:()=>saved,saveProgress:(id,data)=>writes.push(structuredClone(data)),onProgressSync(){},loadMe:()=>Promise.resolve(null),
 setInterval(f){intervals.set(++counter,f);return counter;},clearInterval(id){intervals.delete(id);},setTimeout(f){f();return 0;},clearTimeout(){}});
 vm.runInContext(source,context);
 return {ids,context,tabs,panels,document,intervals,writes,winListeners,el:id=>document.getElementById(id),state:()=>vm.runInContext('state',context)};
}
test('new visits start with no-hold breathing while existing valid choices remain',()=>{
 assert.equal(fixture().state().pattern,'coherent');assert.equal(fixture({pattern:'box'}).state().pattern,'box');assert.equal(fixture({pattern:'__proto__'}).state().pattern,'coherent');
});
test('backgrounding stops timers without stealing focus or counting unfinished breaths',()=>{
 const f=fixture();f.el('mm-start').click();assert.equal(f.intervals.size,1);const focus=f.document.activeElement;
 f.document.hidden=true;f.document.listeners.visibilitychange();assert.equal(f.intervals.size,0);assert.equal(f.state().sessions,0);assert.equal(f.document.activeElement,focus);assert.equal(f.writes.length,0);
});
test('switching modes stops breathing and keeps the selected mode focused; Escape restores Start',()=>{
 const f=fixture();f.el('mm-start').click();f.tabs[1].click();assert.equal(f.document.activeElement,f.tabs[1]);assert.equal(f.intervals.size,0);assert.equal(f.panels[0].hidden,true);
 f.tabs[0].click();f.el('mm-start').click();f.document.listeners.keydown({key:'Escape'});assert.equal(f.document.activeElement,f.el('mm-start'));
});
test('grounding can skip or finish early without falsely recording a full five-sense walk',()=>{
 const f=fixture();f.el('mm-ground-next').click();f.el('mm-ground-skip').click();for(let i=0;i<4;i++)f.el('mm-ground-next').click();assert.equal(f.state().groundings,0);assert.equal(f.writes.length,0);
 f.el('mm-ground-next').click();f.el('mm-ground-finish').click();assert.equal(f.el('mm-ground-next').textContent,'Begin');assert.equal(f.document.activeElement,f.el('mm-ground-next'));assert.equal(f.state().groundings,0);
});
test('a full grounding walk keeps the existing progress format and returning Back keeps focus visible',()=>{
 const f=fixture();f.el('mm-ground-next').click();f.el('mm-ground-next').click();f.el('mm-ground-back').click();assert.equal(f.document.activeElement,f.el('mm-ground-next'));
 for(let i=0;i<5;i++)f.el('mm-ground-next').click();assert.equal(f.state().groundings,1);assert.equal(f.state().sessions,1);assert.equal(f.writes.length,1);assert.equal(f.writes[0].recent[0].t,'ground');
});
test('corrupt counters and recent entries cannot become HTML or break initial rendering; load never writes',()=>{
 const f=fixture({sessions:'<img src=x onerror=alert(1)>',breaths:-3,seconds:Infinity,groundings:{},recent:[null,{}, {d:'<img>'}],rounds:-1});
 assert.equal(f.state().sessions,0);assert.equal(f.el('mm-stats').innerHTML,'');assert.equal(f.el('mm-stats').children[0].children[0].textContent,'0');assert.equal(f.writes.length,0);assert.equal(f.state().rounds,5);
});
