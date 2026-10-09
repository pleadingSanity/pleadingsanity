// ==============================================================
// SANCTUARY NOTES
//   • Signed out: notes live in this browser only (localStorage).
//   • Signed in: notes live in the member's account (/api/notes) and
//     follow them to any device. Device notes can be moved across once.
//   • Every user field is rendered with textContent — never innerHTML.
//   • Google Keep: copy + open Keep. We never claim Keep saved anything.
// ==============================================================

import { api, currentUser, toast } from '/js/auth.js';

const LOCAL_KEY = 'ps-sanctuary-notes';
const CATEGORY_LABELS = {
  thought: '💭 Thought',
  gratitude: '🙏 Gratitude',
  goal: '🎯 Goal',
  idea: '💡 Idea',
  reminder: '⏰ Reminder',
  win: '🏆 Small win',
};

const $ = (id) => document.getElementById(id);
const els = {
  form: $('sn-form'),
  editId: $('sn-edit-id'),
  title: $('sn-title'),
  content: $('sn-content'),
  contentErr: $('sn-content-err'),
  category: $('sn-category'),
  save: $('sn-save'),
  cancel: $('sn-cancel'),
  list: $('sn-list'),
  empty: $('sn-empty'),
  count: $('sn-count'),
  search: $('sn-search'),
  sync: $('sn-sync'),
};

let mode = 'local'; // 'local' | 'account'
let notes = [];

// ─── DEVICE STORAGE ───
function readLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => n && typeof n.content === 'string') : [];
  } catch {
    return [];
  }
}

// Returns false (and tells the person) when the browser refuses to store.
function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    const full = err && (err.name === 'QuotaExceededError' || err.code === 22);
    toast(full
      ? 'This device is out of note space. Delete a few notes, or sign in to keep them in your account.'
      : "This browser won't let us save notes (private mode?). Sign in to keep them in your account.", 6000);
    return false;
  }
}

const localId = () => 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ─── STORE — one interface, two homes ───
const store = {
  async list() {
    if (mode === 'account') return (await api('/api/notes')).notes;
    return readLocal().sort((a, b) => (b.pinned - a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
  },
  async create(note) {
    if (mode === 'account') return (await api('/api/notes', { method: 'POST', body: note })).note;
    const now = new Date().toISOString();
    const saved = { id: localId(), ...note, pinned: false, createdAt: now, updatedAt: now };
    const list = readLocal();
    list.push(saved);
    if (!writeLocal(list)) throw new Error('not-saved');
    return saved;
  },
  async update(id, changes) {
    if (mode === 'account') return (await api('/api/notes/' + encodeURIComponent(id), { method: 'PUT', body: changes })).note;
    const list = readLocal();
    const i = list.findIndex((n) => n.id === id);
    if (i < 0) throw new Error('That note is no longer on this device.');
    list[i] = { ...list[i], ...changes, updatedAt: new Date().toISOString() };
    if (!writeLocal(list)) throw new Error('not-saved');
    return list[i];
  },
  async remove(id) {
    if (mode === 'account') return api('/api/notes/' + encodeURIComponent(id), { method: 'DELETE' });
    const list = readLocal();
    const next = list.filter((n) => n.id !== id);
    if (next.length === list.length) throw new Error('That note is no longer on this device.');
    if (!writeLocal(next)) throw new Error('not-saved');
  },
};

const failMessage = (err) => (err && err.message && err.message !== 'not-saved' ? err.message : 'Your note was not saved.');

// ─── RENDER (textContent only) ───
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, ariaLabel, onClick, extra = '') {
  const b = el('button', 'sn-btn ' + extra, label);
  b.type = 'button';
  b.setAttribute('aria-label', ariaLabel);
  b.addEventListener('click', onClick);
  return b;
}

const when = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function render() {
  const q = els.search.value.trim().toLowerCase();
  const shown = q
    ? notes.filter((n) => (String(n.title) + ' ' + String(n.content) + ' ' + String(n.category)).toLowerCase().includes(q))
    : notes;

  els.list.replaceChildren(...shown.map((n) => {
    const name = n.title || 'Untitled note';
    const li = el('li', 'sn-note' + (n.pinned ? ' is-pinned' : ''));
    li.dataset.cat = CATEGORY_LABELS[n.category] ? n.category : 'thought';
    if (n.title) li.append(el('h3', '', n.title));
    li.append(el('p', 'sn-body', n.content));
    li.append(el('p', 'sn-meta', [n.pinned ? '📌 Pinned' : '', CATEGORY_LABELS[n.category] || CATEGORY_LABELS.thought, when(n.updatedAt)].filter(Boolean).join(' · ')));

    const actions = el('div', 'sn-actions');
    actions.append(
      button(n.pinned ? 'Unpin' : 'Pin', (n.pinned ? 'Unpin note: ' : 'Pin note: ') + name, () => togglePin(n)),
      button('Edit', 'Edit note: ' + name, () => startEdit(n)),
      button('Copy for Keep', 'Copy note to clipboard and open Google Keep: ' + name, () => sendToKeep(n)),
      button('Delete', 'Delete note: ' + name, () => removeNote(n), 'sn-danger'),
    );
    li.append(actions);
    return li;
  }));

  els.empty.hidden = shown.length > 0;
  els.empty.textContent = q && notes.length ? 'No notes match that search.' : 'No notes yet. One line is enough.';
  els.count.textContent = notes.length ? '(' + notes.length + ')' : '';
}

async function refresh() {
  try {
    notes = await store.list();
  } catch (err) {
    toast(failMessage(err));
  }
  render();
}

// ─── FORM ───
function resetForm() {
  els.form.reset();
  els.editId.value = '';
  els.save.textContent = 'Save note';
  els.cancel.hidden = true;
  els.content.removeAttribute('aria-invalid');
  els.contentErr.hidden = true;
}

function startEdit(n) {
  els.editId.value = String(n.id);
  els.title.value = n.title || '';
  els.content.value = n.content || '';
  els.category.value = CATEGORY_LABELS[n.category] ? n.category : 'thought';
  els.save.textContent = 'Save changes';
  els.cancel.hidden = false;
  els.form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  els.content.focus();
}

async function onSubmit(event) {
  event.preventDefault();
  const note = {
    title: (els.title?.value || '').trim().slice(0, 120),
    content: (els.content?.value || '').trim().slice(0, 10000),
    category: CATEGORY_LABELS[els.category?.value] ? els.category.value : 'thought',
  };
  if (!note.content) {
    els.content.setAttribute('aria-invalid', 'true');
    els.contentErr.hidden = false;
    els.content.focus();
    return;
  }
  const editing = els.editId.value;
  els.save.disabled = true;
  try {
    if (editing) await store.update(mode === 'account' ? Number(editing) : editing, note);
    else await store.create(note);
    toast(editing ? 'Note updated ✓' : mode === 'account' ? 'Note saved to your account ✓' : 'Note saved on this device ✓');
    resetForm();
    await refresh();
  } catch (err) {
    toast(failMessage(err));
  } finally {
    els.save.disabled = false;
  }
}

async function togglePin(n) {
  try {
    await store.update(n.id, { pinned: !n.pinned });
    await refresh();
  } catch (err) {
    toast(failMessage(err));
  }
}

async function removeNote(n) {
  if (!confirm('Delete "' + (n.title || 'this note') + '"? This cannot be undone.')) return;
  try {
    await store.remove(n.id);
    if (els.editId.value === String(n.id)) resetForm();
    toast('Note deleted');
    await refresh();
  } catch (err) {
    toast(failMessage(err));
  }
}

// ─── GOOGLE KEEP — honest handoff ───
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* permission refused — try the old way */ }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

