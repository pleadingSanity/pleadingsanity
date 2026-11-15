// One shared crisis phrase list (netlify/lib/crisis-phrases.js), 10 Nov 2026.
// 1) Nothing the six old lists caught stops being caught (old lists frozen below, verbatim from main c693b94).
// 2) New phrases are caught, including curly apostrophes.
// 3) Harmless sentences are not.
// 4) Drift: the browser copy is generated from the source, and no call site keeps its own list.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CRISIS_PHRASES, CRISIS_WORDS, looksLikeCrisis, normaliseCrisisText } from '../netlify/lib/crisis-phrases.js';
import { renderBrowserCopy } from '../scripts/build-crisis-phrases.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

// ── The six lists this replaced, frozen exactly as they were. ──
const SERVER = /\b(suicid\w*|kill(?:ing)? (?:my ?self|me)|end (?:it all|my life)|take my own life|want(?:ed)? to die|wish i (?:was|were) dead|don'?t want to (?:be here|live|wake up|exist)|can'?t (?:go on|do this any ?more)|self[- ]?harm\w*|hurt(?:ing)? my ?self|cut(?:ting)? my ?self|overdos\w*|not safe|no reason to live|no point (?:in )?(?:living|going on)|better off without me)\b/i; // arron.mts:96 and arron-tools.ts:85 (identical)
const BROWSER = /suicid|kill(ing)? my ?self|end (it all|my life)|take my (own )?life|want(ed)? to die|wanna die|wish i (was|were) dead|don'?t want to (be here|live|wake up|exist)|can'?t (go on|do this any ?more)|self[- ]?harm|hurt(ing)? my ?self|cut(ting)? my ?self|overdos|no reason to live|no point (in )?(living|going on)|better off without me/i; // arron-core.js:80 and arron-companion.js:108 (identical)
const SOLAR = /\b(suicid\w*|kill(?:ing)? (?:my ?self|me)|end (?:it all|my life)|take my own life|want(?:ed)? to die|wish i (?:was|were) dead|(?:don'?t|do not) want to (?:be here|live|wake up|exist)|can'?t (?:go on|do this any ?more)|self[- ]?harm\w*|hurt(?:ing)? my ?self|cut(?:ting)? my ?self|overdos\w*|not safe|no reason to live|no point (?:in )?(?:living|going on)|better off without me)\b/i; // solar-knowledge.ts:21
const SOCIAL = [
  /\bsuicid/i, /\bkill(ing)?\s+my\s*self\b/i, /\bend(ing)?\s+(it\s+all|my\s+life|things)\b/i, /\bwant(ed)?\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+here|wake\s+up)\b/i, /\bself[\s-]?harm/i, /\bcut(ting)?\s+my\s*self\b/i, /\bhurt(ing)?\s+my\s*self\b/i,
  /\boverdos/i, /\bno\s+reason\s+to\s+live\b/i, /\bbetter\s+off\s+(dead|without\s+me)\b/i, /\btake\s+my\s+(own\s+)?life\b/i,
]; // social.ts:271-284
const OLD = [
  ['arron.mts / arron-tools.ts', (t) => SERVER.test(t)],
  ['arron-core.js / arron-companion.js', (t) => BROWSER.test(t)],
  ['solar-knowledge.ts', (t) => SOLAR.test(t)],
  ['social.ts', (t) => SOCIAL.some((re) => re.test(t))],
];

// Every phrase any old list knew, in several spellings, cases and spacings.
const OLD_CORPUS = [
  'I feel suicidal', 'suicide', 'Having SUICIDAL thoughts', 'I want to kill myself', 'thinking of killing myself', 'kill my self',
  'I could kill me', 'killing me softly', 'I want to end it all', 'I will end my life', 'ending it all', 'ending my life tonight',
  'thinking about ending things', 'I want to take my own life', 'take my life', 'I want to die', 'I wanted to die', 'wanna die',
  'I wish I was dead', 'wish i were dead', "I don't want to be here", 'i dont want to live', "don't want to wake up", "I don't want to exist",
  'I do not want to be here', 'do not want to wake up', "I can't go on", 'cant do this anymore', "can't do this any more",
  'self harm', 'self-harm', 'selfharm', 'self harming again', 'self\nharm', 'hurt myself', 'hurting my self', 'cut myself', 'cutting myself',
  'overdose', 'I overdosed', 'I am not safe', 'no reason to live', 'no point living', 'no point in going on', 'everyone is better off without me',
  'they would be better off dead', 'I want   to    die', 'kill\nmyself', 'I WANT TO END MY LIFE', 'want to dieee', 'iwant to die',
];
const NEW_CORPUS = [
  'I don’t want to live', 'I don‘t want to live', 'I donʼt want to live', 'I can’t go on', 'I can’t do this any more', 'I don’t want to be here',
  'i wanna die', 'I just want to end it', 'I want to end it all', 'thinking of ending it', 'I am going to hang myself', 'hanging my self',
  'I do not want to live', "I don't want to live", "I can't go on", 'END IT', 'I want to\n\nend   it.',
];
const HARMLESS = [
  'I had a nice cup of tea today', 'hi Arron', 'what is Aura Hz?', 'see you at the weekend item swap', 'I will send it tomorrow',
  'please blend it smoothly', 'my legs are dead tired', 'I love this song', 'can we go online later', 'I want to change myself for the better',
  'the weekend is here', 'that was a killer workout', 'How much do solar panels cost?', 'hang the picture on the wall',
];

