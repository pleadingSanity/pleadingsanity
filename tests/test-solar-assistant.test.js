import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareSolarTurn, SOLAR_KB, SOLAR_SYSTEM, SOLAR_BOUNDARY, SOLAR_SOURCES } from '../netlify/lib/solar-knowledge.ts';

const fn = readFileSync(new URL('../netlify/functions/solar-assistant.mts', import.meta.url), 'utf8');
const lab = readFileSync(new URL('../netlify/lib/test-lab-core.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../insane-solar.html', import.meta.url), 'utf8');

test('distress stops before any provider', () => {
  const turn = prepareSolarTurn('I do not want to be here');
  assert.equal(turn.ok, true);
  assert.equal(turn.callModel, false);
  assert.match(turn.reply, /999/);
  assert.match(turn.reply, /116 123/);
  assert.match(turn.reply, /85258/);
  assert.match(turn.reply, /111/);
});

test('a solar question is grounded in the knowledge base', () => {
  const turn = prepareSolarTurn('How does G98 differ from G99?');
  assert.equal(turn.callModel, true);
  assert.match(turn.system, /G98/);
  assert.match(turn.system, /G99/);
  assert.match(SOLAR_KB, /EPC is not required for SEG/);
  assert.match(SOLAR_SYSTEM, /never say an EPC is required for SEG/i);
  assert.match(SOLAR_KB, /typically/);
  assert.match(SOLAR_BOUNDARY, /Part P/);
  assert.match(SOLAR_BOUNDARY, /registered electrician/);
  assert.match(SOLAR_BOUNDARY, /not MCS-certified/);
  assert.match(SOLAR_BOUNDARY, /07999 899304/);
  assert.match(SOLAR_KB, /31 March 2027/);
  assert.match(SOLAR_KB, /HMRC guidance says 5% applies from 1 April 2027/);
  assert.match(SOLAR_KB, /up to £15,000 for solar panels/);
  assert.match(SOLAR_KB, /up to £15,000 for an electrical storage battery/);
  assert.match(SOLAR_KB, /800 W or less/);
  assert.match(SOLAR_KB, /27 August 2026/);
  assert.match(SOLAR_KB, /MCS 042/);
  assert.match(page, /vat-on-energy-saving-materials-and-heating-equipment-notice-7086/);
  assert.match(page, /Generic illustration\. Not a specific brand\./);
  assert.match(page, /images\/solar-kit\/solar-panel-black\.webp/);
  assert.match(page, /images\/solar-kit\/ev-charger-cable\.webp/);
  assert.doesNotMatch(page, /hoodie-blank|joggers-blank|leggings-blank|sports-bra-blank/);
  assert.equal(turn.system.includes('AIza'), false);
});

test('cited solar sources are the checked public pages', () => {
  const hrefs = SOLAR_SOURCES.map((source) => source.href);
  for (const href of [
    'https://www.gov.uk/guidance/vat-on-energy-saving-materials-and-heating-equipment-notice-7086',
    'https://www.gov.uk/government/news/warm-homes-loan-scheme-factsheet',
    'https://mcscertified.com/mcs-launches-four-week-consultation-on-new-battery-storage-product-standard/',
    'https://www.ofgem.gov.uk/environmental-and-social-schemes/smart-export-guarantee-seg',
    'https://mcscertified.com/mcs-standards/',
    'https://www.ena-eng.org/ena-docs/',
    'https://www.gov.uk/government/publications/electrical-safety-approved-document-p',
  ]) assert.ok(hrefs.includes(href), href);
});

test('the solar function uses the Arron chain, limits, and crisis first', () => {
  const crisisAt = fn.indexOf('prepareSolarTurn');
  const limitAt = fn.indexOf('allow("ai"');
  const chainAt = fn.indexOf('runChain(');
  assert.ok(crisisAt > 0 && crisisAt < limitAt && limitAt < chainAt);
  assert.match(fn, /path: "\/api\/solar"/);
  assert.match(fn, /SOLAR_BOUNDARY/);
  assert.doesNotMatch(fn, /GEMINI_API_KEY\s*=\s*["']/);
  const clientPath = page.match(/<script\b[^>]*\bsrc="(\/js\/solar-assistant[^"/]*\.js)"[^>]*>/i)?.[1];
  assert.ok(clientPath, 'the page loads its solar chat client');
  const client = readFileSync(new URL('..' + clientPath, import.meta.url), 'utf8');
  assert.match(client, /fetch\(["']\/api\/solar["']/);
  assert.doesNotMatch(page, /fetch\('\/api\/arron'/);
  assert.match(lab, /solar-ai-ask/);
  assert.match(lab, /solar-ai-diy/);
  assert.match(lab, /solar-ai-crisis/);
});

test('chat remains usable without device storage; Escape restores focus and one question sends once', async () => {
  const {runInNewContext} = await import('node:vm');
  const {setImmediate: tick} = await import('node:timers/promises');
  const elements = new Map(), requests = [];
  let focused;
  function element(id) {
    if (!elements.has(id)) {
      const events = {};
      elements.set(id, {style:{}, value:'', children:[], attrs:{},
        setAttribute(key,value){this.attrs[key]=value;}, focus(){focused=id;},
        addEventListener(key,fn){events[key]=fn;}, click(){events.click?.();},
        key(key){events.keydown?.({key,preventDefault(){}});}, appendChild(el){this.children.push(el);}
      });
    }
    return elements.get(id);
  }
  const path = page.match(/<script\b[^>]*\bsrc="(\/js\/solar-assistant[^"/]*\.js)"[^>]*>/i)[1];
  const document = {getElementById:element, createElement:()=>element(Symbol()),
    querySelector:q=>q==='[data-solar-send]'?element('send'):null};
  const denied = () => { throw Error('Storage unavailable'); };
  const fetch = async (url,opts) => { requests.push([url,opts]); return {ok:true,json:async()=>({reply:'Test reply'})}; };
  runInNewContext(readFileSync(new URL('..'+path,import.meta.url),'utf8'),{document,window:{},localStorage:{getItem:denied,setItem:denied},fetch,AbortController,URLSearchParams,setTimeout,clearTimeout});
  const panel=element('ai-chat-panel'), toggle=element('ai-chat-toggle'), input=element('ai-chat-input');
  panel.style.display='none'; toggle.click();
  assert.equal(toggle.attrs['aria-expanded'],'true'); assert.equal(focused,'ai-lead-name');
  element('ai-lead-name').value='Example'; element('ai-lead-phone').value='07700900000';
  element('ai-lead-submit').click(); input.value='A sample question'; input.key('Enter'); element('send').click();
  panel.key('Escape'); await tick();
  assert.deepEqual(requests.map(([url])=>url), ['/','/api/solar']);
  assert.deepEqual(JSON.parse(requests[1][1].body),{message:'A sample question'});
  assert.equal(element('ai-chat-messages').children.at(-1).textContent,'Test reply');
  assert.equal(toggle.attrs['aria-expanded'],'false'); assert.equal(focused,'ai-chat-toggle');
});
