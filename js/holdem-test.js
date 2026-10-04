import { judge, better } from "./holdem-eval.js";
const c = (r, s) => ({ r, s });
const hands = [
  ["pair beats high", [c(12, 0), c(12, 1), c(2, 2), c(5, 3), c(7, 0)], [c(12, 0), c(11, 1), c(9, 2), c(4, 3), c(2, 0)], 1],
  ["two pair beats pair", [c(10, 0), c(10, 1), c(8, 2), c(8, 3), c(2, 0)], [c(12, 0), c(12, 1), c(7, 2), c(5, 3), c(3, 0)], 1],
  ["trips beat two pair", [c(6, 0), c(6, 1), c(6, 2), c(2, 3), c(3, 0)], [c(12, 0), c(12, 1), c(11, 2), c(11, 3), c(4, 0)], 1],
  ["straight beats trips", [c(4, 0), c(5, 1), c(6, 2), c(7, 3), c(8, 0)], [c(9, 0), c(9, 1), c(9, 2), c(2, 3), c(3, 0)], 1],
  ["flush beats straight", [c(2, 0), c(5, 0), c(7, 0), c(9, 0), c(11, 0)], [c(8, 1), c(9, 2), c(10, 3), c(11, 0), c(12, 1)], 1],
  ["full house beats flush", [c(8, 0), c(8, 1), c(8, 2), c(3, 3), c(3, 0)], [c(2, 1), c(4, 1), c(6, 1), c(9, 1), c(12, 1)], 1],
  ["four beats full house", [c(5, 0), c(5, 1), c(5, 2), c(5, 3), c(9, 0)], [c(12, 0), c(12, 1), c(12, 2), c(4, 3), c(4, 0)], 1],
  ["straight flush beats four", [c(6, 2), c(7, 2), c(8, 2), c(9, 2), c(10, 2)], [c(3, 0), c(3, 1), c(3, 2), c(3, 3), c(8, 0)], 1],
  ["wheel is a straight", [c(12, 0), c(0, 1), c(1, 2), c(2, 3), c(3, 0)], [c(12, 1), c(11, 2), c(8, 3), c(4, 0), c(2, 1)], 1],
  ["kicker breaks a pair", [c(9, 0), c(9, 1), c(12, 2), c(3, 3), c(2, 0)], [c(9, 2), c(9, 3), c(8, 0), c(3, 1), c(2, 2)], 1]
];
let failed = 0;
hands.forEach(([name, a, b, want]) => {
  const got = better(a, b) > 0 ? 1 : better(a, b) < 0 ? -1 : 0;
  const ok = got === want;
  if (!ok) failed += 1;
  console.log(ok ? "ok" : "FAIL", name, "got", got, "judge", judge(a)[0], judge(b)[0]);
});
if (failed) process.exit(1);
console.log("ten hands clean");
