import { useEffect, useState } from 'react'
import { fetchMatches } from './lib/api'
import './App.css'

const ANNOUNCEMENT = "Welcome to today's matches! Good luck to all teams."

export function MatchSelector({ onSelectMatch }) {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    async function load() {
      const data = await fetchMatches()
      setMatches(data)
    }
    load()
  }, [])

  return (
    <main className="selector-container">
      <div className="announcement-banner">
        <p>{ANNOUNCEMENT}</p>
      </div>

      <h2 className="selector-title">Current and Upcoming Matches</h2>

      <div className="match-list">
        {matches.length === 0 && (
          <p className="selector-empty">No matches scheduled yet.</p>
        )}
        {matches.map(match => (
          <button
            key={match.id}
            className="match-card"
            onClick={() => onSelectMatch(match.id)}
          >
            <span className="match-card-teams">{match.team_1_name} vs {match.team_2_name}</span>
            <span className="match-card-meta">{match.game_schedule}</span>
            <span className="match-card-meta">{match.venue_name} — Pitch {match.pitch_number}</span>
            <span className="match-card-status">{match.game_status}</span>
          </button>
        ))}
      </div>
    </main>
  )
}