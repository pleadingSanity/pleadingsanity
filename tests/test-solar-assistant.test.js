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
  assert.equal(turn.system.includes('AIza'), false);
});

test('cited solar sources are the checked public pages', () => {
  const hrefs = SOLAR_SOURCES.map((source) => source.href);
  for (const href of [
    'https://www.gov.uk/guidance/vat-on-energy-saving-materials-and-heating-equipment-notice-7086',
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
  assert.match(page, /\/js\/solar-assistant\.js/);
  assert.doesNotMatch(page, /fetch\('\/api\/arron'/);
  assert.match(lab, /solar-ai-ask/);
  assert.match(lab, /solar-ai-diy/);
  assert.match(lab, /solar-ai-crisis/);
});
