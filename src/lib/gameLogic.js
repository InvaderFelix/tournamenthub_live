export function computeScore(goals) {
  return goals.reduce(
    (score, goal) => {
      if (goal.team === 'team1') score.team1 += 1
      if (goal.team === 'team2') score.team2 += 1
      return score
    },
    { team1: 0, team2: 0 },
  )
}

export function formatLatestGoal(goals, match) {
  if (!goals.length) {
    return 'No goals yet. Waiting for match events.'
  }

  const latest = goals[goals.length - 1]
  const teamName = latest.team === 'team1' ? match.team1_name : match.team2_name
  return `${latest.minute}' ${latest.player_name} (#${latest.player_number}) for ${teamName}`
}

export function getElapsedMs(match, now = Date.now()) {
  if (!match?.started_at) return 0

  if (match?.finished_at) {
    return new Date(match.finished_at).getTime() -
           new Date(match.started_at).getTime()
  }

  const start = new Date(match.started_at).getTime()
  const pausedTotal = match.paused_total_ms ?? 0

  const currentPause =
    match.is_paused && match.pause_started_at
      ? now - new Date(match.pause_started_at).getTime()
      : 0

  return Math.max(0, now - start - pausedTotal - currentPause)
}

export function formatClock(ms) {
  const minutes = String(Math.floor(ms / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  return `${minutes}:${seconds}`
}