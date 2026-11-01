// Pure game decisions. No DOM. Loaded as a classic script (window.PSBrains) and imported by tests.
const PSBrains = (function () {
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function preflop(hole) {
    if (!hole || hole.length < 2) return 0.2;
    const a = Math.max(hole[0].r, hole[1].r);
    const b = Math.min(hole[0].r, hole[1].r);
    let score = hole[0].r === hole[1].r ? 0.55 + a / 40 : 0.12 + a / 28;
    if (a - b <= 3) score += 0.06;
    if (hole[0].s === hole[1].s) score += 0.05;
    if (a >= 10 && b >= 8) score += 0.1;
    return clamp(score, 0, 0.98);
  }

  function made(cards) {
    const ranks = {};
    const suits = {};
    cards.forEach((c) => {
      ranks[c.r] = (ranks[c.r] || 0) + 1;
      suits[c.s] = (suits[c.s] || 0) + 1;
    });
    const counts = Object.values(ranks).sort((x, y) => y - x);
    const flush = Object.values(suits).some((n) => n >= 5);
    if (counts[0] >= 4) return 0.95;
    if (counts[0] === 3 && counts[1] >= 2) return 0.9;
    if (flush) return 0.82;
    if (counts[0] === 3) return 0.7;
    if (counts[0] === 2 && counts[1] === 2) return 0.62;
    if (counts[0] === 2) return 0.48;
    return 0.28;
  }

  function pokerDecide(input) {
    const hole = input.hole || [];
    const board = input.board || [];
    const toCall = Math.max(0, Number(input.toCall) || 0);
    const pot = Math.max(0, Number(input.pot) || 0);
    const stack = Math.max(0, Number(input.stack) || 0);
    const minRaise = Math.max(20, Number(input.minRaise) || 20);
    const difficulty = input.difficulty || "fair";
    const rng = input.rng || Math.random;
    const strength = board.length ? made(hole.concat(board)) : preflop(hole);
    const odds = toCall <= 0 ? 0 : toCall / (pot + toCall);
    const loosen = difficulty === "easy" ? 0.18 : difficulty === "sharp" ? -0.08 : 0;
    const edge = strength + loosen - odds;
    if (toCall === 0) {
      if (strength > (difficulty === "sharp" ? 0.62 : 0.72) && stack > minRaise && !input.raised) {
        return { kind: "raise", amount: minRaise, strength: strength };
      }
      return { kind: "call", amount: 0, strength: strength };
    }
    if (edge < (difficulty === "easy" ? -0.05 : 0.02) && difficulty !== "easy") return { kind: "fold", amount: 0, strength: strength };
    if (difficulty === "easy" && edge < -0.2) return { kind: "fold", amount: 0, strength: strength };
    if (strength > 0.75 && stack > toCall + minRaise && rng() > (difficulty === "sharp" ? 0.25 : 0.55) && !input.raised) {
      return { kind: "raise", amount: minRaise, strength: strength };
    }
    return { kind: "call", amount: 0, strength: strength };
  }

  const SHED_ORDER = ["3", "4", "5", "6", "7", "8", "9", "J", "Q", "K", "A", "2", "10"];
  function shedChoose(pool, top, difficulty) {
    const cards = (pool || []).filter(Boolean);
    const legal = [];
    const seen = {};
    cards.forEach((c) => {
      if (seen[c.r]) return;
      seen[c.r] = true;
      if (!top || top === "2" || c.r === "2" || c.r === "10" || SHED_ORDER.indexOf(c.r) >= SHED_ORDER.indexOf(top)) legal.push(c.r);
    });
    if (!legal.length) return null;
    const ordinary = legal.filter((r) => r !== "2" && r !== "10");
    const pick = difficulty === "easy"
      ? legal.slice().sort((a, b) => SHED_ORDER.indexOf(a) - SHED_ORDER.indexOf(b))[0]
      : (ordinary[0] ? ordinary.slice().sort((a, b) => SHED_ORDER.indexOf(a) - SHED_ORDER.indexOf(b))[0] : legal[0]);
    return { rank: pick, cards: cards.filter((c) => c.r === pick) };
  }

  function peaksHint(board, wasteRank) {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const val = (r) => ranks.indexOf(r);
    const playable = (board || []).filter((card) => card && card.up && !card.gone && !card.covered);
    const hit = playable.find((card) => {
      const a = val(card.r);
      const b = val(wasteRank);
      return Math.abs(a - b) === 1 || (a === 0 && b === 12) || (a === 12 && b === 0);
    });
    if (hit) return { text: "Try the " + hit.r + " " + hit.s, card: hit };
    return { text: "No open card plays. Draw if you can.", card: null };
  }

  return { pokerDecide: pokerDecide, shedChoose: shedChoose, peaksHint: peaksHint };
})();

if (typeof globalThis !== "undefined") globalThis.PSBrains = PSBrains;
