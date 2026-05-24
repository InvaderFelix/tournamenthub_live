import { useEffect, useState } from 'react'
import { fetchMatch, fetchGoals, fetchParticipants, subscribeToUpdates } from './lib/api'
import { computeScore, formatLatestGoal, formatStartedAt } from './lib/gameLogic'
import { AdminDrawer } from './AdminDrawer'
import './App.css'

const MATCH_ID = import.meta.env.VITE_SUPABASE_MATCH_ID || ''

// placeholder match data
const initialMatch = {
  id: null,
  team1_name: 'Moonee Valley Knights',
  team2_name: 'Essendon Royals',
  status: 'Kickoff Pending',
  started_at: null,
}

// timer logic
function Timer({ startedAt }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!startedAt) return '00:00'
  
  const startMs = new Date(startedAt).getTime()
  const elapsedMs = now - startMs
  const minutes = String(Math.floor(elapsedMs / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')

  return `${minutes}:${seconds}`
}
  
// main React component
function App() {
  const [match, setMatch] = useState(initialMatch)
  // match fields to include: season, age_group, round_number, venue, pitch_number
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
  if (!MATCH_ID || MATCH_ID === 'replace-with-match-id') {
    setError('Set VITE_SUPABASE_MATCH_ID in .env to the active match id.')
    setLoading(false)
    return
  }

  let isMounted = true
  async function loadInitialData() {
    const [matchData, goalsData, participantsData] = await Promise.all([
      fetchMatch(),
      fetchGoals(),
      fetchParticipants(),
    ])
    
    if (!isMounted) return

    if (matchData) {
      setMatch(matchData)
    }

    setGoals(goalsData)
    setParticipants(participantsData)
    setLoading(false)
  }

  loadInitialData()
  const unsubscribe = subscribeToUpdates(
    async () => {
      const goalsData = await fetchGoals()
      if (isMounted) setGoals(goalsData)
    },
    (payload) => {
      if (payload.new && isMounted) {
        setMatch(payload.new)
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
            {match.started_at ? ( <Timer startedAt={match.started_at} />)
            : ('00:00')}
          </div>
          <div className="team">{/*<span className="team-suburb">{match.team2_suburb}</span>*/}{match.team2_name}</div>
          <div className="score">{score.team1}</div>
          <div className="status">{match.status}</div>
          <div className="score">{score.team2}</div>
        </div>
      </section>

      <section className="game-info">
        <div className="game-info-panel">
          <p className="game-info-panel text-left">{match.season ?? "Season"}</p>
          <p className="game-info-panel text-right">{match.round_number ?? "Round #"}</p>
        </div>
        <div className="game-info-panel">
          <p className="game-info-panel text-left">{match.venue ?? "Venue"}</p>
          <p className="game-info-panel text-right">{match.pitch_number ?? "Pitch #"}</p>
        </div>
      </section>

{/* shape of goal data to be roughly 
{
  id, (datestamp_#)
  team,
  player_name,
  minute,
  second,
  player_number
}
*/}

      <h3 className="section-title">Goal Summary</h3>
      <section className="goal-summary">
        <div className="goal-summary-panel">
          <div classname="goal-summary-column">
            <div className="text-left"></div>
          </div>

          <div classname="goal-summary-column">
            <div className="text-right"></div>
          </div>
        </div>
      </section>

      <h3 className="section-title">Participating Players</h3>
      <section className="players-section">
        <div className="players-section-panel">
          {team1Players.map(p => (
            <div key={p.id} className="home-players">
              {p.player_number}
            </div>
          ))}
        </div>
        <div className="players-section-panel">
          {team2Players.map(p => (
            <div key={p.id} className="away-players">
              {p.player_number}
            </div>
          ))}
        </div>
      </section>

      {/* <AdminDrawer match={match} goals={goals} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} /> */}
    </main>
  )
}

export default App