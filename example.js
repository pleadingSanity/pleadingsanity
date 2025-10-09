const { computeLeaderboard } = require('./leaderboard')

const sample = [
  { id: 'alpha', name: 'Zen', score: 9000 },
  { id: 'beta', name: 'Nova', score: 12000 },
  { id: 'gamma', name: 'Orion', score: 12000 },
  { id: 'delta', name: 'Luna', score: 5000 }
]

console.log('Cosmic Leaderboard')
console.table(computeLeaderboard(sample))
