import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html = await readFile(new URL('../journal-vault.html', import.meta.url), 'utf8');
const source = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).find(code => code.includes('function addEntry()'));
assert.ok(source, 'Actual journal script must exist');
const note = { id: 1, timestamp: '2026-01-01T12:00:00Z', text: 'Saved fixture', source: 'Personal' };
class Element {
  value = ''; hidden = false;
  set textContent(value) { this.text = String(value); this.html = null; }
  get textContent() { return this.text || ''; }
  set innerHTML(value) { this.html = value; }
  get innerHTML() { return this.html ?? this.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  focus() {} blur() {}
}
function vault(options = {}) {
  const elements = new Map(); const el = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const stored = new Map([['journalVault', options.raw ?? JSON.stringify(options.notes ?? [note])]]);
  let printed = '';
  const context = vm.createContext({
    document: { getElementById: el, createElement: () => new Element(), addEventListener() {} },
    localStorage: {
      getItem(key) { if (options.failRead) throw new Error('<img src=x onerror=alert(1)>'); return stored.get(key) ?? null; },
      setItem(key, value) { if (options.failWrite) throw new Error('Quota exceeded'); stored.set(key, value); },
      removeItem(key) { if (options.failRemove) throw new Error('Access denied'); stored.delete(key); },
    },
    confirm: () => options.confirm !== false, alert() {},
    window: { open: () => ({ document: { write: text => { printed += text; }, close() {} }, focus() {}, print() {} }) },
    setTimeout: fn => fn(), console: { error() {}, warn() {} },
  });
  vm.runInContext(source, context);
  const run = code => vm.runInContext(code, context);
  const state = () => JSON.parse(run('JSON.stringify({allEntries,editingId})'));
  return { el, run, state, stored, printed: () => printed };
}
test('failed add retains the draft and never announces success or changes saved notes', () => {
  const v = vault({ failWrite: true }); v.run('loadVault()'); v.el('newEntryText').value = 'Unsaved draft'; v.run('addEntry()');
  assert.equal(v.el('newEntryText').value, 'Unsaved draft'); assert.deepEqual(v.state().allEntries, [note]);
  assert.deepEqual(JSON.parse(v.stored.get('journalVault')), [note]); assert.match(v.el('vault-status').textContent, /Not saved/);
});
test('failed edit keeps the prior stored text and editable draft', () => {
  const v = vault({ failWrite: true }); v.run('loadVault();editEntry(1)'); v.el('newEntryText').value = 'Revised draft'; v.run('addEntry()');
  assert.equal(v.state().editingId, 1); assert.equal(v.state().allEntries[0].text, note.text); assert.equal(v.el('newEntryText').value, 'Revised draft'); assert.match(v.el('save-btn').textContent, /Save changes/);
});
test('failed delete does not remove the visible or stored note', () => {
  const v = vault({ failWrite: true }); v.run('loadVault();deleteEntry(1)'); assert.deepEqual(v.state().allEntries, [note]); assert.match(v.el('vault-status').textContent, /Not saved/);
});
test('blocked Forget Me never clears memory, editor or reports deletion', () => {
  const v = vault({ failRemove: true }); v.run('loadVault()'); v.el('forgetWord').value = 'FORGET'; v.el('newEntryText').value = 'Keep this draft';
  v.run('forgetVault({preventDefault(){}})'); assert.deepEqual(v.state().allEntries, [note]); assert.equal(v.el('newEntryText').value, 'Keep this draft'); assert.match(v.el('vault-status').textContent, /Delete failed/); assert.ok(v.stored.has('journalVault'));
});
test('successful add, edit and delete preserve the storage format and success states', () => {
  const v = vault(); v.run('loadVault()'); v.el('newEntryText').value = 'New fixture'; v.run('addEntry()');
  assert.equal(v.state().allEntries.length, 2); assert.equal(v.el('newEntryText').value, ''); assert.match(v.el('vault-status').textContent, /^Saved on this phone/);
  v.run('editEntry(1)'); v.el('newEntryText').value = 'Edited fixture'; v.run('addEntry()');
  assert.equal(v.state().allEntries.find(n => n.id === 1).text, 'Edited fixture'); assert.match(v.el('vault-status').textContent, /^Changes saved/);
  v.run('deleteEntry(1)'); assert.equal(v.state().allEntries.length, 1); assert.deepEqual(v.state().allEntries, JSON.parse(v.stored.get('journalVault')));
});
test('unreadable storage is preserved and raw parser messages never become markup', () => {
  for (const options of [{ raw: '<img src=x onerror=alert(1)>' }, { failRead: true }, { raw: '{"text":"wrong shape"}' }]) {
    const v = vault(options), raw = v.stored.get('journalVault'); v.run('loadVault()');
    assert.equal(v.stored.get('journalVault'), raw); assert.match(v.el('vault-content').innerHTML, /Nothing has been deleted/); assert.ok(!v.el('vault-content').innerHTML.includes('<img'));
  }
});
test('hostile stored IDs and print metadata are escaped in HTML contexts', () => {
  const v = vault({ notes: [{ ...note, id: '"><img src=x onerror=alert(1)>', text: '<script>alert(1)</script>', source: '<img src=x>' }] });
  v.run('loadVault()'); const rendered = v.el('vault-content').innerHTML;
  assert.ok(rendered.includes('&quot;')); assert.ok(!rendered.includes('<img')); assert.ok(!rendered.includes('<script>'));
  v.run('printVault()'); assert.ok(!v.printed().includes('<img')); assert.ok(!v.printed().includes('<script>'));
});
test('reset requires confirmation and blocked removal keeps the original data', () => {
  const cancelled = vault({ raw: 'unreadable', confirm: false }); cancelled.run('resetUnreadableVault()'); assert.equal(cancelled.stored.get('journalVault'), 'unreadable');
  const blocked = vault({ raw: 'unreadable', failRemove: true }); blocked.run('resetUnreadableVault()'); assert.equal(blocked.stored.get('journalVault'), 'unreadable'); assert.match(blocked.el('vault-status').textContent, /Reset failed/);
});
