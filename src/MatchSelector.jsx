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
        {matches.map(m => (
          <button
            key={m.id}
            className="match-card"
            onClick={() => onSelectMatch(m.id)}
          >
            <span className="match-card-teams">{m.team_1_name} vs {m.team_2_name}</span>
            <span className="match-card-meta">{m.game_schedule}</span>
            <span className="match-card-meta">{m.venue_name} — Pitch {m.pitch_number}</span>
            <span className={`match-card-status status-${m.game_status}`}>{m.game_status}</span>
          </button>
        ))}
      </div>
    </main>
  )
}