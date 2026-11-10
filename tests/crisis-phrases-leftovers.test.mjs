// Follow-up to the shared crisis phrase list: journal-vault.html and js/crisis-response-system.js
// now use /js/crisis-phrases.js instead of their own inline lists (10 Nov 2026).
// Old lists frozen below, verbatim from main c693b94.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { looksLikeCrisis } from '../netlify/lib/crisis-phrases.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const JOURNAL_OLD = /\b(suicid|kill myself|killing myself|end my life|self-harm|self harm|do not want to live|don'?t want to (live|be here))\b/i; // journal-vault.html:703
const CRS_OLD = /\b(suicide|kill myself|end it all|can't go on|want to die)\b/i; // crisis-response-system.js:24 (first pattern)

const shared = (() => { const box = { window: {} }; vm.runInNewContext(read('js/crisis-phrases.js'), box); return box.window.PSCrisis; })();

// The journal's watchCrisis(), run with the page's own code and the shared browser copy.
function journalHeavy(text) {
  const html = read('journal-vault.html');
  const start = html.indexOf(' function watchCrisis()');
  const end = html.indexOf(' function usePrompt(', start);
  assert.ok(start > 0 && end > start, 'watchCrisis found');
  const banner = { hidden: true };
  vm.runInNewContext(`${html.slice(start, end)}\nwatchCrisis();`, {
    window: { PSCrisis: shared },
    document: { getElementById: (id) => (id === 'newEntryText' ? { value: text } : banner) },
  });
  return !banner.hidden;
}

// The crisis-response system's first pattern, taken from the class and run with the shared copy.
function crsFirstPatternMatches(text) {
  const src = read('js/crisis-response-system.js');
  const start = src.indexOf('this.crisisDetectionPatterns = [', src.indexOf('setupCrisisDetection()'));
  const end = src.indexOf('];', start) + 2;
  const sandbox = { window: { PSCrisis: shared } };
  const patterns = vm.runInNewContext(`(function(){ ${src.slice(start, end).replace('this.crisisDetectionPatterns', 'var p')} return p; })()`, sandbox);
  assert.equal(patterns.length, 8, 'all eight scoring patterns are still there');
  return patterns[0].test(text);
}

const OLD = ['I feel suicidal', 'I want to kill myself', 'killing myself', 'I will end my life', 'self-harm', 'self harm again',
  'I do not want to live', "I don't want to live", 'i dont want to be here', 'suicide', 'I want to end it all', "I can't go on", 'I want to die'];
const NEW = ['I don’t want to live', 'I can’t go on', 'i wanna die', 'I just want to end it', 'going to hang myself', 'I DON’T WANT TO BE HERE'];
const HARMLESS = ['I had a lovely walk with the dog today', 'Grateful for a quiet morning', 'see you at the weekend item swap', 'I will send it later', 'hang the picture'];

test('journal-vault: everything the old list caught is still caught', () => {
  for (const t of [...OLD, ...NEW, ...HARMLESS]) if (JOURNAL_OLD.test(t)) assert.ok(journalHeavy(t), t);
  for (const t of OLD) assert.ok(journalHeavy(t), t);
});

test('crisis-response-system: everything the old first pattern caught is still caught', () => {
  for (const t of [...OLD, ...NEW, ...HARMLESS]) if (CRS_OLD.test(t)) assert.ok(crsFirstPatternMatches(t), t);
});

test('both sites catch the new phrases, including curly apostrophes', () => {
  for (const t of NEW) {
    assert.ok(journalHeavy(t), `journal: ${t}`);
    assert.ok(crsFirstPatternMatches(t), `crisis-response: ${t}`);
  }
  assert.ok(!JOURNAL_OLD.test('I don’t want to live') && !CRS_OLD.test('I can’t go on'), 'these were real gaps');
});

test('both sites leave harmless sentences alone', () => {
  for (const t of HARMLESS) {
    assert.equal(journalHeavy(t), false, t);
    assert.equal(crsFirstPatternMatches(t), false, t);
  }
});

test('drift: both sites match the shared source exactly', () => {
  for (const t of [...OLD, ...NEW, ...HARMLESS]) {
    assert.equal(journalHeavy(t), looksLikeCrisis(t), `journal: ${t}`);
    assert.equal(crsFirstPatternMatches(t), looksLikeCrisis(t), `crisis-response: ${t}`);
  }
  const journal = read('journal-vault.html');
  const crs = read('js/crisis-response-system.js');
  assert.doesNotMatch(journal, /killing myself|do not want to live/i, 'journal-vault.html keeps no inline list');
  assert.doesNotMatch(crs, /kill myself|end it all|want to die/i, 'crisis-response-system.js keeps no inline list');
  assert.match(journal, /window\.PSCrisis\.test\(text\)/);
  assert.match(crs, /window\.PSCrisis\.test\(text\)/);
});

test('the shared list loads before each site that uses it', () => {
  const journal = read('journal-vault.html');
  assert.ok(journal.indexOf('<script src="/js/crisis-phrases.js"></script>') > 0);
  assert.ok(journal.indexOf('<script src="/js/crisis-phrases.js"></script>') < journal.indexOf('function watchCrisis()'));
  for (const page of ['off-grid.html', 'sanity-law.html']) {
    const html = read(page);
    const a = html.indexOf('<script src="/js/crisis-phrases.js"></script>');
    const b = html.indexOf('<script src="/js/crisis-response-system.js"></script>');
    assert.ok(a > 0 && a < b, `${page} loads crisis-phrases.js first`);
  }
});

test('journal support banner and its signposting are unchanged', () => {
  const journal = read('journal-vault.html');
  assert.match(journal, /document\.getElementById\('vault-crisis'\)\.hidden = !heavy;/);
  assert.match(journal, /id="vault-crisis"/);
});
