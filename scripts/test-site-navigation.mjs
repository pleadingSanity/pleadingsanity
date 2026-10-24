import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../js/site.js', import.meta.url), 'utf8');
const start = source.indexOf("  if (nav && !nav.querySelector('.ps-nav-toggle'))");
const code = source.slice(start, source.indexOf('  var path = location.pathname;', start));
function fixture() {
  let document;
  class Element {
    constructor(tag='div', cls='') { this.tag=tag; this.className=cls; this.children=[]; this.attrs={}; this.listeners={}; }
    get className() { return [...this.tokens].join(' '); }
    set className(v) { this.tokens=new Set(v.split(/\s+/).filter(Boolean)); }
    get classList() { const e=this; return { contains: c=>e.tokens.has(c), add: c=>e.tokens.add(c), remove: c=>e.tokens.delete(c), toggle(c,on) { if(on??!e.tokens.has(c))e.tokens.add(c);else e.tokens.delete(c); } }; }
    appendChild(e) { e.parent=this;this.children.push(e);return e; }
    matches(s) { if(s.includes(' ')){const parts=s.split(' ');return this.matches(parts[1])&&!!this.parent?.closest(parts[0]);} return s.startsWith('.')?s.slice(1).split('.').every(c=>this.tokens.has(c)):this.tag===s; }
    querySelectorAll(s) { const choices=s.split(',').map(x=>x.trim());return this.children.flatMap(c=>[...(choices.some(x=>c.matches(x))?[c]:[]),...c.querySelectorAll(s)]); }
    querySelector(s) { return this.querySelectorAll(s)[0]||null; }
    closest(s) { return this.matches(s)?this:this.parent?.closest(s)||null; }
    contains(e) { return e===this||this.children.some(c=>c.contains(e)); }
    setAttribute(k,v) { this.attrs[k]=String(v); }
    getAttribute(k) { return this.attrs[k]??null; }
    addEventListener(k,fn) { (this.listeners[k]??=[]).push(fn); }
    focus() { document.activeElement=this;document.fire('focusin',this); }
    fire(k,target=this,key) { const event={target,key,preventDefault(){this.prevented=true;}};for(const fn of this.listeners[k]||[])fn(event);return event; }
  }
  document=new Element('document');document.createElement=t=>new Element(t);
  const nav=document.appendChild(new Element('nav','ps-nav'));
  const inner=nav.appendChild(new Element('div','ps-nav-inner'));
  const links=inner.appendChild(new Element('div','ps-links'));
  const doors=links.appendChild(new Element('div','ps-sheet-doors'));
  const first=doors.appendChild(new Element('a'));
  const group=links.appendChild(new Element('div','ps-group'));
  const button=group.appendChild(new Element('button','ps-group-btn'));
  const submenu=group.appendChild(new Element('div','ps-group-menu'));
  const destination=submenu.appendChild(new Element('a'));
  const outside=document.appendChild(new Element('main'));
  vm.runInNewContext(code,{nav,document});
  return {document,nav,links,group,button,destination,first,outside,toggle:nav.querySelector('.ps-nav-toggle'),Element};
}
test('JavaScript disclosure state disables the CSS fallback; Escape closes and restores the visible group button',()=>{
 const f=fixture();assert.ok(f.nav.classList.contains('ps-js'));
 f.links.fire('click',f.button);assert.equal(f.button.getAttribute('aria-expanded'),'true');
 f.document.fire('keydown',f.button,'Escape');
 assert.equal(f.group.classList.contains('open'),false);assert.equal(f.button.getAttribute('aria-expanded'),'false');assert.equal(f.document.activeElement,f.button);
});
test('ArrowDown opens the disclosure and focuses its first destination',()=>{
 const f=fixture();const event=f.links.fire('keydown',f.button,'ArrowDown');
 assert.ok(event.prevented);assert.ok(f.group.classList.contains('open'));assert.equal(f.document.activeElement,f.destination);
});
test('outside pointer and focus dismiss menus without stealing content focus',()=>{
 const f=fixture();f.links.fire('click',f.button);f.document.fire('pointerdown',f.outside);assert.equal(f.group.classList.contains('open'),false);
 f.links.fire('click',f.button);f.outside.focus();assert.equal(f.group.classList.contains('open'),false);assert.equal(f.document.activeElement,f.outside);
});
test('opening the phone sheet focuses a destination and Escape restores its opener',()=>{
 const f=fixture();f.toggle.fire('click');assert.equal(f.document.activeElement,f.first);assert.equal(f.toggle.getAttribute('aria-expanded'),'true');
 f.document.fire('keydown',f.first,'Escape');assert.equal(f.toggle.getAttribute('aria-expanded'),'false');assert.equal(f.document.activeElement,f.toggle);
});
