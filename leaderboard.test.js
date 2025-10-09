const { computeLeaderboard } = require('./leaderboard')

test('computes leaderboard with ties and proper ranking', () => {
  const input = [
    { id: 1, name: 'Alice', score: 100 },
    { id: 2, name: 'Bob', score: 150 },
    { id: 3, name: 'Carol', score: 100 },
    { id: 4, name: 'Dave', score: 90 }
  ]

  const out = computeLeaderboard(input)
  expect(out).toEqual([
    { rank: 1, id: 2, name: 'Bob', score: 150 },
    { rank: 2, id: 1, name: 'Alice', score: 100 },
    { rank: 2, id: 3, name: 'Carol', score: 100 },
    { rank: 3, id: 4, name: 'Dave', score: 90 }
  ])
})
