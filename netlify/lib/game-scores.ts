// Only arcade/card scores are eligible. Reflection, moods and breathing stay private.
export const SCORE_GAMES = ['cosmic-focus', 'number-nebula', 'pattern-galaxy', 'memory-ocean',
  'rhythm-resonance', 'stardust-dash', 'solitaire', 'night-table', 'cosmic-connect', 'truth-tag'];
export function scoreEntry(value: unknown) {
  const v = value as { alias?: unknown; score?: unknown; level?: unknown };
  if (!v || typeof v.alias !== 'string' || !/^[A-Za-z][A-Za-z0-9 _-]{2,19}$/.test(v.alias)) return null;
  if (!Number.isSafeInteger(v.score) || Number(v.score) < 0 || Number(v.score) > 10_000_000) return null;
  if (!Number.isSafeInteger(v.level) || Number(v.level) < 1 || Number(v.level) > 10_000) return null;
  return { alias: v.alias, score: Number(v.score), level: Number(v.level) };
}
