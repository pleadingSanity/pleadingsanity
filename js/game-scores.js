import { api, esc, loadMe } from '/js/auth.js';
import { progressStatus, progressConflicts, resolveProgressConflict } from '/js/progress.js';
const names = {
  device: 'Progress stays on this device. Sign in to sync it to your profile.',
  syncing: 'Saving progress to your account…', synced: 'Progress saved to your account.',
  pending: 'Account save pending. Keep this device’s copy and reconnect to retry.',
  'storage-unavailable': 'Device storage is unavailable. Progress may be lost when you close this page.'
};
function paintStatus() {
  document.querySelectorAll('[data-progress-status]').forEach(el => { el.textContent = names[progressStatus()] || names.pending; });
  let conflictUI = document.querySelector('[data-save-conflicts]');
  const games = progressConflicts();
  if (!conflictUI && games.length) {
    conflictUI = document.createElement('section'); conflictUI.dataset.saveConflicts = '';
    conflictUI.className = 'scoreboard'; conflictUI.id = 'save-conflicts';
    (document.querySelector('main') || document.body).appendChild(conflictUI);
    conflictUI.addEventListener('click', async e => {
      const button = e.target.closest('[data-conflict-choice]'); if (!button) return;
      conflictUI.querySelectorAll('button').forEach(b => { b.disabled = true; });
      try { await resolveProgressConflict(button.dataset.game, button.dataset.conflictChoice); }
      catch { conflictUI.querySelector('[role="status"]').textContent = 'Could not reach your account. Both copies are kept for now.'; }
      finally { paintStatus(); }
    });
  }
  if (conflictUI) {
    conflictUI.hidden = !games.length;
    conflictUI.innerHTML = `<h2>Choose which save to keep</h2><p role="status">These saves changed on two devices. Both copies are kept until you choose. Choosing replaces the other version for that game.</p>${games.map(game => `<p>${esc(window.PSGames?.game(game)?.title || game)}:</p><div class="btn-row"><button type="button" data-game="${esc(game)}" data-conflict-choice="device">Keep this device’s save</button><button type="button" data-game="${esc(game)}" data-conflict-choice="account">Use my account’s save</button></div>`).join('')}`;
  }
}
window.addEventListener('ps-progress-status', paintStatus);
window.addEventListener('psgames:update', () => requestAnimationFrame(paintStatus));
paintStatus();

const root = document.querySelector('[data-scoreboard]');
if (root) {
  const games = window.PSGames.GAMES.filter(g => !['mood-journey', 'mind-mode', 'healing-hz'].includes(g.id));
  root.innerHTML = `<h2 id="scoreboard-title">Friendly scoreboards</h2>
    <p>Compare your best with other players. Scores are self-reported, with no prizes or verified anti-cheat ranking.</p>
    <label>Game <select id="score-game">${games.map(g => `<option value="${g.id}">${esc(g.title)}</option>`).join('')}</select></label>
    <p data-my-best></p><p data-board-status role="status"></p><ol class="score-list" data-score-list></ol>
    <form data-share-score><label>Player alias <input name="alias" minlength="3" maxlength="20" pattern="[A-Za-z][A-Za-z0-9 _-]{2,19}" autocomplete="off" placeholder="Star Explorer" required></label>
    <label class="score-consent"><input name="consent" type="checkbox" required> Publish this game’s best score, level and alias for anyone to see. Use a nickname, not your real name.</label>
    <div class="btn-row"><button class="btn" type="submit">Share my best</button><button class="btn" type="button" data-withdraw>Remove my entry</button></div></form>
    <p>Sharing is optional. Removing an entry keeps your private progress. <a href="/profile.html">My profile</a></p>`;
  const select = root.querySelector('select'), list = root.querySelector('[data-score-list]');
  const status = root.querySelector('[data-board-status]'), form = root.querySelector('form');
  const withdraw = root.querySelector('[data-withdraw]');
  let version = 0, busy = false;
  function best() {
    const stats = window.PSGames.stats(select.value);
    root.querySelector('[data-my-best]').textContent = stats.plays ? `Your best: ${stats.best} · Level ${stats.bestLevel || 1}` : 'Finish a round to share a score.';
    return stats;
  }
  async function refresh() {
    const current = ++version, game = select.value;
    best(); list.replaceChildren(); status.textContent = 'Loading scores…';
    try {
      const result = await api(`/api/scores/${game}`);
      if (current !== version) return;
      if (!Array.isArray(result.entries)) throw new Error('The scoreboard could not be loaded.');
      list.innerHTML = result.entries.map((entry, index) => `<li><span>${index + 1}. ${esc(entry.alias)}</span><strong>${esc(entry.score)} <small>· Lv ${esc(entry.level)}</small></strong></li>`).join('');
      status.textContent = result.entries.length ? 'Top 50 shared personal bests · highest score first.' : 'No shared scores yet. Be the first if you like.';
    } catch (error) { if (current === version) status.textContent = error.message || 'Scores are unavailable. Try again when connected.'; }
  }
  async function change(remove) {
    if (busy) return;
    const stats = best(), game = select.value;
    if (!remove && !stats.plays) { status.textContent = 'Finish a round first.'; return; }
    busy = true; select.disabled = true;
    form.querySelectorAll('button').forEach(b => { b.disabled = true; });
    try {
      if (!await loadMe()) { status.innerHTML = 'Please <a href="/login.html?next=%2Fgames.html%23scoreboards">sign in</a> to manage a score.'; return; }
      const answer = await api(`/api/scores/${game}`, { method: remove ? 'DELETE' : 'PUT',
        ...(!remove ? { body: { alias: form.elements.alias.value.trim(), score: stats.best, level: stats.bestLevel || 1 } } : {}) });
      if (answer.ok !== true) throw new Error('The change was not acknowledged.');
      await refresh();
      status.textContent = remove ? 'Your entry was removed. Private progress kept.' : 'Your best was shared. Other players can see your alias, score and level.';
      form.elements.consent.checked = false;
    } catch (error) { status.textContent = error.message || 'The change failed. Try again.'; }
    finally { busy = false; select.disabled = false; form.querySelectorAll('button').forEach(b => { b.disabled = false; }); }
  }
  select.addEventListener('change', refresh);
  form.addEventListener('submit', e => { e.preventDefault(); if (form.reportValidity()) change(false); });
  withdraw.addEventListener('click', () => change(true));
  window.addEventListener('psgames:update', best);
  const drawer = root.closest('details');
  function openLinkedBoard() { if (drawer && location.hash === '#scoreboards') drawer.open = true; }
  window.addEventListener('hashchange', openLinkedBoard);
  if (drawer) drawer.addEventListener('toggle', () => { if (drawer.open) refresh(); });
  openLinkedBoard();
  if (!drawer || drawer.open) refresh();
}
