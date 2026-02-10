const leaderboard = new Map();

export function recordWin(username) {
  leaderboard.set(username, (leaderboard.get(username) || 0) + 1);
}

export function getLeaderboard() {
  return Array.from(leaderboard.entries())
    .map(([username, wins]) => ({ username, wins }))
    .sort((a, b) => b.wins - a.wins);
}
