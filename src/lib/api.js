// API functions for fetching and updating match data from Supabase

import { supabase } from './supabaseClient'

// Read queries
// Note that game_status exists as ENUM ('pending', 'first_half', etc...)

export async function fetchMatch(matchId) {
  if (!matchId) return null

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      team_1_name,
      team_2_name,
      game_status,
      game_schedule,
      started_at,
      paused_at,
      paused_total_ms,
      restarted_at,
      finished_at,
      season_name,
      round_number,
      venue_name,
      pitch_number,
      team_1_uniform_colour,
      team_2_uniform_colour
    `)
    .eq('id', matchId)
    .maybeSingle()

  if (error) {
    console.error('fetchMatch error:', error)
    return null
  }

  return data ?? null
}

export async function fetchGoals(matchId) {
  if (!matchId) return []

  const { data, error } = await supabase
    .from('goals')
    .select(`
      id,
      match_id,
      minute,
      team_id,
      player_name,
      player_number,
      created_at
    `)
    .eq('match_id', matchId)
    .order('minute', { ascending: true })

  if (error) {
    console.error('fetchGoals error:', error)
    return []
  }

  return data || []
}

export async function fetchParticipants(matchId) {
  if (!matchId) return []

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('match_id', matchId)

  if (error) {
    console.error('fetchParticipants error:', error)
    return []
  }

  return data || []
}

// Realtime subscription

export function subscribeToUpdates(matchId, onGoalsUpdate, onMatchUpdate) {
  if (!matchId) return null

  const channel = supabase
    .channel(`match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onGoalsUpdate?.(payload)
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        onMatchUpdate?.(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Mutations & Admin actions

export async function createMatch(formData) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{
      team_1_name: formData.team_1_name,
      team_2_name: formData.team_2_name,
      season_name: formData.season_name,
      round_number: formData.round_number,
      venue_name: formData.venue_name,
      pitch_number: formData.pitch_number,
      game_schedule: formData.game_schedule,
      started_at: formData.started_at || null,
      game_status: 'pending',
    }])
    .select()
    .maybeSingle()

  if (error) {
    console.error('createMatch error:', error)
    return null
  }

  return data
}