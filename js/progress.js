// ==============================================================
// PLEADING SANITY — PRIVATE PROGRESS SYNC
// Games keep their progress in this device's storage so they work
// offline and for guests. When someone is signed in, this module
// quietly mirrors that progress to their account (/api/progress),
// so it follows them to any device and survives signing out.
// Private saves stay private; score sharing is a separate, explicit action.
//
//   import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
// ==============================================================

import { api, loadMe } from '/js/auth.js';
import { mergeProgress } from '/js/progress-merge.js';

// game id (server) → storage key (device). Add a line to sync a new game.
export const SYNCED = {
  'stardust-campaign': 'ps-progress-stardust-campaign',
  'brain-games': 'ps-games-profile',
  'legacy-focus': 'cosmicFocus',
  'legacy-nebula': 'numberNebula',
  'legacy-galaxy': 'patternGalaxy',
  'legacy-ocean': 'memoryOcean',
  'legacy-rhythm': 'rhythmResonance',
  'cosmic-connect': 'ps-progress-cosmic-connect',
  'truth-tag': 'ps-progress-truth-tag',
  'mood-journey': 'ps-progress-mood-journey',
  'mind-mode': 'ps-progress-mind-mode',
  // Solitaire + Night Table levels and play chips kept by /js/guest-progress.js — adopted on sign-in.
  'guest-progress': 'ps-guest-progress',
};

const STAMPS = 'ps-progress-stamps';
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
const raw = key => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { status('storage-unavailable'); return false; } };
let signedIn = false, timer, inFlight;
let state = 'device';
const conflicts = new Set();
export function progressConflicts() { return [...conflicts]; }
export function progressStatus() { return state; }
function status(value) { state = value; window.dispatchEvent(new CustomEvent('ps-progress-status', { detail: value })); }
function notify(games) { if (games.length) window.dispatchEvent(new CustomEvent('ps-progress-sync', { detail: games })); }
export const onProgressSync = fn => window.addEventListener('ps-progress-sync', e => fn(e.detail));
export function loadProgress(game, fallback = {}) {
  const data = read(SYNCED[game] || `ps-progress-${game}`, null);
  return data && typeof data === 'object' ? data : structuredClone(fallback);
}
function schedule() { clearTimeout(timer); timer = setTimeout(flush, 1500); }
export function saveProgress(game, data) { write(SYNCED[game] || `ps-progress-${game}`, data); schedule(); }

async function push() {
  if (!signedIn) return true;
  const stamps = read(STAMPS, {});
  let ok = true;
  const applied = [];
  status('syncing');
  for (const [game, key] of Object.entries(SYNCED)) {
    let value = raw(key);
    if (!value || stamps[game]?.json === value) continue;
    try {
      let answer;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          answer = await api(`/api/progress/${game}`, { method: 'PUT', body: {
            data: JSON.parse(value), expectedAt: stamps[game]?.at || null
          } });
          if (answer.ok !== true || !answer.updatedAt) throw new Error('Save was not acknowledged');
          break;
        } catch (error) {
          if (error.status !== 409 || !error.data?.current) throw error;
          const current = error.data.current;
          const merged = mergeProgress(game, current.data, JSON.parse(raw(key) || value));
          if (!merged) { conflicts.add(game); throw new Error('Conflicting save kept on this device'); }
          // A failed local write must never be called a successful sync.
          if (!write(key, merged)) throw new Error('Storage unavailable');
          stamps[game] = { json: JSON.stringify(current.data), at: current.updatedAt };
          value = JSON.stringify(merged);
          applied.push(game);
        }
      }
      if (!answer) throw new Error('Save conflict');
      stamps[game] = { json: value, at: answer.updatedAt };
      conflicts.delete(game);
    } catch { ok = false; }
  }
  if (!write(STAMPS, stamps)) ok = false;
  notify(applied);
  status(ok ? 'synced' : 'pending');
  return ok;
}
export async function flush() {
  if (inFlight) { await inFlight; return flush(); }
  inFlight = push();
  try { return await inFlight; } finally { inFlight = null; }
}
async function pull() {
  const result = await api('/api/progress');
  if (!result.progress || typeof result.progress !== 'object') throw new Error('Progress unavailable');
  const stamps = read(STAMPS, {}), applied = [];
  for (const [game, key] of Object.entries(SYNCED)) {
    const remote = result.progress[game];
    if (!remote) continue;
    const local = raw(key), remoteJson = JSON.stringify(remote.data);
    let data = remote.data;
    if (local && local !== stamps[game]?.json && local !== remoteJson) {
      data = mergeProgress(game, remote.data, JSON.parse(local));
      if (!data) { conflicts.add(game); continue; } // Preserve both saves until the member chooses.
    }
    if (JSON.stringify(data) !== local) {
      if (!write(key, data)) throw new Error('Storage unavailable');
      applied.push(game);
    }
    stamps[game] = { json: remoteJson, at: remote.updatedAt };
  }
  if (!write(STAMPS, stamps)) throw new Error('Storage unavailable');
  notify(applied);
}
// Explicit conflict choice, used by the games/profile UI. Re-read the account
// first; another device may have saved since the conflict was displayed.
export async function resolveProgressConflict(game, choice) {
  if (!conflicts.has(game) || !SYNCED[game] || !['device', 'account'].includes(choice)) return false;
  if (inFlight) await inFlight;
  const result = await api('/api/progress');
  const remote = result.progress?.[game];
  if (!remote) return false;
  const stamps = read(STAMPS, {});
  if (choice === 'account' && !write(SYNCED[game], remote.data)) return false;
  stamps[game] = { json: JSON.stringify(remote.data), at: remote.updatedAt };
  if (!write(STAMPS, stamps)) return false;
  conflicts.delete(game);
  if (choice === 'account') notify([game]);
  return flush();
}
// Auth must not erase local progress if any upload failed, or new progress arrived during upload.
window.psProgressFlush = async () => {
  await ready;
  if (!signedIn) return false;
  if (!await flush()) return false;
  const stamps = read(STAMPS, {});
  if (Object.entries(SYNCED).some(([game, key]) => raw(key) && raw(key) !== stamps[game]?.json)) return false;
  Object.values(SYNCED).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(STAMPS);
  return true;
};
window.addEventListener('psgames:update', schedule);
window.addEventListener('ps-progress-storage-error', () => status('storage-unavailable'));
window.addEventListener('psguest:update', schedule);
window.addEventListener('online', () => { if (signedIn) flush(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
const ready = (async () => {
  try {
    const me = await loadMe();
    if (!me) return;
    signedIn = true;
    await pull();
    await flush();
  } catch { status('pending'); }
})();
