// Run with: node --test tests/home-search.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const script=readFileSync(join(root,'js/home-search.js'),'utf8');
function element(tag='div') {return {tagName:tag,children:[],textContent:'',href:'',className:'',value:'',listeners:{},focused:false,appendChild(child){this.children.push(child);return child;},replaceChildren(...children){this.children=children;},addEventListener(name,fn){this.listeners[name]=fn;},focus(){this.focused=true;}};}
function setup(hash='') {const input=element('input'),output=element();const listeners={};const context={document:{getElementById(id){return id==='ps-site-search'?input:id==='ps-search-results'?output:null;},createElement:element},window:{location:{hash},addEventListener(name,fn){listeners[name]=fn;}}};vm.runInNewContext(script,context);return {input,output,context,listeners,search(value){input.value=value;input.listeners.input();return output.children;}};}
test('all indexed paths resolve to actual site pages',()=>{const matches=[...script.matchAll(/\['[^']+','(\/[^']+\.html)'/g)];assert.ok(matches.length>=25);for(const [,path] of matches)assert.ok(existsSync(join(root,path)),path+' missing');});
test('radio, games and journal are discoverable',()=>{const ui=setup();for(const [term,path] of [['radio','/insane-radio.html'],['games','/games.html'],['journal','/journal-vault.html']]){const results=ui.search(term);assert.equal(results[0].tagName,'ul');assert.ok(results[0].children.some(li=>li.children[0].href===path),term);}});
test('search handles multiple words and empty input',()=>{const ui=setup();assert.ok(ui.search('crisis help')[0].children.some(li=>li.children[0].href==='/crisis.html'));assert.equal(ui.search('').length,0);});
test('search returns text-only empty state and no markup injection',()=>{const ui=setup();const result=ui.search('<script>');assert.equal(result[0].tagName,'p');assert.equal(result[0].children.length,0);});
test('direct search links focus the input',()=>{assert.equal(setup('#ps-site-search').input.focused,true);const ui=setup();ui.context.window.location.hash='#ps-site-search';ui.listeners.hashchange();assert.equal(ui.input.focused,true);});
test('core navigation links to search on every main hub',()=>{for(const file of ['index.html','app.html','games.html','shop.html'])assert.match(readFileSync(join(root,file),'utf8'),/href="\/#ps-site-search"/,file);});
