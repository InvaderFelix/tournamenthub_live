import './App.css'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

import { Timer } from './lib/Timer'
// import { AdminDrawer } from './AdminDrawer'
import { fetchMatch, fetchGoals, fetchParticipants, subscribeToUpdates } from './lib/api'
import { computeScore, formatLatestGoal, getElapsedMs, formatClock } from './lib/gameLogic'

// placeholder match data
const initialMatch = {
  id: null,
  team1_name: 'Home United',
  team2_name: 'Away Rangers',
  status: 'Pending',
  started_at: null,
  season: 'Season Zero',
  round_number: '1',
  venue: 'Venue Stadium',
  pitch_number: '2',
  game_times: '1200-1300',
  is_paused: false,
  half_time_started_at: null,
  team1_uniform_colour: 'Red/Gold',
  team2_uniform_colour: 'Blue/White',
}

// main React component
function App() {
  const [matchId, setMatchId] = useState('replace-with-match-id') // hardcoded for demo
  const [match, setMatch] = useState(initialMatch) // refer to object shape above
  const [goals, setGoals] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [themeOn, setThemeOn] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

// dark mode toggle
useEffect(() => {
  document.documentElement.dataset.theme = themeOn ? 'dark' : 'light'
}, [themeOn])

// data fetching on mount + cleanup
useEffect(() => {
  if (!matchId || matchId === 'replace-with-match-id') {
    setError('Inactive match ID')
    setLoading(false)
    return
  }

  let isMounted = true
  async function loadInitialData() {
    const [matchData, goalsData, participantsData] = await Promise.all([
      fetchMatch(matchId),
      fetchGoals(matchId),
      fetchParticipants(matchId),
    ])
   
    if (!isMounted) return
    // acceptable because lifecycle is single-mount and match with no re-entry...
    // replace if matchId can change, component can remount frequently,
    // or if concurrent fetches exist! /AM

    if (matchData) {
      setMatch(matchData)
    }

    setGoals(goalsData)
    setParticipants(participantsData)
    setLoading(false)
  }

  loadInitialData()
  const unsubscribe = subscribeToUpdates(
    matchId,
    async () => {
      const goalsData = await fetchGoals(matchId)
      if (isMounted) setGoals(goalsData)
    },
    (payload) => {
      if (payload.new) {
        setMatch(prev => ({ ...prev, ...payload.new }))
      }
    }
  )
  return () => {
    isMounted = false
    unsubscribe?.()
  }
}, [])

  const score = computeScore(goals)
  const latestGoal = formatLatestGoal(goals, match)

  const team1Players = participants.filter((player) => player.team === 'team1')
  const team2Players = participants.filter((player) => player.team === 'team2')

  return (
    <main className="app-container">

      <div className="topbar">
        <button
          type="button"
          className={`switch ${themeOn ? "on" : ""}`}
          onClick={() => setThemeOn(v => !v)}
          role="switch"
        >
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
          
          <span className="switch-label">
            {themeOn ? "Dark" : "Light"}
          </span>
        </button>

        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setDrawerOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <section className="scoreboard">
        <div className="scoreboard-panel">
          <div className="team">{/*<span className="team-suburb">{match.team1_suburb}</span>*/}{match.team1_name}</div>
          <div className="timer">
            {match.started_at ? (
              <Timer match={match} />
            ) : ( '00:00' )}
          </div>
          <div className="team">{/*<span className="team-suburb">{match.team2_suburb}</span>*/}{match.team2_name}</div>
          <div className="score">{score.team1}</div>
          <div className="status">{match.status}</div>
          <div className="score">{score.team2}</div>
        </div>
      </section>

      <section className="game-info">
        <div className="game-info-panel">
          <p className="game-info-panel text-left">{match.season}</p>
          <p className="game-info-panel text-right">Round {match.round_number}</p>
        </div>
        <div className="game-info-panel">
          <p className="game-info-panel text-left">{match.venue}</p>
          <p className="game-info-panel text-right">Pitch {match.pitch_number}</p>
        </div>
        <div className="game-info-panel">
          <p className="game-info-panel text-left">Game Time: {match.game_times}</p>
          <p className="game-info-panel text-right">{match.team1_uniform_colour} Jersey</p>
        </div>
      </section>

      <h3 className="section-title">Goal Summary</h3>
      <section className="goal-summary">
        <div className="goal-summary-panel">
          <div className="goal-summary-column">
            <div className="text-left"></div>
          </div>

          <div className="goal-summary-column">
            <div className="text-right"></div>
          </div>
        </div>
      </section>

      <h3 className="section-title">Participating Players</h3>
      <section className="players-section">
        <div className="players-section-panel">
          {team1Players.map(p => (
            <div key={p.id} className="home-players">
              {p.jersey_number} {p.name}
            </div>
          ))}
        </div>
        <div className="players-section-panel">
          {team2Players.map(p => (
            <div key={p.id} className="away-players">
              {p.jersey_number} {p.name}
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}

export default App