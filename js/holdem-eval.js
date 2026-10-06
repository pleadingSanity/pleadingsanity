// Hold'em hand judge. Cards are {r:0-12, s:0-3}. Ace is 12.
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["spades", "hearts", "diamonds", "clubs"];
const NAMES = ["High card", "Pair", "Two pair", "Three", "Straight", "Flush", "Full house", "Four", "Straight flush"];

function byCount(cards) {
  const count = {};
  cards.forEach((c) => { count[c.r] = (count[c.r] || 0) + 1; });
  return Object.entries(count).map(([r, n]) => ({ r: Number(r), n })).sort((a, b) => b.n - a.n || b.r - a.r);
}

function straightHigh(ranks) {
  const set = [...new Set(ranks)].sort((a, b) => a - b);
  if (set.includes(12)) set.unshift(-1);
  let run = 1;
  let best = -1;
  for (let i = 1; i < set.length; i++) {
    if (set[i] === set[i - 1] + 1) {
      run += 1;
      if (run >= 5) best = set[i];
    } else if (set[i] !== set[i - 1]) run = 1;
  }
  return best;
}

function judge(cards) {
  const groups = byCount(cards);
  const flushSuit = [0, 1, 2, 3].find((s) => cards.filter((c) => c.s === s).length >= 5);
  const flush = flushSuit === undefined ? null : cards.filter((c) => c.s === flushSuit);
  const straight = straightHigh(cards.map((c) => c.r));
  const flushStraight = flush ? straightHigh(flush.map((c) => c.r)) : -1;
  if (flushStraight >= 0) return [8, flushStraight];
  if (groups[0].n === 4) {
    const kick = groups.find((g) => g.r !== groups[0].r);
    return [7, groups[0].r, kick ? kick.r : 0];
  }
  if (groups[0].n === 3 && groups[1] && groups[1].n >= 2) return [6, groups[0].r, groups[1].r];
  if (flush) return [5, ...flush.map((c) => c.r).sort((a, b) => b - a).slice(0, 5)];
  if (straight >= 0) return [4, straight];
  if (groups[0].n === 3) return [3, groups[0].r, ...groups.filter((g) => g.n === 1).map((g) => g.r).slice(0, 2)];
  if (groups[0].n === 2 && groups[1] && groups[1].n === 2) return [2, groups[0].r, groups[1].r, ...groups.filter((g) => g.n === 1).map((g) => g.r).slice(0, 1)];
  if (groups[0].n === 2) return [1, groups[0].r, ...groups.filter((g) => g.n === 1).map((g) => g.r).slice(0, 3)];
  return [0, ...groups.map((g) => g.r).slice(0, 5)];
}

function better(a, b) {
  const x = judge(a);
  const y = judge(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  }
  return 0;
}

function label(cards) {
  return NAMES[judge(cards)[0]];
}

export { RANKS, SUITS, NAMES, judge, better, label };
