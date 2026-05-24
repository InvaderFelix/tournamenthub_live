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

export function formatStartedAt(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not started yet'
}