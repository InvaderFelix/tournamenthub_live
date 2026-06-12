import './App.css'
import { useEffect, useState } from 'react'

import { Timer } from './lib/Timer'
import { AdminDrawer } from './AdminDrawer'
import { fetchMatch, fetchGoals, fetchParticipants, subscribeToUpdates, createMatch } from './lib/api'
import { computeScore, formatLatestGoal } from './lib/gameLogic'

// placeholder match data
const initialMatch = {
  id: null,
  team_1_name: 'Home United',
  team_2_name: 'Away Rangers',
  game_status: 'Pending',
  started_at: null, // default null, use Date.now() to test
  season_name: 'Season Zero',
  round_number: '1',
  venue_name: 'Venue Stadium',
  pitch_number: '2',
  game_schedule: '01/01/2026 1200-1300',
  half_time_started_at: null,
  team_1_uniform_colour: '#FF0000',
  team_2_uniform_colour: '#0000FF',
}

// main React component
function App() {
  const [matchId, setMatchId] = useState('80234720-0d61-4d21-b6cf-e54ed10ed8bb')
    // hardcoded matchID above solely for testing, replace with ''

  const [match, setMatch] = useState(initialMatch) // refer to object shape above
  const [goals, setGoals] = useState([])
  const [participants, setParticipants] = useState([])
  const [themeOn, setThemeOn] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createError, setCreateError] = useState(null)

// dark mode toggle
useEffect(() => {
  document.documentElement.dataset.theme = themeOn ? 'dark' : 'light'
}, [themeOn])

// data fetching on mount + cleanup
useEffect(() => {
  if (!matchId) return

  let isMounted = true
  async function loadInitialData() {
    const [matchData, goalsData, participantsData] = await Promise.all([
      fetchMatch(matchId),
      fetchGoals(matchId),
      fetchParticipants(matchId),
    ])

    if (!isMounted) return
    // acceptable because lifecycle is single-mount with no re-entry
    // replace if matchId can change, component can remount frequently,
    // or if concurrent fetches exist! // AM

    if (matchData) {
      setMatch(matchData)
    }

    setGoals(goalsData)
    setParticipants(participantsData)
  }

  loadInitialData()

  const unsubscribe = subscribeToUpdates(matchId,
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
}, [matchId])

// handle form submission from adminDrawer
async function handleCreateMatch(formData) {
  setCreateError(null)
  const newMatch = await createMatch(formData)

  if (newMatch) {
    setMatch(newMatch)
    setMatchId(newMatch.id)
    // setDrawerOpen(false) // Optional: keep open for multiple match creation
  } else {
    setCreateError('Failed to create match. Please try again.')
  }
}

  const score = computeScore(goals)
  // const latestGoal = formatLatestGoal(goals, match) // add with "last goal" marquee

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

        <AdminDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCreateMatch={handleCreateMatch}
          error={createError}
        />

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
          <div className="team">{/*<span className="team-suburb">{match.team_1_suburb}</span>*/}{match.team_1_name}</div>
          <div className="timer">
            {match.started_at ? (
              <Timer match={match} />
            ) : ( '00:00' )}
          </div>
          <div className="team">{/*<span className="team-suburb">{match.team_2_suburb}</span>*/}{match.team_2_name}</div>
          <div className="score">{score.team1}</div>
          <div className="status">{match.game_status}</div>
          <div className="score">{score.team2}</div>
        </div>
      </section>

      <section className="game-info">
        <div className="game-info-row cols-3">
          <p className="text-left">
            <svg className="jersey-icon" viewBox="0 0 64 64" style={{ fill: match.team_1_uniform_colour }}>
              <path d="M20 4 L8 14 L14 24 L20 20 L20 56 L44 56 L44 20 L50 24 L56 14 L44 4 L38 4 C38 8 34 10 32 10 C30 10 26 8 26 4 Z" />
            </svg>
          </p>
          <p className="text-center">{match.game_schedule}</p>
          <p className="text-right">
            <svg className="jersey-icon" viewBox="0 0 64 64" style={{ fill: match.team_2_uniform_colour }}>
              <path d="M20 4 L8 14 L14 24 L20 20 L20 56 L44 56 L44 20 L50 24 L56 14 L44 4 L38 4 C38 8 34 10 32 10 C30 10 26 8 26 4 Z" />
            </svg>
          </p>
        </div>
        <div className="game-info-row cols-2">
          <p className="text-left">{match.season_name}</p>
          <p className="text-right">Round {match.round_number}</p>
        </div>
        <div className="game-info-row cols-2">
          <p className="text-left">{match.venue_name}</p>
          <p className="text-right">Pitch {match.pitch_number}</p>
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