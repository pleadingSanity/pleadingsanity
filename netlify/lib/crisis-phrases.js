// ==============================================================
// ONE crisis phrase list for the whole house (10 Nov 2026).
// Source of truth for every keyword safety net:
//   server: netlify/functions/arron.mts, netlify/lib/arron-tools.ts,
//           netlify/lib/solar-knowledge.ts, netlify/lib/social.ts
//   browser: js/crisis-phrases.js (GENERATED from this file by
//           scripts/build-crisis-phrases.mjs; loaded before
//           js/arron-core.js and js/arron-companion.js)
// It is the UNION of the six lists it replaced, so nothing that was
// caught before stops being caught. tests/crisis-phrases.test.mjs keeps
// the old lists frozen and fails if any copy drifts from this one.
// A false positive only adds support lines; a false negative could leave
// someone alone. Add phrases here, then run:
//   node scripts/build-crisis-phrases.mjs
// No SDK, no key, no network. Plain ES module so Node, esbuild and the
// generator can all read it.
// ==============================================================

// Each entry is a RegExp source. Entries are joined with "|" and matched
// case-insensitively against normalised text (see normaliseCrisisText).
export const CRISIS_PHRASES = [
  // From the browser lists (arron-core.js / arron-companion.js), kept unanchored as before.
  "suicid",
  "kill(?:ing)? my ?self",
  "end (?:it all|my life)",
  "take my (?:own )?life",
  "want(?:ed)? to die",
  "wanna die",
  "wish i (?:was|were) dead",
  "(?:don'?t|do not) want to (?:be here|live|wake up|exist)",
  "can'?t (?:go on|do this any ?more)",
  "self[- ]?harm",
  "hurt(?:ing)? my ?self",
  "cut(?:ting)? my ?self",
  "overdos",
  "no reason to live",
  "no point (?:in )?(?:living|going on)",
  "better off without me",
  // From the server lists (arron.mts / arron-tools.ts / solar-knowledge.ts), word-bounded as before.
  "\\bkill(?:ing)? me\\b",
  "\\bnot safe\\b",
  // From social.ts (journal, profile and post support strip), word-bounded as before.
  "\\bend(?:ing)? (?:it all|my life|things)\\b",
  "\\bbetter off dead\\b",
  // Added 10 Nov 2026: phrases every old list missed.
  "\\bend(?:ing)? it\\b",
  "\\bhang(?:ing)? my ?self\\b",
];

// Lowercase, curly quotes to straight (U+2019, U+2018, U+02BC, U+201B, U+2032, backtick),
// and every run of whitespace (including new lines) to one space.
export function normaliseCrisisText(text) {
  return String(text == null ? "" : text)
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u201B\u2032`]/g, "'")
    .replace(/\s+/g, " ");
}

export const CRISIS_REGEX = new RegExp(CRISIS_PHRASES.join("|"), "i");

export function looksLikeCrisis(text) {
  return CRISIS_REGEX.test(normaliseCrisisText(text));
}

// Drop-in for the old `CRISIS_WORDS.test(text)` call sites.
export const CRISIS_WORDS = Object.freeze({ test: looksLikeCrisis });
