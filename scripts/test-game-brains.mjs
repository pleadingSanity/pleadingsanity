import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

const context = createContext({ globalThis: {} });
context.globalThis = context;
runInContext(readFileSync(new URL("../js/game-brains.js", import.meta.url), "utf8"), context);
const { pokerDecide, shedChoose, peaksHint } = context.PSBrains;
const card = (r, s) => ({ r, s });

test("sharp poker folds a weak hand facing a big bet", () => {
  const weak = pokerDecide({ hole: [card(0, 0), card(2, 1)], board: [], pot: 100, toCall: 80, stack: 500, difficulty: "sharp", rng: () => 0.9 });
  assert.equal(weak.kind, "fold");
});

test("poker raises a pair of aces when checked to", () => {
  const strong = pokerDecide({ hole: [card(12, 0), card(12, 1)], board: [], pot: 40, toCall: 0, stack: 500, minRaise: 20, difficulty: "sharp", rng: () => 0.1 });
  assert.equal(strong.kind, "raise");
});

test("easy shed plays the lowest legal card and fair shed keeps a ten", () => {
  const pool = [card("10", "s"), card("4", "h"), card("K", "d")];
  assert.equal(shedChoose(pool, "3", "easy").rank, "4");
  assert.equal(shedChoose(pool, "Q", "fair").rank, "K");
  assert.equal(shedChoose([{ r: "3", s: "s" }], "K", "sharp"), null);
});

test("peaks hint names the one-up card and not a covered one", () => {
  const hint = peaksHint([
    { r: "8", s: "spades", up: true, gone: false, covered: true },
    { r: "6", s: "hearts", up: true, gone: false, covered: false }
  ], "5");
  assert.match(hint.text, /6 hearts/);
  assert.equal(peaksHint([], "5").card, null);
});