async function sendToKeep(n) {
  const text = (n.title ? n.title + '\n\n' : '') + n.content;
  const copied = await copyText(text);
  const tab = window.open('https://keep.google.com/', '_blank', 'noopener');
  if (copied) {
    toast(tab
      ? 'Copied ✓ Keep is open — tap "Take a note" and paste. It is not in Keep until you do.'
      : 'Copied ✓ Open keep.google.com, tap "Take a note" and paste.', 7000);
  } else {
    toast("Your browser blocked the clipboard. Select the note text, copy it, then paste it into Keep.", 7000);
  }
}

// ─── ACCOUNT / DEVICE ───
function setSync(text, link) {
  els.sync.replaceChildren(document.createTextNode(text));
  if (link) {
    els.sync.append(' ');
    const a = el('a', '', link.label);
    a.href = link.href;
    els.sync.append(a);
  }
}

function offerImport() {
  const local = readLocal();
  if (!local.length) return;
  const wrap = el('p', 'sn-sync');
  wrap.append(document.createTextNode(local.length + ' note' + (local.length === 1 ? ' is' : 's are') + ' saved only on this device. '));
  const move = button('Move them to my account', 'Move device-only notes into my account', async () => {
    move.disabled = true;
    try {
      const res = await api('/api/notes/import', { method: 'POST', body: { notes: local } });
      if (res.imported === local.length) {
        localStorage.removeItem(LOCAL_KEY);
        toast('Moved ' + res.imported + ' note' + (res.imported === 1 ? '' : 's') + ' to your account ✓');
      } else {
        toast('Moved ' + res.imported + ' of ' + local.length + '. The rest are still on this device.', 6000);
        if (res.imported > 0) writeLocal(local.slice(res.imported));
      }
      wrap.remove();
      await refresh();
    } catch (err) {
      move.disabled = false;
      toast(failMessage(err));
    }
  });
  wrap.append(move);
  els.sync.after(wrap);
}

async function init() {
  if (!els.form || !els.list || !els.content) return; // page is missing its form — do nothing
  els.form.addEventListener('submit', onSubmit);
  els.cancel.addEventListener('click', resetForm);
  els.search.addEventListener('input', render);
  els.content.addEventListener('input', () => {
    if (els.content.value.trim()) {
      els.content.removeAttribute('aria-invalid');
      els.contentErr.hidden = true;
    }
  });

  const user = await currentUser();
  if (user) {
    try {
      await api('/api/notes');
      mode = 'account';
      setSync('🔒 Synced to your account — your notes follow you to any device.');
      offerImport();
    } catch {
      setSync("📱 Couldn't reach your account just now, so notes are saving on this device.");
    }
  } else {
    setSync('📱 Saving on this device only.', { href: '/login.html?next=/notes.html', label: 'Sign in to sync across devices →' });
  }
  await refresh();
}

init();
