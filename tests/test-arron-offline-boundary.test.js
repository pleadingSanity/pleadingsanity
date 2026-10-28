import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const sources = Object.fromEntries(['companion', 'core'].map(name => [name,
  readFileSync(new URL(`../js/arron-${name}.js`, import.meta.url), 'utf8')]));
const replies = source => vm.runInNewContext(`${source.slice(source.indexOf('  const CRISIS_REPLY ='), source.indexOf('  const pick ='))}\n({ CRISIS_REPLY, OFFLINE })`);

for (const [name, source] of Object.entries(sources)) {
  test(`${name}: unsupported safety and clinical promises stay absent`, () => {
    assert.doesNotMatch(source, /whole picture|put you in a room|safe here|you['’]re safe|safe with me|not going anywhere|send you to a waiting room|keeping every word safe/i);
  });
  test(`${name}: actual crisis reply includes human help and clinical boundary`, () => {
    const { CRISIS_REPLY } = replies(source);
    for (const number of ['116 123', '85258', '111', '999']) assert.ok(CRISIS_REPLY.includes(number));
    assert.match(CRISIS_REPLY, /not a doctor or therapist/);
    assert.match(CRISIS_REPLY, /cannot replace clinical care/);
    assert.match(CRISIS_REPLY, /https:\/\/findahelpline\.com\//);
    assert.match(CRISIS_REPLY, /Are you in immediate danger right now\?/);
  });
  test(`${name}: rendered offline footer preserves tappable support routes`, () => {
    const start = source.indexOf('  const HELP_LINES =');
    const end = source.indexOf('\n  }', source.indexOf('  function helpFooter(', start)) + 4;
    const element = () => ({ children: [], append(...items) { this.children.push(...items); } });
    const footer = vm.runInNewContext(`${source.slice(start, end)}\nhelpFooter('p', 'offline')`,
      { document: { createElement: element } });
    assert.match(footer.children[0], /not a doctor or therapist; cannot replace clinical care/);
    const links = footer.children.filter(item => typeof item === 'object');
    for (const href of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111', '/support.html', 'https://findahelpline.com/']) {
      assert.ok(links.some(link => link.href === href), href);
    }
  });
}

const companion = vm.runInNewContext(`${sources.companion.slice(sources.companion.indexOf('  const MOOD_WORDS ='), sources.companion.indexOf('  // ─── STATE'))}\n({ offlineResponse, CRISIS_REPLY, OFFLINE })`, { currentMood: null });
test('web fallback: crisis takes priority over breathing and anxious keywords', () => {
  assert.equal(companion.offlineResponse('I want to die and cannot breathe'), companion.CRISIS_REPLY);
});
test('web fallback: ordinary breathing and unknown messages retain local replies', () => {
  assert.ok(companion.OFFLINE.breathe.includes(companion.offlineResponse('Can we breathe together?')));
  assert.ok(companion.OFFLINE.default.includes(companion.offlineResponse('hello')));
});
test('app fallback: cached crisis override cannot replace the reviewed reply', () => {
  const source = sources.core;
  const start = source.indexOf('      local = true;', source.indexOf('const offlineSoul') - 100);
  const end = source.indexOf("      setConn('offline');", start);
  assert.ok(start > 0 && end > start);
  const result = vm.runInNewContext(`${source.slice(start, end)}\nreply`, {
    soul: { offlineReplies: { crisis: 'unreviewed override', default: ['ordinary reply'] } },
    crisis: true, text: 'I want to die', mood: null, currentMood: null,
    OFFLINE: replies(source).OFFLINE, CRISIS_REPLY: replies(source).CRISIS_REPLY,
    pick: list => list[0]
  });
  assert.equal(result, replies(source).CRISIS_REPLY);
});
