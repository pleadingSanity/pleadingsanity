// ==============================================================
// PLEADING SANITY — PRIVATE PROGRESS SYNC
// Games keep their progress in this device's storage so they work
// offline and for guests. When someone is signed in, this module
// quietly mirrors that progress to their account (/api/progress),
// so it follows them to any device and survives signing out.
// No leaderboards, no comparison — only the member ever sees it.
//
//   import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
// ==============================================================

import { api, loadMe } from '/js/auth.js';

// game id (server) → storage key (device). Add a line to sync a new game.
export const SYNCED = {
  'brain-games': 'ps-games-profile',
  'cosmic-connect': 'ps-progress-cosmic-connect',
  'truth-tag': 'ps-progress-truth-tag',
  'mood-journey': 'ps-progress-mood-journey',
  'mind-mode': 'ps-progress-mind-mode',
};

const STAMPS = 'ps-progress-stamps'; // { game: { json, at } } — what the server last had

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
};

export function loadProgress(game, fallback = {}) {
  const key = SYNCED[game] || `ps-progress-${game}`;
  const value = read(key, null);
  return value && typeof value === 'object' ? value : structuredClone(fallback);
}

let timer = null;
export function saveProgress(game, data) {
  write(SYNCED[game] || `ps-progress-${game}`, data);
  clearTimeout(timer);
  timer = setTimeout(flush, 1500);
}

export const onProgressSync = (fn) => window.addEventListener('ps-progress-sync', (e) => fn(e.detail));

let signedIn = false;

// Push anything that changed on this device since the last sync.
async function flush() {
  if (!signedIn) return false;
  const stamps = read(STAMPS, {});
  let ok = true;
  for (const [game, key] of Object.entries(SYNCED)) {
    const raw = localStorage.getItem(key);
    if (!raw || stamps[game]?.json === raw) continue;
    try {
      const data = JSON.parse(raw);
      await api(`/api/progress/${game}`, { method: 'PUT', body: { data } });
      stamps[game] = { json: raw, at: new Date().toISOString() };
    } catch {
      ok = false;
    }
  }
  write(STAMPS, stamps);
  return ok;
}

// Pull the account's progress. Server wins unless this device has
// unsynced changes of its own, which are then pushed up instead.
async function pull() {
  const { progress } = await api('/api/progress');
  const stamps = read(STAMPS, {});
  const applied = [];
  for (const [game, key] of Object.entries(SYNCED)) {
    const remote = progress[game];
    if (!remote) continue;
    const local = localStorage.getItem(key);
    const remoteJson = JSON.stringify(remote.data);
    const localUnchanged = !local || local === stamps[game]?.json;
    if (local === remoteJson) {
      stamps[game] = { json: remoteJson, at: remote.updatedAt };
    } else if (localUnchanged || new Date(remote.updatedAt) > new Date(stamps[game]?.at || 0)) {
      localStorage.setItem(key, remoteJson);
      stamps[game] = { json: remoteJson, at: remote.updatedAt };
      applied.push(game);
    }
  }
  write(STAMPS, stamps);
  return applied;
}

// Called by auth.js before signing out: save, then leave no trace on this device.
window.psProgressFlush = async () => {
  signedIn = true; // only ever called for a signed-in member
  const ok = await flush();
  if (ok) {
    Object.values(SYNCED).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(STAMPS);
  }
  return ok;
};

(async () => {
  const me = await loadMe();
  if (!me) return;
  signedIn = true;
  try {
    const applied = await pull();
    await flush();
    if (applied.length) window.dispatchEvent(new CustomEvent('ps-progress-sync', { detail: applied }));
  } catch {
    // Offline or API asleep — progress stays safe on this device.
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('psgames:update', () => { clearTimeout(timer); timer = setTimeout(flush, 3000); });
})();
