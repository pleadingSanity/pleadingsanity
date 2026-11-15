// Pure merge rules shared by the browser and regression tests. No private data leaves this module.
const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
const object = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
export function mergeBrain(a, b) {
  a = object(a); b = object(b);
  const out = { ...a, ...b, games: {}, badges: { ...object(a.badges), ...object(b.badges) } };
  const ax = object(a.xpLedger), bx = object(b.xpLedger);
  const sources = { ...object(ax.sources) };
  for (const [id, n] of Object.entries(object(bx.sources))) sources[id] = Math.max(count(sources[id]), count(n));
  const base = Math.max(count(ax.base ?? a.xp), count(bx.base ?? b.xp));
  out.xpLedger = { base, sources };
  out.xp = base + Object.values(sources).reduce((sum, n) => sum + count(n), 0);
  for (const id of new Set([...Object.keys(object(a.games)), ...Object.keys(object(b.games))])) {
    const x = object(a.games?.[id]), y = object(b.games?.[id]);
    out.games[id] = { ...x, ...y };
    for (const key of ['best', 'bestLevel', 'plays', 'last']) out.games[id][key] = Math.max(count(x[key]), count(y[key]));
  }
  // Reward balances are not cash. Preserve the larger balance; never combine duplicate rewards.
  out.starlight = Math.max(count(a.starlight), count(b.starlight));
  const playerLevel = Math.floor((1 + Math.sqrt(1 + 4 * out.xp / 50)) / 2);
  out.starlight = Math.max(out.starlight, (playerLevel - 1) * 5 + Object.keys(out.badges).length * 2);
  for (const key of ['streak', 'daily', 'weekly']) {
    const field = key === 'streak' ? 'last' : key === 'daily' ? 'date' : 'key';
    out[key] = String(a[key]?.[field] || '') > String(b[key]?.[field] || '') ? a[key] : b[key];
    if (a[key]?.[field] === b[key]?.[field] && a[key] && b[key]) {
      out[key] = key === 'streak' ? { ...b[key], count: Math.max(count(a[key].count), count(b[key].count)) }
        : { ...b[key], done: !!(a[key].done || b[key].done) };
    }
  }
  return out;
}

export function mergeProgress(game, remote, local) {
  if (game === 'stardust-campaign') return { completed: Math.max(count(remote.completed), count(local.completed)) };
  if (game === 'brain-games') return mergeBrain(remote, local);
  if (game === 'guest-progress') {
    const levels = { ...object(remote.levels) };
    for (const [id, n] of Object.entries(object(local.levels))) levels[id] = Math.max(count(levels[id]), count(n));
    return { ...remote, ...local, levels };
  }
  if (game.startsWith('legacy-')) {
    const winner = count(remote.lvl) > count(local.lvl) ? remote : local;
    return { ...winner, lvl: Math.max(count(remote.lvl), count(local.lvl)), ts: Math.max(count(remote.ts), count(local.ts)) };
  }
  // These saves contain a current board or personal reflection. Do not manufacture a hybrid.
  return null;
}
