// don't forget that score is a projection of the source of truth which is goals,
// and you'll break something if you rename that part of your UI for the tenth time~
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

export function formatGoalTime(goal, match) {
  // manual minute override takes precedence
  if (goal.goal_time != null) {
    return `${goal.goal_time}'`
  }

  if (!match?.started_at || !goal?.created_at) {
    return `${goal.goal_time}'`
  }

  const start = new Date(match.started_at).getTime()
  const goalTime = new Date(goal.created_at).getTime()

  const pausedTotal = match.paused_total_ms ?? 0
  // note: we can't know exactly how much pause time had elapsed at the moment
  // of the goal, so we subtract total paused time as an approximation
  // AM
  const elapsedMs = Math.max(0, goalTime - start - pausedTotal)

  const minutes = Math.floor(elapsedMs / 60000)
  const seconds = Math.floor((elapsedMs % 60000) / 1000)

  return `${minutes}'${String(seconds).padStart(2, '0')}"`
}

// display logic for the last goal scored, e.g. "23' John Doe (#9) for Team A"
// remember to hook this up at some point in the UI, e.g. below the score or in a sidebar
// AM
export function formatLatestGoal(goals, match) {
  if (!goals.length) {
    return 'No goals yet. Waiting for match events.'
  }

  const latest = goals[goals.length - 1]
  const teamName = latest.team_id === 1
    ? match.team_1_name
    : match.team_2_name

  return `${formatGoalTime(latest, match)} ${latest.player_name} (#${latest.player_number}) for ${teamName}`
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