test('every phrase any of the six old lists caught is still caught', () => {
  let oldHits = 0;
  for (const text of [...OLD_CORPUS, ...NEW_CORPUS, ...HARMLESS]) {
    for (const [name, oldMatch] of OLD) {
      if (oldMatch(text)) {
        oldHits++;
        assert.ok(looksLikeCrisis(text), `"${text}" was caught by ${name} but not by the shared list`);
      }
    }
  }
  assert.ok(oldHits > 100, `corpus exercised ${oldHits} old matches`);
  for (const text of OLD_CORPUS) assert.ok(OLD.some(([, m]) => m(text)) || looksLikeCrisis(text), text);
});

test('the old corpus is fully caught by the shared list', () => {
  for (const text of OLD_CORPUS) assert.ok(looksLikeCrisis(text), text);
});

test('new phrases are caught, including curly apostrophes', () => {
  for (const text of NEW_CORPUS) assert.ok(looksLikeCrisis(text), text);
  // These were the reported gaps: no old list caught them.
  for (const text of ['I don’t want to live', 'I can’t go on', 'I just want to end it', 'I am going to hang myself']) {
    assert.ok(!OLD.some(([, m]) => m(text)), `expected an old gap: ${text}`);
  }
});

test('harmless sentences are not flagged', () => {
  for (const text of HARMLESS) assert.equal(looksLikeCrisis(text), false, text);
});

test('normalising lowercases, straightens curly quotes and collapses whitespace', () => {
  assert.equal(normaliseCrisisText('I  Don’t\n\tWANT'), "i don't want");
  assert.equal(normaliseCrisisText('can‘t ʼ `'), "can't ' '");
  assert.equal(normaliseCrisisText(null), '');
  assert.equal(CRISIS_WORDS.test('I don’t want to live'), true);
  assert.equal(CRISIS_WORDS.test(undefined), false);
});

test('drift: the browser copy is exactly what the generator writes', () => {
  assert.equal(read('js/crisis-phrases.js'), renderBrowserCopy(), 'run: node scripts/build-crisis-phrases.mjs');
});

test('drift: the browser copy behaves the same as the server list', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(read('js/crisis-phrases.js'), sandbox);
  const browser = sandbox.window.PSCrisis;
  assert.deepEqual([...browser.phrases], CRISIS_PHRASES);
  for (const text of [...OLD_CORPUS, ...NEW_CORPUS, ...HARMLESS]) assert.equal(browser.test(text), looksLikeCrisis(text), text);
});

test('drift: no call site keeps its own crisis list', () => {
  const sites = {
    'netlify/functions/arron.mts': /import \{ CRISIS_WORDS as SHARED_CRISIS_WORDS \} from "\.\.\/lib\/crisis-phrases\.js"/,
    'netlify/lib/arron-tools.ts': /import \{ CRISIS_WORDS as SHARED_CRISIS_WORDS \} from "\.\/crisis-phrases\.js"/,
    'netlify/lib/solar-knowledge.ts': /import \{ CRISIS_WORDS as SHARED_CRISIS_WORDS \} from "\.\/crisis-phrases\.js"/,
    'netlify/lib/social.ts': /import \{ looksLikeCrisis \} from "\.\/crisis-phrases\.js"/,
    'js/arron-core.js': /window\.PSCrisis/,
    'js/arron-companion.js': /window\.PSCrisis/,
  };
  // Fragments unique to a crisis phrase list. None may appear outside the shared source.
  const fragments = [/wish i \(/i, /no reason to live/i, /better\s*(?:\\s\+)?off/i, /want\(\?:ed\)\?|want\(ed\)\?/i, /overdos/i];
  for (const [file, uses] of Object.entries(sites)) {
    const src = read(file);
    assert.match(src, uses, `${file} must use the shared list`);
    for (const f of fragments) assert.doesNotMatch(src, f, `${file} still has its own copy (${f})`);
  }
});

test('the Arron pages load the shared list before the scripts that use it, and it is precached', () => {
  for (const [page, script] of [['arron-app.html', 'arron-core.js'], ['arron.html', 'arron-companion.js']]) {
    const html = read(page);
    const shared = html.indexOf('<script src="/js/crisis-phrases.js" defer></script>');
    const user = html.indexOf(`<script src="/js/${script}" defer></script>`);
    assert.ok(shared > 0 && shared < user, `${page} loads crisis-phrases.js before ${script}`);
  }
  assert.match(read('sw.js'), /'\/js\/crisis-phrases\.js'/);
  assert.match(read('sw-arron.js'), /'\/js\/crisis-phrases\.js'/);
});

test('crisis replies and signposting are unchanged', () => {
  const arron = read('netlify/functions/arron.mts');
  assert.match(arron, /const crisis = mood === "crisis" \|\| CRISIS_WORDS\.test\(message\)/);
  assert.match(arron, /Samaritans: 116 123\. Text SHOUT: 85258/);
  assert.match(read('netlify/lib/solar-knowledge.ts'), /return CRISIS_WORDS\.test\(String\(text \|\| ""\)\)/);
  assert.match(read('netlify/lib/arron-tools.ts'), /if \(!text \|\| !CRISIS_WORDS\.test\(text\)\) return \{ crisis: false \};/);
  assert.match(read('netlify/lib/social.ts'), /export const mentionsCrisis = \(text: string\) => looksLikeCrisis\(text\);/);
});
