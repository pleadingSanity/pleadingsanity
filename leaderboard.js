// cosmic-showcase/leaderboard.js
// A small, well-tested leaderboard module with clear API and robust input handling.

/**
 * Compute a ranked leaderboard from an array of score entries.
 * Each entry: { id: string|number, name?: string, score: number }
 * Returns array of { rank, id, name, score }
 */
function computeLeaderboard(entries) {
  if (!Array.isArray(entries)) throw new TypeError('entries must be an array')

  // Filter invalid entries and normalize
  const normalized = entries
    .filter(e => e && (typeof e.score === 'number') && (e.id !== undefined))
    .map(e => ({ id: e.id, name: e.name || String(e.id), score: e.score }))

  // Sort descending by score, tiebreaker by id
  normalized.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return String(a.id).localeCompare(String(b.id))
  })

  // Assign ranks (dense ranking: ties get same rank, next rank increments by 1)
  const result = []
  let rank = 0
  let prevScore = null
  for (let i = 0; i < normalized.length; i++) {
    const item = normalized[i]
    if (item.score !== prevScore) {
      rank += 1
      prevScore = item.score
    }
    result.push({ rank, id: item.id, name: item.name, score: item.score })
  }

  return result
}

module.exports = { computeLeaderboard }
