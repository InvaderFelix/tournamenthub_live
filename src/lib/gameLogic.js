// don't forget that score is a projection of the source of truth
// which is goals, and you'll break something if you rename that
// part of your UI for the tenth time~
// AM
export function computeScore(goals) {
  return goals.reduce(
    (score, goal) => {
      if (goal.team_id === 1) score.team1 += 1
      if (goal.team_id === 2) score.team2 += 1
      return score
    },
    { team1: 0, team2: 0 },
  )
}

// display logic for the last goal scored, e.g. "23' John Doe (#9) for Team A"
// remember to hook this up at some point in the UI, e.g. below the score or in a sidebar
// AM
export function formatLatestGoal(goals, match) {
  if (!goals.length) {
    return 'No goals yet. Waiting for match events.'
  }

  const latest = goals[goals.length - 1]
  const teamName = latest.team_id === match.team1_id
    ? match.team1_name
    : match.team2_name
  return `${latest.minute}' ${latest.player_name} (#${latest.player_number}) for ${teamName}`
}

export function getElapsedMs(match, now = Date.now()) {
  if (!match?.started_at) return 0

  const start = new Date(match.started_at).getTime()

  // if match is finished - lock duration
  if (match?.finished_at) {
    return new Date(match.finished_at).getTime() - start
  }

  const gross = now - start
  const pausedTotal = match.paused_total_ms ?? 0
  const currentPause = match.paused_at
    ? now - new Date(match.paused_at).getTime()
    : 0

  const loss = pausedTotal + currentPause // total time lost
  const net = gross - loss

  return Math.max(0, net)
}

export function formatClock(ms) {
  const minutes = String(Math.floor(ms / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  return `${minutes}:${seconds}`
}