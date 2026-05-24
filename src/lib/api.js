import { supabase } from './supabaseClient'

const MATCH_ID = import.meta.env.VITE_SUPABASE_MATCH_ID || ''

export async function fetchMatch() {
  const { data, error } = await supabase
    .from('matches')
    .select('id,team1_name,team2_name,status,started_at')
    .eq('id', MATCH_ID)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

export async function fetchGoals() {
  const { data, error } = await supabase
    .from('goals')
    .select('id,team,player_name,player_number,minute,created_at')
    .eq('match_id', MATCH_ID)
    .order('minute', { ascending: true })

  if (error) {
    return []
  }
  return data ?? []
}

export async function fetchParticipants() {
  const { data, error } = await supabase
    .from('match_participants')
    .select('id,team,name,number')
    .eq('match_id', MATCH_ID)
    .order('team', { ascending: true })
    .order('number', { ascending: true })

  if (error) {
    return []
  }
  return data ?? []
}

export async function updateMatch(updates) {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', MATCH_ID)
    .select()

  if (error) {
    throw new Error('Unable to update match.')
  }
  return data[0]
}

export async function updateGoal(goal) {
  const { error } = await supabase
    .from('goals')
    .update(goal)
    .eq('id', goal.id)

  if (error) {
    throw error
  }
}

export async function recordGoal(goal) {
  const { error } = await supabase
    .from('goals')
    .insert(goal)

  if (error) {
    throw error
  }
}

export function subscribeToUpdates(onGoalUpdate, onMatchUpdate) {
  const channel = supabase
    .channel('realtime-match-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `match_id=eq.${MATCH_ID}`,
      },
      onGoalUpdate,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${MATCH_ID}`,
      },
      onMatchUpdate,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}